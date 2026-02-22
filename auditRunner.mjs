// Supabase Security Audit Runner (Node.js ESM)
// This is the simplest entrypoint: `node auditRunner.mjs`
import { runAudit } from "./scripts/supabase-audit/runAudit.js";

await runAudit();

