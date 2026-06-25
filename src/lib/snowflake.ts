// Proxies SQL queries through /api/query (Vercel serverless → Snowflake REST API v2 with JWT auth).
export async function snowflakeQuery(sql: string): Promise<Record<string, unknown>[]> {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Snowflake query failed: ${text.slice(0, 300)}`);
  }
  return res.json();
}
