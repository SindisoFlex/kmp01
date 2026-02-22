// Introspects Postgres catalog for:
// - public schema tables
// - RLS enabled / forced
// - policies by command
// - functions (RPCs) definitions and security attributes

async function query(pool, text, params = []) {
  const res = await pool.query(text, params);
  return res.rows;
}

function cmdLabel(cmd) {
  switch (cmd) {
    case "r":
      return "select";
    case "a":
      return "insert";
    case "w":
      return "update";
    case "d":
      return "delete";
    default:
      return "all";
  }
}

export async function introspectDatabase(pool) {
  const tables = await query(
    pool,
    `
    select
      n.nspname as schema,
      c.relname as name,
      c.relkind as kind,
      c.relrowsecurity as rls_enabled,
      c.relforcerowsecurity as rls_forced
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r','p','v','m','f') -- table/partitioned/view/matview/foreign table
    order by c.relname;
  `
  );

  const policies = await query(
    pool,
    `
    select
      n.nspname as schema,
      c.relname as table_name,
      p.polname as policy_name,
      p.polcmd as command,
      array_remove(array_agg(r.rolname order by r.rolname), null) as roles,
      pg_get_expr(p.polqual, p.polrelid) as using_qual,
      pg_get_expr(p.polwithcheck, p.polrelid) as with_check
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    left join unnest(p.polroles) as prole(role_oid) on true
    left join pg_roles r on r.oid = prole.role_oid
    where n.nspname = 'public'
    group by n.nspname, c.relname, p.polname, p.polcmd, p.polqual, p.polwithcheck, p.polrelid
    order by c.relname, p.polname;
  `
  );

  const functions = await query(
    pool,
    `
    select
      n.nspname as schema,
      p.proname as name,
      pg_get_function_identity_arguments(p.oid) as identity_args,
      pg_get_functiondef(p.oid) as definition
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
    order by p.proname;
  `
  );

  // Shape to maps for quicker lookups.
  const policyByTable = new Map();
  for (const pol of policies) {
    const key = pol.table_name;
    const list = policyByTable.get(key) || [];
    list.push({
      policy_name: pol.policy_name,
      command: cmdLabel(pol.command),
      roles: pol.roles || [],
      using_qual: pol.using_qual,
      with_check: pol.with_check,
    });
    policyByTable.set(key, list);
  }

  const functionByName = new Map();
  for (const fn of functions) {
    const signature = fn.identity_args?.length ? `${fn.name}(${fn.identity_args})` : `${fn.name}()`;
    functionByName.set(fn.name, {
      name: fn.name,
      signature,
      definition: fn.definition,
    });
  }

  return {
    tables,
    policies,
    functions,
    policyByTable: Object.fromEntries(policyByTable.entries()),
    functionByName: Object.fromEntries(functionByName.entries()),
  };
}

