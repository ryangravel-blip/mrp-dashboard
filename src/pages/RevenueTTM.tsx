import React from 'react';
import { DashData } from '../App';
import { K } from '../lib/formatters';
import { TTM, TTM_LBL, BRAND } from '../lib/constants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const REV_TYPES = ['Subscription Revenue','Consumption Revenue','Services Revenue'];
const COLORS = [BRAND.teal, '#E9FF5F', '#f97316'];

interface Props { data: DashData }

export default function RevenueTTM({ data }: Props) {
  const { fin } = data;

  const totals = TTM.map(dt => fin.revTotal([dt]));
  const grandTTM = totals.reduce((s, v) => s + v, 0);

  const typeRows = REV_TYPES.map(rt => ({
    type: rt,
    monthly: TTM.map(dt => fin.revSum([dt], rt)),
    ttm: TTM.reduce((s, dt) => s + fin.revSum([dt], rt), 0),
  }));

  const chartData = TTM_LBL.map((lbl, i) => {
    const obj: Record<string, number | string> = { name: lbl };
    REV_TYPES.forEach(rt => {
      obj[rt] = fin.revSum([TTM[i]], rt) / 1000;
    });
    return obj;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-300 text-[11px] text-gray-500">
              <th className="text-left px-3 py-1.5" style={{ width: 180 }}>$K</th>
              {TTM_LBL.map(lbl => (
                <th key={lbl} className="text-right px-2 py-1 border-l border-gray-200">{lbl}</th>
              ))}
              <th className="text-right px-2 py-1 bg-gray-100 font-bold text-gray-700 border-l border-gray-300">TTM</th>
            </tr>
          </thead>
          <tbody>
            {typeRows.map(({ type, monthly, ttm }) => (
              <tr key={type} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-1 text-left text-gray-700">{type}</td>
                {monthly.map((v, i) => (
                  <td key={i} className="px-2 py-1 text-right border-l border-gray-100">{K(v / 1000)}</td>
                ))}
                <td className="px-2 py-1 text-right font-semibold border-l border-gray-300 bg-gray-50">{K(ttm / 1000)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-800 font-bold">
              <td className="px-3 py-1 text-left">Total Revenue</td>
              {totals.map((v, i) => (
                <td key={i} className="px-2 py-1 text-right border-l border-gray-100">{K(v / 1000)}</td>
              ))}
              <td className="px-2 py-1 text-right font-bold border-l border-gray-300 bg-gray-50">{K(grandTTM / 1000)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Revenue TTM Trend ($K)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}K`]} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            {REV_TYPES.map((rt, i) => (
              <Bar key={rt} dataKey={rt} stackId="a" fill={COLORS[i]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
