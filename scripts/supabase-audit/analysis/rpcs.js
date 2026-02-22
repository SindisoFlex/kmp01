function normName(n) {
  return String(n || "").trim();
}

function extractSecuritySignals(definition) {
  const d = String(definition || "");
  const lower = d.toLowerCase();

  const signals = {
    uses_auth_uid: lower.includes("auth.uid()") || lower.includes("auth.uid"),
    checks_role: lower.includes("jwt") && (lower.includes("role") || lower.includes("claims")),
    has_security_definer: lower.includes("security definer"),
    sets_search_path: lower.includes("set search_path"),
    calls_rls_bypass: lower.includes("disable row level security"),
  };

  return signals;
}

function looksRiskyRpc(definition) {
  const s = extractSecuritySignals(definition);
  if (s.calls_rls_bypass) return { risky: true, reason: "Mentions disabling RLS" };
  if (s.has_security_definer && !s.uses_auth_uid && !s.checks_role) {
    return { risky: true, reason: "SECURITY DEFINER without auth.uid()/role checks" };
  }
  return { risky: false, reason: null };
}

export function analyzeRpcs({ exposedRpcs, dbMeta, criticalRpcs }) {
  const warnings = [];
  const blockers = [];

  const exposedSet = new Set((exposedRpcs || []).map(normName).filter(Boolean));
  const criticalSet = new Set((criticalRpcs || []).map(normName).filter(Boolean));

  const rpcs = [];
  for (const name of [...exposedSet].sort()) {
    rpcs.push({
      name,
      exposed_via_postgrest: true,
      critical: criticalSet.has(name),
      definition: dbMeta ? null : { status: "blocked" },
      signals: dbMeta ? null : { status: "blocked" },
      risks: [],
    });
  }

  if (!dbMeta) {
    return { status: "partial", rpcs, warnings, blockers };
  }

  const fnByName = dbMeta.functionByName || {};

  for (const rpc of rpcs) {
    const fn = fnByName[rpc.name];
    if (!fn) {
      rpc.risks.push({ severity: rpc.critical ? "high" : "warning", code: "no_definition", detail: "RPC is exposed but was not found in public pg_proc introspection." });
      continue;
    }

    rpc.definition = { signature: fn.signature };
    rpc.signals = extractSecuritySignals(fn.definition);

    const risk = looksRiskyRpc(fn.definition);
    if (risk.risky) {
      const finding = {
        id: `rpc_risky:${rpc.name}`,
        severity: rpc.critical ? "critical" : "high",
        title: `Risky RPC: ${rpc.name}`,
        detail: risk.reason,
      };
      blockers.push(finding);
      rpc.risks.push({ severity: finding.severity, code: "risky_rpc", detail: finding.detail });
    } else if (!rpc.signals.uses_auth_uid && !rpc.signals.checks_role) {
      const finding = {
        id: `rpc_missing_auth_signals:${rpc.name}`,
        severity: rpc.critical ? "high" : "warning",
        title: `RPC missing obvious auth checks: ${rpc.name}`,
        detail: "Function definition does not contain auth.uid() or role/claims checks (heuristic). Review authorization logic manually.",
      };
      warnings.push(finding);
      rpc.risks.push({ severity: finding.severity, code: "missing_auth_signals", detail: finding.detail });
    }
  }

  // Critical RPCs missing from exposure list may be OK, but call it out.
  for (const c of criticalSet) {
    if (!exposedSet.has(c)) {
      warnings.push({
        id: `critical_rpc_not_exposed:${c}`,
        severity: "warning",
        title: `Critical RPC not exposed via PostgREST: ${c}`,
        detail: "May be intentional. If the frontend expects it, ensure it's deployed and exposed.",
      });
    }
  }

  return { status: "ok", rpcs, warnings, blockers };
}

