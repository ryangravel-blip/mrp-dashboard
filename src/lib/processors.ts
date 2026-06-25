import { CURRENT, PREV, BOP_DT, DEPTS } from './constants';

type RevMap = Record<string, Record<string, number>>;
type ExpMap = Record<string, Record<string, Record<string, Record<string, number>>>>;

export interface FinProc {
  revSum: (months: string[], type: string) => number;
  revTotal: (months: string[]) => number;
  expSum: (months: string[], dept: string, cls: string, cat: string) => number;
  expCatSum: (months: string[], cat: string) => number;
  expDeptCatSum: (months: string[], dept: string, cat: string) => number;
  expAllDepts: (months: string[]) => number;
}

export function preProcessFin(rows: Record<string, unknown>[]): FinProc {
  const rev: RevMap = {};
  const exp: ExpMap = {};
  for (const r of rows) {
    const dt = String(r.MONTH_END_DT ?? '').slice(0, 10);
    const amt = +(r.AMT ?? 0);
    if (r.ACCOUNT_TYPE === 'Income') {
      if (!rev[dt]) rev[dt] = {};
      const rt = String(r.C_REVENUE || 'Other Revenue');
      const an = String(r.ACCOUNT_NBR || '');
      if (rt === 'Services Revenue' && an === '4020') {
        rev[dt]['Premium Services'] = (rev[dt]['Premium Services'] ?? 0) + (-amt);
      } else if (rt === 'Services Revenue' && an === '4030') {
        rev[dt]['Implementation Services'] = (rev[dt]['Implementation Services'] ?? 0) + (-amt);
      } else {
        rev[dt][rt] = (rev[dt][rt] ?? 0) + (-amt);
      }
    } else {
      if (!exp[dt]) exp[dt] = {};
      const d = String(r.C_PARENT_DEPT || '');
      const c = String(r.C_PL_CLASS || '');
      const cat = String(r.C_EXPENSE_CATEGORY || '');
      if (!exp[dt][d]) exp[dt][d] = {};
      if (!exp[dt][d][c]) exp[dt][d][c] = {};
      exp[dt][d][c][cat] = (exp[dt][d][c][cat] ?? 0) + amt;
    }
  }

  const revSum = (months: string[], type: string): number => {
    if (type === 'Services Revenue') {
      return months.reduce((s, dt) =>
        s + (rev[dt]?.['Implementation Services'] ?? 0)
          + (rev[dt]?.['Premium Services'] ?? 0)
          + (rev[dt]?.['Services Revenue'] ?? 0), 0);
    }
    return months.reduce((s, dt) => s + (rev[dt]?.[type] ?? 0), 0);
  };

  const revTotal = (months: string[]): number =>
    months.reduce((s, dt) => {
      if (!rev[dt]) return s;
      return s + Object.values(rev[dt]).reduce((a, b) => a + b, 0);
    }, 0);

  const expSum = (months: string[], dept: string, cls: string, cat: string): number =>
    months.reduce((s, dt) => {
      if (!exp[dt]) return s;
      const d = exp[dt][dept];
      if (!d) return s;
      if (cls && cat) return s + ((d[cls]?.[cat]) ?? 0);
      if (cls) {
        if (!d[cls]) return s;
        return s + Object.values(d[cls]).reduce((a, b) => a + b, 0);
      }
      return s + Object.values(d).reduce((dv, cm) =>
        dv + Object.values(cm).reduce((a, b) => a + b, 0), 0);
    }, 0);

  const expCatSum = (months: string[], cat: string): number =>
    months.reduce((s, dt) => {
      if (!exp[dt]) return s;
      return s + Object.values(exp[dt]).reduce((ds, cm) =>
        ds + Object.values(cm).reduce((cs, cats) => cs + (cats[cat] ?? 0), 0), 0);
    }, 0);

  const expDeptCatSum = (months: string[], dept: string, cat: string): number =>
    months.reduce((s, dt) => {
      if (!exp[dt]?.[dept]) return s;
      return s + Object.values(exp[dt][dept]).reduce((cs, cats) => cs + (cats[cat] ?? 0), 0);
    }, 0);

  const expAllDepts = (months: string[]): number =>
    (DEPTS as readonly string[]).reduce((s, d) => s + expSum(months, d, '', ''), 0);

  return { revSum, revTotal, expSum, expCatSum, expDeptCatSum, expAllDepts };
}

