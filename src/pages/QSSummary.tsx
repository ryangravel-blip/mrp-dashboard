import React from 'react';
import { DashData } from '../App';
import { KD, PCT } from '../lib/formatters';
import { QTD, YTD } from '../lib/constants';

const CURRENT = '2026-05-31';

interface Props { data: DashData }

function BulletRow({ label, act, bud, fmt = 'K', dir = 1 }: {
  label: string; act: number; bud: number; fmt?: 'K' | 'PCT'; dir?: number;
}) {
  const fmtV = (v: number) => fmt === 'PCT' ? PCT(v) : KD(v / 1000);
  const diff = act - bud;
  const isGood = diff * dir > 0;
  const diffClass = Math.abs(diff) < 0.0001 * Math.abs(bud || 1) ? 'var-flat' : isGood ? 'var-good' : 'var-bad';
  const sign = diff >= 0 ? '+' : '';
  const diffFmt = fmt === 'PCT' ? `${sign}${((diff)*100).toFixed(1)}pp` : `${sign}${KD(diff/1000)}`;
  return (
    <li className="flex justify-between text-[12px] py-0.5 border-b border-gray-100">
      <span className="text-gray-700">{label}</span>
      <span className="flex gap-3">
        <span className="font-medium">{fmtV(act)}</span>
        <span className="text-gray-400">bud: {fmtV(bud)}</span>
        <span className={diffClass}>{diffFmt}</span>
      </span>
    </li>
  );
}

interface TableRowData {
  label: string;
  actM: number; budM: number;
  actY: number; budY: number;
  dir?: number;
  fmt?: 'K' | 'PCT';
}

