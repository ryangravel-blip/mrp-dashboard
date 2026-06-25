import React from 'react';
import { DashData } from '../App';
import { K, vc } from '../lib/formatters';

const MONTHS = ['2026-02-28','2026-03-31','2026-04-30','2026-05-31'];
const MLBL   = ['Feb-26','Mar-26','Apr-26','May-26'];

interface Props { data: DashData }

function varKFmt(act: number, tgt: number): string {
  if (!tgt) return '—';
  const v = (act - tgt) / 1000;
  return (v >= 0 ? '+' : '') + K(Math.round(v));
}

export default function SalesPerformance({ data }: Props) {
  const { sales, tgt } = data;

  const aeNames = tgt.aeNames();
  const rvpNames = tgt.rvpNames();

  // Group AEs by manager, sorted by YTD actuals desc
  const mgrGroups: Record<string, string[]> = {};
  for (const ae of aeNames) {
    const mgr = tgt.managerOf(ae) || 'Unassigned';
    if (!mgrGroups[mgr]) mgrGroups[mgr] = [];
    mgrGroups[mgr].push(ae);
  }

  // Include RVPs as manager rows
  const allMgrs = Array.from(new Set([...rvpNames, ...Object.keys(mgrGroups)]));

  // Sort managers by YTD actuals desc
  const sortedMgrs = allMgrs.sort((a, b) => {
    const actA = MONTHS.reduce((s, dt) => s + (sales.reps[a]?.byMonth[dt] ?? 0), 0);
    const actB = MONTHS.reduce((s, dt) => s + (sales.reps[b]?.byMonth[dt] ?? 0), 0);
    return actB - actA;
  });

  // Totals
  const totalActByMonth = MONTHS.map(dt =>
    aeNames.reduce((s, ae) => s + (sales.reps[ae]?.byMonth[dt] ?? 0), 0)
  );
  const totalTgtByMonth = MONTHS.map(dt =>
    aeNames.reduce((s, ae) => s + tgt.ae(ae, [dt]), 0)
  );
  const grandAct = totalActByMonth.reduce((s, v) => s + v, 0);
  const grandTgt = totalTgtByMonth.reduce((s, v) => s + v, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-1.5 text-[10px] text-gray-400 font-normal" style={{ width: 200 }}>$K</th>
            {MLBL.map((lbl, i) => (
              <th key={i} colSpan={3} className="text-center px-2 py-1.5 text-xs font-semibold text-gray-600 border-l border-gray-200">{lbl}</th>
            ))}
            <th className="w-4" />
            <th colSpan={3} className="text-center px-2 py-1.5 text-xs font-semibold text-purple-600 border-l border-gray-200">YTD</th>
          </tr>
          <tr className="bg-gray-50 border-b-2 border-gray-300 text-[11px] text-gray-500">
            <th className="text-left px-3 py-1" />
            {MLBL.map((_, i) => (
              <React.Fragment key={i}>
                <th className="text-right px-2 py-1 border-l border-gray-200">Actuals</th>
                <th className="text-right px-2 py-1">Target</th>
                <th className="text-right px-2 py-1">vs Tgt</th>
              </React.Fragment>
            ))}
            <th className="w-4" />
            <th className="text-right px-2 py-1 border-l border-gray-200">Actuals</th>
            <th className="text-right px-2 py-1">Target</th>
            <th className="text-right px-2 py-1">vs Tgt</th>
          </tr>
        </thead>
        <tbody>
          {sortedMgrs.map(mgr => {
            const mgrActByMonth = MONTHS.map(dt => sales.reps[mgr]?.byMonth[dt] ?? 0);
            const mgrTgtByMonth = MONTHS.map(dt => tgt.rvp(mgr, [dt]));
            const mgrYtdAct = mgrActByMonth.reduce((s, v) => s + v, 0);
            const mgrYtdTgt = mgrTgtByMonth.reduce((s, v) => s + v, 0);
            const aes = mgrGroups[mgr] ?? [];
            const sortedAEs = [...aes].sort((a, b) =>
              MONTHS.reduce((s, dt) => s + (sales.reps[b]?.byMonth[dt] ?? 0), 0) -
              MONTHS.reduce((s, dt) => s + (sales.reps[a]?.byMonth[dt] ?? 0), 0)
            );

            return (
              <React.Fragment key={mgr}>
                <tr className="font-semibold bg-gray-50 border-t border-gray-300">
                  <td className="px-3 py-1">{mgr}</td>
                  {MONTHS.map((dt, i) => {
                    const act = mgrActByMonth[i];
                    const tgtV = mgrTgtByMonth[i];
                    return (
                      <React.Fragment key={i}>
                        <td className="px-2 py-1 text-right border-l border-gray-200">{K(act / 1000)}</td>
                        <td className="px-2 py-1 text-right text-gray-500">{K(tgtV / 1000)}</td>
                        <td className={`px-2 py-1 text-right ${vc(act, tgtV)}`}>{varKFmt(act, tgtV)}</td>
                      </React.Fragment>
                    );
                  })}
                  <td className="w-4" />
                  <td className="px-2 py-1 text-right border-l border-gray-200">{K(mgrYtdAct / 1000)}</td>
                  <td className="px-2 py-1 text-right text-gray-500">{K(mgrYtdTgt / 1000)}</td>
                  <td className={`px-2 py-1 text-right ${vc(mgrYtdAct, mgrYtdTgt)}`}>{varKFmt(mgrYtdAct, mgrYtdTgt)}</td>
                </tr>
                {sortedAEs.map(ae => {
                  const aeActByMonth = MONTHS.map(dt => sales.reps[ae]?.byMonth[dt] ?? 0);
                  const aeTgtByMonth = MONTHS.map(dt => tgt.ae(ae, [dt]));
                  const aeYtdAct = aeActByMonth.reduce((s, v) => s + v, 0);
                  const aeYtdTgt = aeTgtByMonth.reduce((s, v) => s + v, 0);
                  return (
                    <tr key={ae} className="border-t border-gray-100">
                      <td className="px-3 py-1 pl-6 text-gray-700">{ae}</td>
                      {MONTHS.map((_, i) => {
                        const act = aeActByMonth[i];
                        const tgtV = aeTgtByMonth[i];
                        return (
                          <React.Fragment key={i}>
                            <td className="px-2 py-1 text-right border-l border-gray-100">{K(act / 1000)}</td>
                            <td className="px-2 py-1 text-right text-gray-500">{K(tgtV / 1000)}</td>
                            <td className={`px-2 py-1 text-right ${vc(act, tgtV)}`}>{varKFmt(act, tgtV)}</td>
                          </React.Fragment>
                        );
                      })}
                      <td className="w-4" />
                      <td className="px-2 py-1 text-right border-l border-gray-100">{K(aeYtdAct / 1000)}</td>
                      <td className="px-2 py-1 text-right text-gray-500">{K(aeYtdTgt / 1000)}</td>
                      <td className={`px-2 py-1 text-right ${vc(aeYtdAct, aeYtdTgt)}`}>{varKFmt(aeYtdAct, aeYtdTgt)}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
          <tr className="font-bold border-t-2 border-gray-800">
            <td className="px-3 py-1">Total</td>
            {MONTHS.map((_, i) => {
              const act = totalActByMonth[i];
              const tgtV = totalTgtByMonth[i];
              return (
                <React.Fragment key={i}>
                  <td className="px-2 py-1 text-right border-l border-gray-100">{K(act / 1000)}</td>
                  <td className="px-2 py-1 text-right text-gray-500">{K(tgtV / 1000)}</td>
                  <td className={`px-2 py-1 text-right ${vc(act, tgtV)}`}>{varKFmt(act, tgtV)}</td>
                </React.Fragment>
              );
            })}
            <td className="w-4" />
            <td className="px-2 py-1 text-right border-l border-gray-100">{K(grandAct / 1000)}</td>
            <td className="px-2 py-1 text-right text-gray-500">{K(grandTgt / 1000)}</td>
            <td className={`px-2 py-1 text-right ${vc(grandAct, grandTgt)}`}>{varKFmt(grandAct, grandTgt)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
