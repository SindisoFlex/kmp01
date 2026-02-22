import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

import { fetchPostgrestOpenApi } from "./sources/openapi.js";
import { introspectDatabase } from "./sources/pgIntrospection.js";
import { analyzeTables } from "./analysis/tables.js";
import { analyzeRpcs } from "./analysis/rpcs.js";
import { scoreFeatures } from "./scoring/features.js";
import { toMarkdown } from "./report/markdown.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function nowIso() {
  return new Date().toISOString();
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optionalEnv(name) {
  const value = process.env[name];
  return value && value.trim().length ? value : null;
}

function logStep(message) {
  // Keep logs scannable in CI/terminals.
  // eslint-disable-next-line no-console
  console.log(`[audit] ${message}`);
}

function normalizeSupabaseUrl(url) {
  return url.replace(/\/+$/, "");
}

export async function runAudit() {
  // Load .env from repo root (process.cwd()).
  dotenv.config();

  const SUPABASE_URL = normalizeSupabaseUrl(requiredEnv("SUPABASE_URL"));
  const SUPABASE_SERVICE_KEY = requiredEnv("SUPABASE_SERVICE_KEY");
  const SUPABASE_DB_URL =
    optionalEnv("SUPABASE_DB_URL") ||
    optionalEnv("DATABASE_URL") ||
    optionalEnv("SUPABASE_DATABASE_URL");

  const criticalTables = [
    "profiles",
    "bookings",
    "invoices",
    "loyalty_state",
    "loyalty_events",
    "user_tokens",
    "token_transactions",
    "user_gallery",
    "referrals",
    "account_lifecycle_warnings",
  ];

  const criticalRpcs = [
    "apply_completed_booking_to_loyalty",
    "award_tokens_on_payment",
    "track_referral_open",
    "mark_referral_registered",
  ];

  logStep("Initializing Supabase client (service role).");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    },
  });

  logStep("Fetching PostgREST OpenAPI spec to enumerate exposed tables/RPCs.");
  const openApi = await fetchPostgrestOpenApi({
    supabaseUrl: SUPABASE_URL,
    serviceKey: SUPABASE_SERVICE_KEY,
  });

  const exposed = {
    tables: openApi.tables,
    rpcs: openApi.rpcs,
    raw: openApi.raw,
  };

  const warnings = [];
  const blockers = [];

  let dbMeta = null;
  if (SUPABASE_DB_URL) {
    logStep("Connecting to Postgres for catalog introspection (RLS/policies/functions).");
    const pool = new pg.Pool({ connectionString: SUPABASE_DB_URL, max: 1 });
    try {
      dbMeta = await introspectDatabase(pool);
    } finally {
      await pool.end().catch(() => {});
    }
  } else {
    blockers.push({
      id: "missing_db_url",
      severity: "critical",
      title: "Missing SUPABASE_DB_URL",
      detail:
        "RLS status, policies, and function definitions cannot be inspected via PostgREST alone. Set SUPABASE_DB_URL (or DATABASE_URL) to enable full audit.",
    });
  }

  logStep("Analyzing table security posture (RLS + policies).");
  const tableAnalysis = analyzeTables({
    exposedTables: exposed.tables,
    dbMeta,
    criticalTables,
  });

  logStep("Analyzing RPC security posture (ownership/admin checks).");
  const rpcAnalysis = analyzeRpcs({
    exposedRpcs: exposed.rpcs,
    dbMeta,
    criticalRpcs,
  });

  warnings.push(...tableAnalysis.warnings, ...rpcAnalysis.warnings);
  blockers.push(...tableAnalysis.blockers, ...rpcAnalysis.blockers);

  logStep("Scoring system features and calculating overall progress.");
  const scoring = scoreFeatures({
    tables: tableAnalysis,
    rpcs: rpcAnalysis,
    blockers,
    warnings,
    criticalTables,
    criticalRpcs,
  });

  const report = {
    generated_at: nowIso(),
    env: {
      supabase_url: SUPABASE_URL,
      has_service_key: Boolean(SUPABASE_SERVICE_KEY),
      has_db_url: Boolean(SUPABASE_DB_URL),
    },
    exposed,
    database_introspection: dbMeta
      ? { available: true, schema: "public" }
      : { available: false, schema: "public" },
    tables: tableAnalysis,
    rpcs: rpcAnalysis,
    features: scoring.features,
    overall_progress_percent: scoring.overallProgressPercent,
    risks: {
      blockers,
      warnings,
    },
    notes: [
      "Table/RPC enumeration uses PostgREST OpenAPI, which reflects what your API exposes.",
      "Full RLS/policy/function-definition checks require a direct Postgres connection string.",
    ],
  };

  const outJson = path.resolve(process.cwd(), "SUPABASE_AUDIT_REPORT.json");
  const outMd = path.resolve(process.cwd(), "SUPABASE_AUDIT_REPORT.md");

  logStep(`Writing report: ${path.basename(outJson)} and ${path.basename(outMd)}`);
  await fs.writeFile(outJson, JSON.stringify(report, null, 2), "utf8");
  await fs.writeFile(outMd, toMarkdown(report), "utf8");

  const criticalCount = blockers.filter((b) => b.severity === "critical").length;
  const warnCount = warnings.length;

  logStep(`Done. Overall progress: ${scoring.overallProgressPercent}%`);
  logStep(`Blockers: ${blockers.length} (critical: ${criticalCount}), Warnings: ${warnCount}`);

  return report;
}

