// Supabase Security Audit Runner
// Usage (recommended):
//   1) Create a `.env` file with:
//        SUPABASE_URL=...
//        SUPABASE_SERVICE_KEY=...
//        SUPABASE_DB_URL=postgres://...   (recommended for full RLS/policy/RPC introspection)
//   2) Run:
//        node auditRunner.mjs
//      or (TypeScript, if you install ts-node):
//        node --loader ts-node/esm auditRunner.ts
//
// Notes:
// - With only SUPABASE_URL + SUPABASE_SERVICE_KEY, PostgREST does not expose pg_catalog metadata.
//   This runner will still enumerate exposed tables/RPCs via the OpenAPI spec, but it will mark
//   RLS/policy/function-definition checks as "blocked" unless SUPABASE_DB_URL is provided.

import { runAudit } from "./scripts/supabase-audit/runAudit.js";

await runAudit();

