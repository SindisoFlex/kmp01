function mdEscape(s) {
  return String(s ?? "").replace(/\|/g, "\\|");
}

function severityOrder(sev) {
  switch (sev) {
    case "critical":
      return 0;
    case "high":
      return 1;
    case "warning":
      return 2;
    default:
      return 3;
  }
}

export function toMarkdown(report) {
  const lines = [];
  lines.push(`# Supabase Audit Report`);
  lines.push(``);
  lines.push(`Generated: \`${report.generated_at}\``);
  lines.push(`Supabase URL: \`${report.env.supabase_url}\``);
  lines.push(`DB Introspection: \`${report.database_introspection.available ? "available" : "blocked"}\``);
  lines.push(`Overall Progress: **${report.overall_progress_percent}%**`);
  lines.push(``);

  const blockers = report?.risks?.blockers || [];
  const warnings = report?.risks?.warnings || [];

  if (blockers.length) {
    lines.push(`## Critical Blockers`);
    lines.push(``);
    for (const b of [...blockers].sort((a, c) => severityOrder(a.severity) - severityOrder(c.severity))) {
      lines.push(`- **${mdEscape(b.severity)}** \`${mdEscape(b.id)}\`: ${mdEscape(b.title)}`);
      if (b.detail) lines.push(`  - ${mdEscape(b.detail)}`);
    }
    lines.push(``);
  }

  if (warnings.length) {
    lines.push(`## Warnings`);
    lines.push(``);
    for (const w of warnings) {
      lines.push(`- **${mdEscape(w.severity)}** \`${mdEscape(w.id)}\`: ${mdEscape(w.title)}`);
      if (w.detail) lines.push(`  - ${mdEscape(w.detail)}`);
    }
    lines.push(``);
  }

  lines.push(`## Tables`);
  lines.push(``);
  lines.push(`| Table | Exposed | Critical | RLS | Policies | Risks |`);
  lines.push(`|---|---:|---:|---|---:|---|`);
  for (const t of report.tables.tables || []) {
    const rls = t.rls?.status === "blocked" ? "blocked" : (t.rls?.enabled ? "on" : "off");
    const polCount = t.policies?.status === "blocked" ? "blocked" : (t.policies?.count ?? 0);
    const risk = (t.risks || []).map((x) => `${x.severity}:${x.code}`).join(", ");
    lines.push(`| ${mdEscape(t.name)} | ${t.exposed_via_postgrest ? "yes" : "no"} | ${t.critical ? "yes" : "no"} | ${mdEscape(rls)} | ${mdEscape(polCount)} | ${mdEscape(risk)} |`);
  }
  lines.push(``);

  lines.push(`## RPCs`);
  lines.push(``);
  lines.push(`| RPC | Exposed | Critical | Signals | Risks |`);
  lines.push(`|---|---:|---:|---|---|`);
  for (const r of report.rpcs.rpcs || []) {
    const sig = r.signals?.status === "blocked"
      ? "blocked"
      : [
          r.signals?.uses_auth_uid ? "auth.uid" : null,
          r.signals?.checks_role ? "role/claims" : null,
          r.signals?.has_security_definer ? "secdef" : null,
        ].filter(Boolean).join(", ") || "none";
    const risk = (r.risks || []).map((x) => `${x.severity}:${x.code}`).join(", ");
    lines.push(`| ${mdEscape(r.name)} | ${r.exposed_via_postgrest ? "yes" : "no"} | ${r.critical ? "yes" : "no"} | ${mdEscape(sig)} | ${mdEscape(risk)} |`);
  }
  lines.push(``);

  lines.push(`## Feature Completion`);
  lines.push(``);
  lines.push(`| Feature | Weight | Completion |`);
  lines.push(`|---|---:|---:|`);
  for (const f of report.features || []) {
    lines.push(`| ${mdEscape(f.feature)} | ${f.weight} | ${f.completion_percent}% |`);
  }
  lines.push(``);

  lines.push(`## Notes`);
  lines.push(``);
  for (const n of report.notes || []) lines.push(`- ${mdEscape(n)}`);
  lines.push(``);

  return lines.join("\n");
}