export function preProcessBudget(rows: Record<string, unknown>[]): FinProc {
  const rev: RevMap = {};
  const exp: ExpMap = {};
  for (const r of rows) {
    const dt = String(r.TIME_MONTH_END ?? '').slice(0, 10);
    const amt = +(r.BUDGET ?? 0);
    const cr = String(r.C_REVENUE || '');
    const dept = String(r.C_PARENT_DEPT || '');
    const cls = String(r.C_PL_CLASS || '');
    const cat = String(r.C_EXPENSE_CATEGORY || '');
    const ac = String(r.ACCOUNT_CODE || '');
    if (cr) {
      if (!rev[dt]) rev[dt] = {};
      if (cr === 'Services Revenue' && ac === '4025') {
        rev[dt]['Premium Services'] = (rev[dt]['Premium Services'] ?? 0) + amt;
      } else if (cr === 'Services Revenue' && ac === '4030') {
        rev[dt]['Implementation Services'] = (rev[dt]['Implementation Services'] ?? 0) + amt;
      } else {
        rev[dt][cr] = (rev[dt][cr] ?? 0) + amt;
      }
    } else if (dept) {
      if (!exp[dt]) exp[dt] = {};
      if (!exp[dt][dept]) exp[dt][dept] = {};
      if (!exp[dt][dept][cls]) exp[dt][dept][cls] = {};
      exp[dt][dept][cls][cat] = (exp[dt][dept][cls][cat] ?? 0) + amt;
    }
  }
  const revSum = (months: string[], type: string): number => {
    if (type === 'Services Revenue') {
      return months.reduce((s, dt) =>
        s + (rev[dt]?.['Implementation Services'] ?? 0)
          + (rev[dt]?.['Premium Services'] ?? 0)
          + (rev[dt]?.['Services Revenue'] ?? 0), 0);
    }
    return months.reduce((s, dt) => s + (rev[dt]?.[type] ?? 0), 0);
  };
  const revTotal = (months: string[]): number =>
    months.reduce((s, dt) => !rev[dt] ? s : s + Object.values(rev[dt]).reduce((a, b) => a + b, 0), 0);
  const expSum = (months: string[], dept: string, cls: string, cat: string): number =>
    months.reduce((s, dt) => {
      if (!exp[dt]) return s;
      const d = exp[dt][dept];
      if (!d) return s;
      if (cls && cat) return s + (d[cls]?.[cat] ?? 0);
      if (cls) { if (!d[cls]) return s; return s + Object.values(d[cls]).reduce((a, b) => a + b, 0); }
      return s + Object.values(d).reduce((dv, cm) => dv + Object.values(cm).reduce((a, b) => a + b, 0), 0);
    }, 0);
  const expCatSum = (months: string[], cat: string): number =>
    months.reduce((s, dt) => {
      if (!exp[dt]) return s;
      return s + Object.values(exp[dt]).reduce((ds, cm) =>
        ds + Object.values(cm).reduce((cs, cats) => cs + (cats[cat] ?? 0), 0), 0);
    }, 0);
  const expDeptCatSum = (months: string[], dept: string, cat: string): number =>
    months.reduce((s, dt) => {
      if (!exp[dt]?.[dept]) return s;
      return s + Object.values(exp[dt][dept]).reduce((cs, cats) => cs + (cats[cat] ?? 0), 0);
    }, 0);
  const expAllDepts = (months: string[]): number =>
    (DEPTS as readonly string[]).reduce((s, d) => s + expSum(months, d, '', ''), 0);
  return { revSum, revTotal, expSum, expCatSum, expDeptCatSum, expAllDepts };
}

export interface ARRProc {
  get: (dt: string) => { carArr: number; newArr: number; expArr: number; churn: number; upRenew: number; renewed: number };
  bop: (dt: string) => number;
}

export function preProcessARR(rows: Record<string, unknown>[]): ARRProc {
  const m: Record<string, { carArr: number; newArr: number; expArr: number; churn: number; upRenew: number; renewed: number }> = {};
  for (const r of rows) {
    const dt = String(r.MONTH_END_DT).slice(0, 10);
    m[dt] = { carArr: +(r.C_ARR ?? 0), newArr: +(r.NEW_ARR ?? 0), expArr: +(r.EXP_ARR ?? 0), churn: +(r.CHURN_ARR ?? 0), upRenew: +(r.UP_RENEWAL ?? 0), renewed: +(r.RENEWED_ARR ?? 0) };
  }
  const zero = { carArr: 0, newArr: 0, expArr: 0, churn: 0, upRenew: 0, renewed: 0 };
  const get = (dt: string) => m[dt] ?? zero;
  const prevMap: Record<string, string> = { [CURRENT]: PREV, [PREV]: '2026-02-28', '2026-02-28': BOP_DT };
  const bop = (dt: string) => { const p = prevMap[dt]; return p ? get(p).carArr : 0; };
  return { get, bop };
}

