// Lovable wires this to the Snowflake shared connector.
// Ensure the connector is linked to this project in Settings → Connectors → Shared connectors → Snowflake.
// The connector gateway proxies requests to Snowflake OAuth.

export async function snowflakeQuery(sql: string): Promise<Record<string, unknown>[]> {
  const res = await fetch('/api/connector/snowflake/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Snowflake query failed: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  // Snowflake SQL API response: { data: string[][], resultSetMetaData: { rowType: { name: string }[] } }
  const rs = json.result_set ?? json;
  const cols: string[] = rs.resultSetMetaData.rowType.map((c: { name: string }) => c.name);
  return rs.data.map((row: string[]) => {
    const obj: Record<string, unknown> = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}
