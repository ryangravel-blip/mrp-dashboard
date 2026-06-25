import React from 'react';
import { DashData } from '../App';
import { K } from '../lib/formatters';
import { TTM_LBL, C_ACT, BRAND } from '../lib/constants';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const ORDERED_DEPTS = ['COGS: Infrastructure','COGS: Services','Engineering','Product','Customer Success','Sales','Marketing','G&A'];

interface Props { data: DashData }

export default function Headcount({ data }: Props) {
  const { hc, hcBudDept } = data;

  const trendData = TTM_LBL.map((lbl, i) => ({
    name: lbl,
    Headcount: hc.trendTotals[i],
  }));

  // Bridge chart
  const bridgeData = [
    { name: 'Apr HC', value: hc.totApr, fill: '#e5e7eb' },
    { name: 'Hires', value: hc.hires, fill: BRAND.teal },
    { name: 'Voluntary', value: -hc.vol, fill: '#fca5a5' },
    { name: 'Involuntary', value: -hc.inv, fill: '#f87171' },
    { name: 'May HC', value: hc.totMay, fill: C_ACT },
  ];

  // Dept bar chart
  const deptData = ORDERED_DEPTS.map(dept => ({
    name: dept.replace('COGS: ', ''),
    Actuals: hc.byDept[dept]?.may ?? 0,
    Budget: hcBudDept.get(dept) ?? 0,
  })).filter(d => d.Actuals > 0 || d.Budget > 0);

  return (
    <div className="space-y-4">
      {/* HC Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-300 text-[11px] text-gray-500">
              <th className="text-left px-3 py-1.5" style={{ width: 200 }}>Department</th>
              <th className="text-right px-2 py-1 border-l border-gray-200">Apr-26</th>
              <th className="text-right px-2 py-1">May-26</th>
              <th className="text-right px-2 py-1">Budget</th>
              <th className="text-right px-2 py-1">vs Bud</th>
              <th className="text-right px-2 py-1">MoM Δ</th>
            </tr>
          </thead>
          <tbody>
            {ORDERED_DEPTS.map(dept => {
              const row = hc.byDept[dept];
              if (!row && !hcBudDept.get(dept)) return null;
              const act = row?.may ?? 0;
              const apr = row?.apr ?? 0;
              const bud = hcBudDept.get(dept) ?? 0;
              const vsBud = act - bud;
              const moM = act - apr;
              return (
                <tr key={dept} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-1">{dept}</td>
                  <td className="px-2 py-1 text-right border-l border-gray-100 text-gray-500">{K(apr)}</td>
                  <td className="px-2 py-1 text-right font-medium">{K(act)}</td>
                  <td className="px-2 py-1 text-right text-gray-500">{bud ? K(bud) : '—'}</td>
                  <td className={`px-2 py-1 text-right ${act <= bud ? 'var-good' : 'var-bad'}`}>
                    {bud ? (vsBud >= 0 ? '+' : '') + K(vsBud) : '—'}
                  </td>
                  <td className={`px-2 py-1 text-right ${moM > 0 ? 'text-blue-600' : moM < 0 ? 'text-orange-500' : 'var-flat'}`}>
                    {moM >= 0 ? '+' : ''}{K(moM)}
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-gray-800 font-bold">
              <td className="px-3 py-1">Total</td>
              <td className="px-2 py-1 text-right border-l border-gray-100 text-gray-500">{K(hc.totApr)}</td>
              <td className="px-2 py-1 text-right">{K(hc.totMay)}</td>
              <td className="px-2 py-1 text-right text-gray-500">{K(hcBudDept.total())}</td>
              <td className={`px-2 py-1 text-right ${hc.totMay <= hcBudDept.total() ? 'var-good' : 'var-bad'}`}>
                {(hc.totMay - hcBudDept.total() >= 0 ? '+' : '') + K(hc.totMay - hcBudDept.total())}
              </td>
              <td className={`px-2 py-1 text-right ${(hc.totMay - hc.totApr) >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                {(hc.totMay - hc.totApr >= 0 ? '+' : '') + K(hc.totMay - hc.totApr)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bridge and Dept charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">HC Bridge (Apr → May)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bridgeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" name="Headcount">
                {bridgeData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Headcount by Dept (May-26)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Actuals" fill={C_ACT} />
              <Bar dataKey="Budget" fill="#E9FF5F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend line */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Headcount Trend (TTM)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="Headcount" stroke={C_ACT} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
