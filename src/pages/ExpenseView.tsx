import React from 'react';
import { DashData } from '../App';
import { PLTableHead, PLRow, PLRowPct, SectionRow, SpacerRow } from '../components/PLTable';
import { QTD, YTD, C_ACT, C_BUD } from '../lib/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EXP_CATS = ['Headcount','Non-Headcount','Overhead','Facilities','Travel & Entertainment','Professional Services','Marketing Programs','Other'];

interface Props { data: DashData }

export default function ExpenseView({ data }: Props) {
  const { fin, bud } = data;

  const mRevA = fin.revTotal(QTD); const mRevB = bud.revTotal(QTD);
  const yRevA = fin.revTotal(YTD); const yRevB = bud.revTotal(YTD);
  const mExpA = fin.expAllDepts(QTD); const mExpB = bud.expAllDepts(QTD);
  const yExpA = fin.expAllDepts(YTD); const yExpB = bud.expAllDepts(YTD);
  const mEbA = mRevA - mExpA; const mEbB = mRevB - mExpB;
  const yEbA = yRevA - yExpA; const yEbB = yRevB - yExpB;
  const mEmA = mRevA ? mEbA / mRevA : null;
  const mEmB = mRevB ? mEbB / mRevB : null;
  const yEmA = yRevA ? yEbA / yRevA : null;
  const yEmB = yRevB ? yEbB / yRevB : null;

  // Chart: by category
  const chartData = EXP_CATS.map(cat => ({
    name: cat.length > 18 ? cat.slice(0, 16) + '…' : cat,
    Actuals: fin.expCatSum(YTD, cat) / 1000,
    Budget: bud.expCatSum(YTD, cat) / 1000,
  })).filter(d => d.Actuals > 0 || d.Budget > 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <PLTableHead labelWidth="220px" />
          <tbody>
            <SectionRow label="Expense by Category" />
            {EXP_CATS.map(cat => {
              const mA = fin.expCatSum(QTD, cat);
              const mB = bud.expCatSum(QTD, cat);
              const yA = fin.expCatSum(YTD, cat);
              const yB = bud.expCatSum(YTD, cat);
              if (Math.abs(mA) < 100 && Math.abs(yA) < 100 && Math.abs(mB) < 100 && Math.abs(yB) < 100) return null;
              return (
                <PLRow key={cat} label={cat} varDir={-1}
                  mA={mA/1000} mB={mB/1000}
                  qA={mA/1000} qB={mB/1000}
                  yA={yA/1000} yB={yB/1000} />
              );
            })}
            <PLRow label="Total Expenses" cls="row-total" varDir={-1}
              mA={mExpA/1000} mB={mExpB/1000}
              qA={mExpA/1000} qB={mExpB/1000}
              yA={yExpA/1000} yB={yExpB/1000} />

            <SpacerRow />
            <PLRow label="EBITDA" cls="row-subtotal"
              mA={mEbA/1000} mB={mEbB/1000}
              qA={mEbA/1000} qB={mEbB/1000}
              yA={yEbA/1000} yB={yEbB/1000} />
            <PLRowPct label="EBITDA Margin %" cls="row-margin"
              mA={mEmA} mB={mEmB}
              qA={mEmA} qB={mEmB}
              yA={yEmA} yB={yEmB} />
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">YTD Expense by Category ($K)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
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