export interface CashProc {
  get: (dt: string) => number;
  burn: (dt: string) => number;
  burnFrom: (from: string, to: string) => number;
}

export function preProcessCash(rows: Record<string, unknown>[]): CashProc {
  const cashM: Record<string, number> = {};
  const stockM: Record<string, number> = {};
  for (const r of rows) {
    const dt = String(r.MONTH_END_DATE).slice(0, 10);
    const val = +(r.BALANCE ?? 0);
    if (r.ACCOUNT_CATEGORY === 'Cash') cashM[dt] = val;
    else if (r.ACCOUNT_CATEGORY === 'Equity') stockM[dt] = val;
  }
  const getCash = (dt: string) => cashM[dt] ?? 0;
  const getStock = (dt: string) => stockM[dt] ?? 0;
  const get = (dt: string) => getCash(dt);
  const prevMap: Record<string, string> = { [CURRENT]: PREV, [PREV]: '2026-02-28', '2026-02-28': BOP_DT };
  const burn = (dt: string) => {
    const p = prevMap[dt] ?? BOP_DT;
    return (getCash(dt) - getCash(p)) + (getStock(dt) - getStock(p));
  };
  const burnFrom = (from: string, to: string) =>
    (getCash(to) - getCash(from)) + (getStock(to) - getStock(from));
  return { get, burn, burnFrom };
}

export interface BCProc {
  b: Record<string, number>;
  c: Record<string, number>;
  bS: (months: string[]) => number;
  cS: (months: string[]) => number;
}

export function preProcessBC(bRows: Record<string, unknown>[], cRows: Record<string, unknown>[]): BCProc {
  const b: Record<string, number> = {};
  const c: Record<string, number> = {};
  for (const r of bRows) b[String(r.PERIOD).slice(0, 10)] = +(r.AMOUNT ?? 0);
  for (const r of cRows) c[String(r.PERIOD).slice(0, 10)] = +(r.AMOUNT ?? 0);
  const bS = (months: string[]) => months.reduce((s, dt) => s + (b[dt] ?? 0), 0);
  const cS = (months: string[]) => months.reduce((s, dt) => s + (c[dt] ?? 0), 0);
  return { b, c, bS, cS };
}

export interface HCProc {
  byDept: Record<string, { apr: number; may: number; trend: number[] }>;
  DEPTS: readonly string[];
  hires: number; vol: number; inv: number;
  totApr: number; totMay: number;
  trendTotals: number[];
}

export function preProcessHC(rows: Record<string, unknown>[], bridge: Record<string, unknown>[]): HCProc {
  const TREND_FIELDS = ['HC_JUN25','HC_JUL25','HC_AUG25','HC_SEP25','HC_OCT25','HC_NOV25','HC_DEC25','HC_JAN26','HC_FEB26','HC_MAR26','HC_APR26','HC_MAY26'];
  const byDept: Record<string, { apr: number; may: number; trend: number[] }> = {};
  for (const r of rows) {
    const d = String(r.DEPT ?? '');
    if (!byDept[d]) byDept[d] = { apr: 0, may: 0, trend: new Array(12).fill(0) };
    byDept[d].apr += +(r.HC_APR26 ?? 0);
    byDept[d].may += +(r.HC_MAY26 ?? 0);
    TREND_FIELDS.forEach((f, i) => { byDept[d].trend[i] += +(r[f as keyof typeof r] ?? 0); });
  }
  const hires = bridge.filter(r => r.EVT === 'Hire').reduce((s, r) => s + +(r.CNT ?? 0), 0);
  const vol   = bridge.filter(r => r.EVT === 'Voluntary').reduce((s, r) => s + +(r.CNT ?? 0), 0);
  const inv   = bridge.filter(r => r.EVT === 'Involuntary').reduce((s, r) => s + +(r.CNT ?? 0), 0);
  const allDepts = Object.keys(byDept);
  const totApr = allDepts.reduce((s, d) => s + (byDept[d]?.apr ?? 0), 0);
  const totMay = allDepts.reduce((s, d) => s + (byDept[d]?.may ?? 0), 0);
  const trendTotals = TREND_FIELDS.map((_, i) => allDepts.reduce((s, d) => s + (byDept[d]?.trend[i] ?? 0), 0));
  return { byDept, DEPTS, hires, vol, inv, totApr, totMay, trendTotals };
}

export interface SalesProc {
  reps: Record<string, { mgr: string; byMonth: Record<string, number> }>;
}

