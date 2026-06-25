export const N = (v: unknown, d = 0): string => {
  if (v == null || v === '') return '—';
  const n = +v;
  if (isNaN(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
};
export const K = (v: unknown, d = 0): string => {
  if (v == null || v === '') return '—';
  const n = +v;
  if (isNaN(n)) return '—';
  return N(Math.round(n), d);
};
export const KD = (v: unknown, d = 0): string => {
  if (v == null || v === '') return '—';
  const n = +v;
  if (isNaN(n)) return '—';
  return '$' + N(Math.round(n), d);
};
export const PCT = (v: unknown, d = 1): string => {
  if (v == null) return '—';
  const n = +v;
  if (isNaN(n)) return '—';
  return (n * 100).toFixed(d) + '%';
};
export const PP = (v: unknown, d = 1): string => {
  if (v == null) return '—';
  const n = +v;
  if (isNaN(n)) return '—';
  return (n >= 0 ? '+' : '') + n.toFixed(d) + 'pp';
};
export const varK = (a: unknown, b: unknown): string => {
  if (a == null || b == null) return '—';
  const v = (+a - +b) / 1e3;
  return (v >= 0 ? '+' : '') + N(Math.round(v));
};
export const varPct = (a: unknown, b: unknown): string => {
  if (!b || b == null) return '—';
  const v = (+a - +b) / Math.abs(+b);
  return (v >= 0 ? '+' : '-') + (Math.abs(v) * 100).toFixed(1) + '%';
};
export const varPP = (a: unknown, b: unknown): string => {
  if (a == null || b == null) return '—';
  return PP(+a - +b);
};
export const vc = (a: unknown, b: unknown, dir = 1): string => {
  if (a == null || b == null) return 'var-flat';
  const diff = +a - +b;
  if (Math.abs(diff) < 0.0001 * Math.abs(+(b || 1))) return 'var-flat';
  return diff * dir > 0 ? 'var-good' : 'var-bad';
};
