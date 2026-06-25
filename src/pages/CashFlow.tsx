import React from 'react';
import { DashData } from '../App';
import { PLTableHead, PLRow, SectionRow, SpacerRow } from '../components/PLTable';
import { QTD, YTD, YTD_LBL, C_ACT, BRAND } from '../lib/constants';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const MONTHS = ['2026-02-28','2026-03-31','2026-04-30','2026-05-31'];
const MLBL   = ['Feb-26','Mar-26','Apr-26','May-26'];

interface Props { data: DashData }

export default function CashFlow({ data }: Props) {
  const { cash, bill, kpi } = data;

  const mBillA = bill.b[QTD[0]] ?? 0;
  const mBillB = kpi.eop('BillCollect.Billings', QTD[0]);
  const mCollA = bill.c[QTD[0]] ?? 0;
  const mCollB = kpi.eop('BillCollect.Collections', QTD[0]);
  const yBillA = bill.bS(YTD);
  const yBillB = kpi.flow('BillCollect.Billings', YTD);
  const yCollA = bill.cS(YTD);
  const yCollB = kpi.flow('BillCollect.Collections', YTD);

  const mBurnA = cash.burn(QTD[0]);
  const mBurnB = kpi.eop('Adjusted_CF', QTD[0]);
  const yBurnA = cash.burnFrom('2026-01-31', QTD[0]);
  const yBurnB = kpi.flow('Adjusted_CF', YTD);

  const mCashA = cash.get(QTD[0]);
  const mCashB = kpi.eop('Cash_EOP', QTD[0]);
  const yCashA = cash.get('2026-05-31');
  const yCashB = kpi.eop('Cash_EOP', '2026-05-31');

  // cumulative burn chart
  let cumActual = 0;
  let cumBudget = 0;
  const burnChart = MONTHS.map((dt, i) => {
    cumActual += cash.burn(dt);
    cumBudget += kpi.eop('Adjusted_CF', dt);
    return {
      name: MLBL[i],
      'Actual Burn': cumActual / 1000,
      'Budget Burn': cumBudget / 1000,
    };
  });

  // billings vs collections bar
  const bcChart = MONTHS.map((dt, i) => ({
    name: MLBL[i],
    'Billings': (bill.b[dt] ?? 0) / 1000,
    'Collections': (bill.c[dt] ?? 0) / 1000,
  }));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <PLTableHead labelWidth="220px" />
          <tbody>
            <SectionRow label="Billings & Collections" />
            <PLRow label="Billings"
              mA={mBillA/1000} mB={mBillB/1000}
              qA={mBillA/1000} qB={mBillB/1000}
              yA={yBillA/1000} yB={yBillB/1000} />
            <PLRow label="Collections"
              mA={mCollA/1000} mB={mCollB/1000}
              qA={mCollA/1000} qB={mCollB/1000}
              yA={yCollA/1000} yB={yCollB/1000} />

            <SpacerRow />
            <SectionRow label="Cash Position" />
            <PLRow label="Cash Burn MoM" varDir={-1}
              mA={mBurnA/1000} mB={mBurnB/1000}
              qA={mBurnA/1000} qB={mBurnB/1000}
              yA={yBurnA/1000} yB={yBurnB/1000} />
            <PLRow label="Ending Cash" cls="row-subtotal"
              mA={mCashA/1000} mB={mCashB/1000}
              qA={mCashA/1000} qB={mCashB/1000}
              yA={yCashA/1000} yB={yCashB/1000} />
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Billings vs Collections ($K)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bcChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}K`]} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Billings" fill={C_ACT} />
              <Bar dataKey="Collections" fill={BRAND.teal} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Cumulative YTD Cash Burn ($K)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={burnChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}K`]} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Actual Burn" stroke={C_ACT} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Budget Burn" stroke="#E9FF5F" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
