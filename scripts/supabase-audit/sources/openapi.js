function normalizeSupabaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function isRpcPath(p) {
  return p.startsWith("/rpc/");
}

function extractNameFromPath(p) {
  // Paths are like "/profiles" or "/rpc/my_fn"
  return p.replace(/^\//, "").replace(/^rpc\//, "");
}

export async function fetchPostgrestOpenApi({ supabaseUrl, serviceKey }) {
  const base = normalizeSupabaseUrl(supabaseUrl);
  const url = `${base}/rest/v1/?apikey=${encodeURIComponent(serviceKey)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch PostgREST OpenAPI (${res.status}): ${text.slice(0, 400)}`);
  }

  const raw = await res.json();
  const paths = raw?.paths || {};

  const tables = [];
  const rpcs = [];

  for (const p of Object.keys(paths)) {
    const name = extractNameFromPath(p);
    if (!name) continue;

    if (isRpcPath(p)) {
      rpcs.push(name);
    } else {
      // PostgREST exposes each table/view under "/<name>".
      // We keep it simple and treat everything non-rpc as "table-like".
      tables.push(name);
    }
  }

  tables.sort();
  rpcs.sort();

  return { tables, rpcs, raw };
}

