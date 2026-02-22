function normName(n) {
  return String(n || "").trim();
}

function isTruthyExpr(expr) {
  if (!expr) return false;
  const e = String(expr).trim().toLowerCase();
  return e === "true" || e === "(true)" || e === "((true))";
}

function mentionsAuthUid(expr) {
  if (!expr) return false;
  const e = String(expr).toLowerCase();
  return e.includes("auth.uid()") || e.includes("auth.uid") || e.includes("request.jwt");
}

function policyLooksOpen(policy) {
  // Heuristic: a policy that is literally TRUE (or missing check) is essentially open.
  // Ownership checks vary by schema; we treat missing auth.uid() references as suspicious.
  const usingOpen = !policy.using_qual || isTruthyExpr(policy.using_qual);
  const checkOpen = !policy.with_check || isTruthyExpr(policy.with_check);
  const hasOwnershipSignal = mentionsAuthUid(policy.using_qual) || mentionsAuthUid(policy.with_check);
  return (usingOpen && checkOpen) && !hasOwnershipSignal;
}

export function analyzeTables({ exposedTables, dbMeta, criticalTables }) {
  const warnings = [];
  const blockers = [];

  const exposedSet = new Set((exposedTables || []).map(normName).filter(Boolean));
  const criticalSet = new Set((criticalTables || []).map(normName).filter(Boolean));

  const resultTables = [];
  for (const name of [...exposedSet].sort()) {
    resultTables.push({
      name,
      exposed_via_postgrest: true,
      critical: criticalSet.has(name),
      rls: dbMeta ? null : { status: "blocked" },
      policies: dbMeta ? null : { status: "blocked" },
      risks: [],
    });
  }

  if (!dbMeta) {
    // Without pg_catalog, we can’t say anything definitive about RLS/policies.
    return {
      status: "partial",
      tables: resultTables,
      warnings,
      blockers,
    };
  }

  const metaByName = new Map();
  for (const t of dbMeta.tables || []) metaByName.set(t.name, t);

  const policiesByTable = dbMeta.policyByTable || {};

  for (const table of resultTables) {
    const meta = metaByName.get(table.name);
    if (!meta) {
      table.risks.push({ severity: "warning", code: "no_catalog_entry", detail: "Not found in pg_class (might be a view in another schema or not in public)." });
      continue;
    }

    const rlsEnabled = Boolean(meta.rls_enabled);
    table.rls = { enabled: rlsEnabled, forced: Boolean(meta.rls_forced), relkind: meta.kind };

    const policies = policiesByTable[table.name] || [];
    table.policies = {
      count: policies.length,
      items: policies,
    };

    if (!rlsEnabled) {
      const finding = {
        id: `table_no_rls:${table.name}`,
        severity: table.critical ? "critical" : "high",
        title: `Table without RLS: ${table.name}`,
        detail: "Row Level Security is disabled; any role with table privileges can read/write unrestricted rows.",
      };
      blockers.push(finding);
      table.risks.push({ severity: finding.severity, code: "no_rls", detail: finding.detail });
    } else if (policies.length === 0) {
      const finding = {
        id: `table_rls_no_policies:${table.name}`,
        severity: table.critical ? "high" : "warning",
        title: `RLS enabled but no policies: ${table.name}`,
        detail: "May be effectively locked down (good) or broken functionality (bad). Confirm expected access paths.",
      };
      warnings.push(finding);
      table.risks.push({ severity: finding.severity, code: "rls_no_policies", detail: finding.detail });
    }

    for (const pol of policies) {
      if (policyLooksOpen(pol)) {
        const finding = {
          id: `policy_suspicious:${table.name}:${pol.policy_name}`,
          severity: table.critical ? "high" : "warning",
          title: `Suspiciously open policy on ${table.name}: ${pol.policy_name}`,
          detail: `Policy appears permissive (USING/WITH CHECK may allow broad access) and does not reference auth.uid() heuristics.`,
        };
        warnings.push(finding);
        table.risks.push({ severity: finding.severity, code: "open_policy", detail: finding.detail });
      }
    }
  }

  // Ensure critical tables that are missing from the exposed set are still reported.
  for (const c of criticalSet) {
    if (!exposedSet.has(c)) {
      warnings.push({
        id: `critical_table_not_exposed:${c}`,
        severity: "warning",
        title: `Critical table not exposed via PostgREST: ${c}`,
        detail: "This may be intentional (good), but it can also mean your API layer isn't wired as expected.",
      });
    }
  }

  return {
    status: "ok",
    tables: resultTables,
    warnings,
    blockers,
  };
}