export function preProcessSales(rows: Record<string, unknown>[]): SalesProc {
  const reps: Record<string, { mgr: string; byMonth: Record<string, number> }> = {};
  for (const r of rows) {
    const rep = String(r.OPPORTUNITY_OWNER ?? '');
    const dt = String(r.CLOSE_MONTH ?? '').slice(0, 10);
    const mgr = String(r.ACCOUNT_RVP || '');
    if (!reps[rep]) reps[rep] = { mgr, byMonth: {} };
    reps[rep].byMonth[dt] = (reps[rep].byMonth[dt] ?? 0) + +(r.CLOSED_ARR ?? 0);
    if (mgr) reps[rep].mgr = mgr;
  }
  return { reps };
}

export interface TgtProc {
  ae: (name: string, months: string[]) => number;
  rvp: (name: string, months: string[]) => number;
  aeNames: () => string[];
  rvpNames: () => string[];
  managerOf: (name: string) => string;
}

export function preProcessSalesTargets(rows: Record<string, unknown>[]): TgtProc {
  const mMap: Record<string, string> = {
    '2026-02-01': '2026-02-28', '2026-03-01': '2026-03-31',
    '2026-04-01': '2026-04-30', '2026-05-01': '2026-05-31',
  };
  const ae: Record<string, Record<string, number>> = {};
  const rvp: Record<string, Record<string, number>> = {};
  const aeManager: Record<string, string> = {};
  for (const r of rows) {
    const dt = mMap[String(r.MONTH_START ?? '').slice(0, 10)];
    if (!dt) continue;
    const name = String(r.NAME || '');
    const val = +(r.TARGET ?? 0);
    const mgr = String(r.MANAGER_NAME || '');
    if (r.ROLE_TYPE === 'AE') {
      if (!ae[name]) ae[name] = {};
      ae[name][dt] = val;
      if (mgr && !aeManager[name]) aeManager[name] = mgr;
    } else if (r.ROLE_TYPE === 'RVP') {
      if (!rvp[name]) rvp[name] = {};
      rvp[name][dt] = val;
    }
  }
  const get = (map: Record<string, Record<string, number>>, name: string, months: string[]) =>
    months.reduce((s, dt) => s + (map[name]?.[dt] ?? 0), 0);
  const fuzzyKey = (map: Record<string, Record<string, number>>, name: string): string => {
    if (map[name]) return name;
    const p = name.trim().split(/\s+/);
    if (p.length < 2) return name;
    const fi = p[0][0].toLowerCase(), ln = p[p.length - 1].toLowerCase();
    return Object.keys(map).find(k => {
      const kp = k.trim().split(/\s+/);
      return kp.length >= 2 && kp[0][0].toLowerCase() === fi && kp[kp.length - 1].toLowerCase() === ln;
    }) ?? name;
  };
  return {
    ae: (name, months) => get(ae, name, months),
    rvp: (name, months) => get(rvp, fuzzyKey(rvp, name), months),
    aeNames: () => Object.keys(ae),
    rvpNames: () => Object.keys(rvp),
    managerOf: (name) => aeManager[name] ?? '',
  };
}

export interface HCBudDeptProc {
  get: (dept: string) => number | null;
  total: () => number;
}

export function preProcessHCBudgetDept(rows: Record<string, unknown>[]): HCBudDeptProc {
  const m: Record<string, number> = {};
  for (const r of rows) m[String(r.C_PARENT_DEPT)] = Math.round(+(r.BUDGET ?? 0));
  return {
    get: (dept) => m[dept] ?? null,
    total: () => Object.values(m).reduce((s, v) => s + v, 0),
  };
}

export interface KPIProc {
  flow: (code: string, months: string[]) => number;
  eop: (code: string, dt: string) => number;
  bopFY: () => number;
}

export function preProcessKPI(rows: Record<string, unknown>[]): KPIProc {
  const d: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const code = String(r.ACCOUNT_CODE);
    const dt = String(r.TIME_MONTH_END ?? '').slice(0, 10);
    const val = +(r.BUDGET ?? 0);
    if (!d[code]) d[code] = {};
    d[code][dt] = val;
  }
  const flow = (code: string, months: string[]) => months.reduce((s, dt) => s + (d[code]?.[dt] ?? 0), 0);
  const eop = (code: string, dt: string) => d[code]?.[dt] ?? 0;
  const bopFY = () => {
    const eopFeb = eop('KPI.Exiting_ARR', '2026-02-28');
    const newFeb = eop('KPI.NewARR', '2026-02-28');
    const expFeb = eop('KPI.ExpansionARR', '2026-02-28');
    const chnFeb = eop('KPI.Downsell_Churn', '2026-02-28');
    return eopFeb - newFeb - expFeb - chnFeb;
  };
  return { flow, eop, bopFY };
}