export default function QSSummary({ data }: Props) {
  const { fin, bud, arr, cash, hc, kpi, bill, hcBudDept } = data;

  const MONTHS = ['2026-02-28','2026-03-31','2026-04-30','2026-05-31'];

  // ARR
  const newAct = arr.get(CURRENT).newArr;
  const newBud = kpi.eop('KPI.NewARR', CURRENT);
  const expAct = arr.get(CURRENT).expArr;
  const expBud = kpi.eop('KPI.ExpansionARR', CURRENT);
  const chAct  = arr.get(CURRENT).churn;
  const chBud  = kpi.eop('KPI.Downsell_Churn', CURRENT);
  const eopAct = arr.get(CURRENT).carArr;
  const eopBud = kpi.eop('KPI.Exiting_ARR', CURRENT);
  const ytdNewAct = MONTHS.reduce((s,dt)=>s+arr.get(dt).newArr,0);
  const ytdNewBud = kpi.flow('KPI.NewARR', YTD);

  // Revenue
  const mRevA = fin.revTotal(QTD); const mRevB = bud.revTotal(QTD);
  const yRevA = fin.revTotal(YTD); const yRevB = bud.revTotal(YTD);

  // Margin
  const mExpA = fin.expAllDepts(QTD); const mExpB = bud.expAllDepts(QTD);
  const yExpA = fin.expAllDepts(YTD); const yExpB = bud.expAllDepts(YTD);
  const mEbA = mRevA - mExpA; const mEbB = mRevB - mExpB;
  const yEbA = yRevA - yExpA; const yEbB = yRevB - yExpB;
  const mEmA = mRevA ? mEbA / mRevA : 0;
  const mEmB = mRevB ? mEbB / mRevB : 0;
  const yEmA = yRevA ? yEbA / yRevA : 0;
  const yEmB = yRevB ? yEbB / yRevB : 0;

  // Cash
  const cashAct  = cash.get(CURRENT);
  const cashBud  = kpi.eop('Cash_EOP', CURRENT);
  const burnAct  = cash.burn(CURRENT);
  const burnBud  = kpi.eop('Adjusted_CF', CURRENT);
  const ytdBurnA = cash.burnFrom('2026-01-31', CURRENT);
  const ytdBurnB = kpi.flow('Adjusted_CF', YTD);

  // HC
  const hcAct = hc.totMay;
  const hcBud = hcBudDept.total();

  const rows: TableRowData[] = [
    { label: 'New ARR', actM: newAct/1000, budM: newBud/1000, actY: ytdNewAct/1000, budY: ytdNewBud/1000 },
    { label: 'EOP ARR', actM: eopAct/1000, budM: eopBud/1000, actY: eopAct/1000, budY: eopBud/1000 },
    { label: 'Churn ARR', actM: chAct/1000, budM: chBud/1000, actY: chAct/1000, budY: chBud/1000, dir: -1 },
    { label: 'Total Revenue', actM: mRevA/1000, budM: mRevB/1000, actY: yRevA/1000, budY: yRevB/1000 },
    { label: 'EBITDA', actM: mEbA/1000, budM: mEbB/1000, actY: yEbA/1000, budY: yEbB/1000 },
    { label: 'EBITDA Margin', actM: mEmA, budM: mEmB, actY: yEmA, budY: yEmB, fmt: 'PCT' },
    { label: 'Cash Burn', actM: burnAct/1000, budM: burnBud/1000, actY: ytdBurnA/1000, budY: ytdBurnB/1000, dir: -1 },
    { label: 'Ending Cash', actM: cashAct/1000, budM: cashBud/1000, actY: cashAct/1000, budY: cashBud/1000 },
    { label: 'Headcount', actM: hcAct, budM: hcBud, actY: hcAct, budY: hcBud, dir: -1 },
  ];

  const fmtV = (v: number, fmt?: 'K' | 'PCT') => fmt === 'PCT' ? PCT(v) : KD(v / 1000);
  const fmtVar = (act: number, bud: number, fmt?: 'K' | 'PCT') => {
    if (fmt === 'PCT') {
      const d = (act - bud) * 100;
      return (d >= 0 ? '+' : '') + d.toFixed(1) + 'pp';
    }
    const v = (act - bud);
    return (v >= 0 ? '+' : '') + KD(v / 1000);
  };
  const varClass = (act: number, bud: number, dir = 1) => {
    const diff = act - bud;
    if (Math.abs(diff) < 0.0001 * Math.abs(bud || 1)) return 'var-flat';
    return diff * dir > 0 ? 'var-good' : 'var-bad';
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left panel: bullets */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">ARR & Bookings</h3>
          <ul className="space-y-0.5">
            <BulletRow label="New ARR (May)" act={newAct} bud={newBud} />
            <BulletRow label="Expansion ARR (May)" act={expAct} bud={expBud} />
            <BulletRow label="Churn ARR (May)" act={chAct} bud={chBud} dir={-1} />
            <BulletRow label="EOP ARR" act={eopAct} bud={eopBud} />
            <BulletRow label="YTD New ARR" act={ytdNewAct} bud={ytdNewBud} />
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Revenue & Margin</h3>
          <ul className="space-y-0.5">
            <BulletRow label="Revenue (May)" act={mRevA} bud={mRevB} />
            <BulletRow label="Revenue (YTD)" act={yRevA} bud={yRevB} />
            <BulletRow label="EBITDA (May)" act={mEbA} bud={mEbB} />
            <BulletRow label="EBITDA Margin (May)" act={mEmA} bud={mEmB} fmt="PCT" />
            <BulletRow label="EBITDA Margin (YTD)" act={yEmA} bud={yEmB} fmt="PCT" />
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">People & Cash</h3>
          <ul className="space-y-0.5">
            <BulletRow label="Headcount (May EOM)" act={hcAct} bud={hcBud} dir={-1} />
            <BulletRow label="Cash Burn (May)" act={burnAct} bud={burnBud} dir={-1} />
            <BulletRow label="Cash Burn (YTD)" act={ytdBurnA} bud={ytdBurnB} dir={-1} />
            <BulletRow label="Ending Cash" act={cashAct} bud={cashBud} />
          </ul>
        </div>
      </div>

      {/* Right panel: condensed table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-1.5 text-[10px] text-gray-400 font-normal">KPI</th>
              <th colSpan={4} className="text-center px-2 py-1.5 text-xs font-semibold text-gray-600 border-l border-gray-200">Month (May)</th>
              <th className="w-4" />
              <th colSpan={4} className="text-center px-2 py-1.5 text-xs font-semibold text-purple-600 border-l border-gray-200">YTD</th>
            </tr>
            <tr className="bg-gray-50 border-b-2 border-gray-300 text-[11px] text-gray-500">
              <th className="text-left px-3 py-1" />
              <th className="text-right px-2 py-1 border-l border-gray-200">Act</th>
              <th className="text-right px-2 py-1">Bud</th>
              <th className="text-right px-2 py-1">$Var</th>
              <th className="text-right px-2 py-1">%Var</th>
              <th className="w-4" />
              <th className="text-right px-2 py-1 border-l border-gray-200">Act</th>
              <th className="text-right px-2 py-1">Bud</th>
              <th className="text-right px-2 py-1">$Var</th>
              <th className="text-right px-2 py-1">%Var</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, actM, budM, actY, budY, dir = 1, fmt }) => {
              const mVarPct = budM ? ((actM - budM) / Math.abs(budM) * 100) : 0;
              const yVarPct = budY ? ((actY - budY) / Math.abs(budY) * 100) : 0;
              const mVar = actM - budM;
              const yVar = actY - budY;
              const mCls = varClass(actM, budM, dir);
              const yCls = varClass(actY, budY, dir);
              return (
                <tr key={label} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-1 font-medium">{label}</td>
                  <td className="px-2 py-1 text-right border-l border-gray-100">{fmtV(actM, fmt)}</td>
                  <td className="px-2 py-1 text-right text-gray-500">{fmtV(budM, fmt)}</td>
                  <td className={`px-2 py-1 text-right ${mCls}`}>{(mVar >= 0 ? '+' : '') + (fmt === 'PCT' ? (mVar * 100).toFixed(1) + 'pp' : KD(mVar / 1000))}</td>
                  <td className={`px-2 py-1 text-right ${mCls}`}>{budM ? (mVarPct >= 0 ? '+' : '') + mVarPct.toFixed(1) + '%' : '—'}</td>
                  <td className="w-4" />
                  <td className="px-2 py-1 text-right border-l border-gray-100">{fmtV(actY, fmt)}</td>
                  <td className="px-2 py-1 text-right text-gray-500">{fmtV(budY, fmt)}</td>
                  <td className={`px-2 py-1 text-right ${yCls}`}>{(yVar >= 0 ? '+' : '') + (fmt === 'PCT' ? (yVar * 100).toFixed(1) + 'pp' : KD(yVar / 1000))}</td>
                  <td className={`px-2 py-1 text-right ${yCls}`}>{budY ? (yVarPct >= 0 ? '+' : '') + yVarPct.toFixed(1) + '%' : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
