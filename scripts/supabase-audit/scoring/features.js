function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function pct(n) {
  return clamp(Math.round(n), 0, 100);
}

function countBySeverity(findings, severity) {
  return (findings || []).filter((f) => f.severity === severity).length;
}

function hasTable(tables, name) {
  return (tables?.tables || []).some((t) => t.name === name);
}

function hasRpc(rpcs, name) {
  return (rpcs?.rpcs || []).some((r) => r.name === name);
}

function tableSecurityScore(tables, criticalTables) {
  if (!tables || tables.status === "partial") return 25;
  const byName = new Map((tables.tables || []).map((t) => [t.name, t]));
  let score = 100;
  for (const name of criticalTables) {
    const t = byName.get(name);
    if (!t) continue;
    if (t.rls?.enabled === false) score -= 20;
    if (t.policies?.count === 0) score -= 5;
  }
  return clamp(score, 0, 100);
}

function rpcSecurityScore(rpcs, criticalRpcs) {
  if (!rpcs || rpcs.status === "partial") return 25;
  const byName = new Map((rpcs.rpcs || []).map((r) => [r.name, r]));
  let score = 100;
  for (const name of criticalRpcs) {
    const r = byName.get(name);
    if (!r) continue;
    const hasCriticalRisk = (r.risks || []).some((x) => x.severity === "critical");
    const hasHighRisk = (r.risks || []).some((x) => x.severity === "high");
    if (hasCriticalRisk) score -= 40;
    else if (hasHighRisk) score -= 20;
  }
  return clamp(score, 0, 100);
}

export function scoreFeatures({
  tables,
  rpcs,
  blockers,
  warnings,
  criticalTables,
  criticalRpcs,
}) {
  // Feature weights sum to 100.
  const features = [
    { key: "signup", weight: 6 },
    { key: "login", weight: 6 },
    { key: "logout", weight: 2 },
    { key: "password_reset", weight: 4 },
    { key: "email_verification", weight: 4 },
    { key: "profile_management", weight: 8 },
    { key: "role_based_access", weight: 10 },
    { key: "session_management", weight: 6 },
    { key: "audit_logging", weight: 6 },
    { key: "bookings", weight: 12 },
    { key: "payments_invoices", weight: 12 },
    { key: "loyalty", weight: 8 },
    { key: "referrals", weight: 8 },
    { key: "tokens", weight: 8 },
  ];

  const criticalBlockers = countBySeverity(blockers, "critical");
  const highBlockers = countBySeverity(blockers, "high");

  const tblSec = tableSecurityScore(tables, criticalTables);
  const rpcSec = rpcSecurityScore(rpcs, criticalRpcs);

  const baseInfra = (tblSec * 0.6) + (rpcSec * 0.4);

  const perFeature = {};

  // Auth features (heuristic): assume Supabase Auth exists; security depends on RLS/RPC posture.
  perFeature.signup = pct(70 + (baseInfra - 60) * 0.5);
  perFeature.login = pct(70 + (baseInfra - 60) * 0.5);
  perFeature.logout = pct(80);
  perFeature.password_reset = pct(75);
  perFeature.email_verification = pct(60);
  perFeature.session_management = pct(70);

  // Domain features based on presence of tables/RPCs and security posture.
  perFeature.profile_management = pct(
    (hasTable(tables, "profiles") ? 60 : 30) + (tblSec - 60) * 0.5
  );
  perFeature.role_based_access = pct(40 + (baseInfra * 0.6));
  perFeature.audit_logging = pct(30); // often not wired; keep conservative unless you add explicit signals later.

  perFeature.bookings = pct(
    (hasTable(tables, "bookings") ? 60 : 20) + (tblSec - 60) * 0.4
  );
  perFeature.payments_invoices = pct(
    (hasTable(tables, "invoices") ? 60 : 20) + (tblSec - 60) * 0.4
  );
  perFeature.loyalty = pct(
    (hasTable(tables, "loyalty_state") || hasTable(tables, "loyalty_events") ? 55 : 20) +
      (rpcSec - 60) * 0.3
  );
  perFeature.referrals = pct(
    (hasTable(tables, "referrals") ? 55 : 20) + (rpcSec - 60) * 0.3
  );
  perFeature.tokens = pct(
    (hasTable(tables, "user_tokens") || hasTable(tables, "token_transactions") ? 55 : 20) +
      (rpcSec - 60) * 0.3
  );

  // Penalize regressions for critical/high blockers.
  const penalty = clamp((criticalBlockers * 10) + (highBlockers * 4), 0, 60);

  let weighted = 0;
  for (const f of features) weighted += (perFeature[f.key] * f.weight) / 100;
  const overall = pct(weighted - penalty);

  const featureReport = features.map((f) => ({
    feature: f.key,
    weight: f.weight,
    completion_percent: perFeature[f.key],
  }));

  return {
    features: featureReport,
    overallProgressPercent: overall,
    signals: {
      table_security_score: tblSec,
      rpc_security_score: rpcSec,
      penalty,
    },
  };
}

