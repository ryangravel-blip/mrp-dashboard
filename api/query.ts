import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

function buildJWT(account: string, username: string, privateKeyPem: string): string {
  const acc = account.toUpperCase();
  const usr = username.toUpperCase();

  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const publicKey = crypto.createPublicKey(privateKey);
  const pubDer = publicKey.export({ type: 'spki', format: 'der' }) as Buffer;
  const fingerprint = 'SHA256:' + crypto.createHash('sha256').update(pubDer).digest('base64');

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: `${acc}.${usr}.${fingerprint}`,
    sub: `${acc}.${usr}`,
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const data = `${header}.${payload}`;
  const sig = crypto.sign('sha256', Buffer.from(data), privateKey);
  return `${data}.${sig.toString('base64url')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sql } = req.body ?? {};
  if (!sql) return res.status(400).json({ error: 'Missing sql' });

  const account   = process.env.SNOWFLAKE_ACCOUNT!;
  const username  = process.env.SNOWFLAKE_USERNAME!;
  const warehouse = process.env.SNOWFLAKE_WAREHOUSE!;
  const database  = process.env.SNOWFLAKE_DATABASE ?? 'load';
  const role      = process.env.SNOWFLAKE_ROLE!;
  // Vercel env vars store newlines as \n literals — restore them
  const privateKeyPem = (process.env.SNOWFLAKE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

  let jwt: string;
  try {
    jwt = buildJWT(account, username, privateKeyPem);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: `JWT build failed: ${msg}` });
  }

  const url = `https://${account.toLowerCase()}.snowflakecomputing.com/api/v2/statements?requestId=${crypto.randomUUID()}`;

  let sfRes: Response;
  try {
    sfRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Snowflake-Authorization-Token-Type': 'KEYPAIR_JWT',
      },
      body: JSON.stringify({ statement: sql, warehouse, database, role, timeout: 60 }),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(502).json({ error: `Network error: ${msg}` });
  }

  if (!sfRes.ok) {
    const errText = await sfRes.text();
    return res.status(sfRes.status).json({ error: errText.slice(0, 500) });
  }

  const body = await sfRes.json();

  // Convert Snowflake columnar format → array of row objects
  const cols: string[] = (body.resultSetMetaData?.rowType ?? []).map((c: { name: string }) => c.name);
  const rows = (body.data ?? []).map((row: string[]) => {
    const obj: Record<string, unknown> = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });

  return res.json(rows);
}
