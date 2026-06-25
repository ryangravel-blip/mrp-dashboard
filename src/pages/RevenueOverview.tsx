import React from 'react';
import { DashData } from '../App';
import { PLTableHead, PLRow, SectionRow, SpacerRow } from '../components/PLTable';
import { QTD, YTD, C_ACT, C_BUD } from '../lib/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MONTHS = ['2026-02-28','2026-03-31','2026-04-30','2026-05-31'];
const MLBL   = ['Feb-26','Mar-26','Apr-26','May-26'];
const REV_TYPES = ['Subscription Revenue','Consumption Revenue','Services Revenue'];

interface Props { data: DashData }

export default function RevenueOverview({ data }: Props) {
  const { fin, bud } = data;

  const mRevA = fin.revTotal(QTD); const mRevB = bud.revTotal(QTD);
  const yRevA = fin.revTotal(YTD); const yRevB = bud.revTotal(YTD);

  const chartData = MONTHS.map((dt, i) => ({
    name: MLBL[i],
    'Actuals': fin.revTotal([dt]) / 1000,
    'Budget': bud.revTotal([dt]) / 1000,
  }));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <PLTableHead labelWidth="220px" />
          <tbody>
            <SectionRow label="Revenue by Type" />
            {REV_TYPES.map(rt => (
              <PLRow key={rt} label={rt}
                mA={fin.revSum(QTD, rt)/1000} mB={bud.revSum(QTD, rt)/1000}
                qA={fin.revSum(QTD, rt)/1000} qB={bud.revSum(QTD, rt)/1000}
                yA={fin.revSum(YTD, rt)/1000} yB={bud.revSum(YTD, rt)/1000} />
            ))}
            <PLRow label="Total Revenue" cls="row-total"
              mA={mRevA/1000} mB={mRevB/1000}
              qA={mRevA/1000} qB={mRevB/1000}
              yA={yRevA/1000} yB={yRevB/1000} />
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Revenue Actuals vs Budget by Month ($K)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}K`]} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Actuals" fill={C_ACT} />
            <Bar dataKey="Budget" fill={C_BUD} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
