import React from 'react';
import { K, PCT, PP, varPct, varPP, vc } from '../lib/formatters';

interface RowOpts {
  cls?: string;
  lc?: string;
  varDir?: 1 | -1;
  varFmt?: 'pct' | 'pp';
  fmtFn?: (v: unknown) => string;
}

export function PLTableHead({ labelWidth = '200px' }: { labelWidth?: string }) {
  return (
    <thead>
      <tr className="bg-gray-50 border-b border-gray-200">
        <th className="text-left px-3 py-1.5 text-[10px] text-gray-400 font-normal" style={{ width: labelWidth }}>$K</th>
        <th colSpan={3} className="text-center px-2 py-1.5 text-xs font-semibold text-gray-600 border-l border-gray-200">Month (May)</th>
        <th className="w-4" />
        <th colSpan={3} className="text-center px-2 py-1.5 text-xs font-semibold text-blue-600 border-l border-gray-200">QTD (May)</th>
        <th className="w-4" />
        <th colSpan={3} className="text-center px-2 py-1.5 text-xs font-semibold text-purple-600 border-l border-gray-200">YTD (Feb–May)</th>
      </tr>
      <tr className="bg-gray-50 border-b-2 border-gray-300 text-[11px] text-gray-500">
        <th className="text-left px-3 py-1" />
        <th className="text-right px-2 py-1 border-l border-gray-200">Actuals</th>
        <th className="text-right px-2 py-1">Budget</th>
        <th className="text-right px-2 py-1">vs Bud</th>
        <th className="w-4" />
        <th className="text-right px-2 py-1 border-l border-gray-200">Actuals</th>
        <th className="text-right px-2 py-1">Budget</th>
        <th className="text-right px-2 py-1">vs Bud</th>
        <th className="w-4" />
        <th className="text-right px-2 py-1 border-l border-gray-200">Actuals</th>
        <th className="text-right px-2 py-1">Budget</th>
        <th className="text-right px-2 py-1">vs Bud</th>
      </tr>
    </thead>
  );
}

export function SectionRow({ label, cols = 13 }: { label: string; cols?: number }) {
  return (
    <tr className="row-section">
      <td colSpan={cols} className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-50">{label}</td>
    </tr>
  );
}

export function SpacerRow({ cols = 13 }: { cols?: number }) {
  return <tr><td colSpan={cols} className="h-2" /></tr>;
}

export function PLRow({
  label, mA, mB, qA, qB, yA, yB,
  cls = '', lc = '', varDir = 1, varFmt = 'pct', fmtFn = K,
}: {
  label: string; mA: number | null; mB: number | null;
  qA: number | null; qB: number | null; yA: number | null; yB: number | null;
} & RowOpts) {
  const vf = varFmt === 'pp'
    ? (a: unknown, b: unknown) => varPP(a, b)
    : (a: unknown, b: unknown) => varPct(a, b);

  const rowCls = [
    'text-[12px]',
    cls === 'row-total' ? 'font-bold border-t-2 border-gray-800' :
    cls === 'row-subtotal' ? 'font-semibold border-t border-gray-300' :
    cls === 'row-margin' ? 'italic text-gray-500 text-[11px]' : '',
  ].filter(Boolean).join(' ');

  const labelCls = lc === 'label-indent' ? 'pl-6' : '';

  return (
    <tr className={rowCls}>
      <td className={`px-3 py-1 text-left ${labelCls}`}>{label}</td>
      <td className="px-2 py-1 text-right border-l border-gray-100">{fmtFn(mA)}</td>
      <td className="px-2 py-1 text-right text-gray-500">{fmtFn(mB)}</td>
      <td className={`px-2 py-1 text-right ${vc(mA, mB, varDir)}`}>{vf(mA, mB)}</td>
      <td className="w-4" />
      <td className="px-2 py-1 text-right border-l border-gray-100">{fmtFn(qA)}</td>
      <td className="px-2 py-1 text-right text-gray-500">{fmtFn(qB)}</td>
      <td className={`px-2 py-1 text-right ${vc(qA, qB, varDir)}`}>{vf(qA, qB)}</td>
      <td className="w-4" />
      <td className="px-2 py-1 text-right border-l border-gray-100">{fmtFn(yA)}</td>
      <td className="px-2 py-1 text-right text-gray-500">{fmtFn(yB)}</td>
      <td className={`px-2 py-1 text-right ${vc(yA, yB, varDir)}`}>{vf(yA, yB)}</td>
    </tr>
  );
}

export function PLRowPct({
  label, mA, mB, qA, qB, yA, yB, cls = '', lc = '', varDir = 1,
}: {
  label: string; mA: number | null; mB: number | null;
  qA: number | null; qB: number | null; yA: number | null; yB: number | null;
} & RowOpts) {
  const f = (v: unknown) => v == null ? '—' : PCT(v);
  const vf = (a: unknown, b: unknown) => a == null || b == null ? '—' : PP((+a - +b) * 100);
  const rowCls = [
    'text-[12px]',
    cls === 'row-total' ? 'font-bold border-t-2 border-gray-800' :
    cls === 'row-subtotal' ? 'font-semibold border-t border-gray-300' :
    cls === 'row-margin' ? 'italic text-gray-500 text-[11px]' : '',
  ].filter(Boolean).join(' ');
  const labelCls = lc === 'label-indent' ? 'pl-6' : '';

  return (
    <tr className={rowCls}>
      <td className={`px-3 py-1 text-left ${labelCls}`}>{label}</td>
      <td className="px-2 py-1 text-right border-l border-gray-100">{f(mA)}</td>
      <td className="px-2 py-1 text-right text-gray-500">{f(mB)}</td>
      <td className={`px-2 py-1 text-right ${vc(mA, mB, varDir)}`}>{vf(mA, mB)}</td>
      <td className="w-4" />
      <td className="px-2 py-1 text-right border-l border-gray-100">{f(qA)}</td>
      <td className="px-2 py-1 text-right text-gray-500">{f(qB)}</td>
      <td className={`px-2 py-1 text-right ${vc(qA, qB, varDir)}`}>{vf(qA, qB)}</td>
      <td className="w-4" />
      <td className="px-2 py-1 text-right border-l border-gray-100">{f(yA)}</td>
      <td className="px-2 py-1 text-right text-gray-500">{f(yB)}</td>
      <td className={`px-2 py-1 text-right ${vc(yA, yB, varDir)}`}>{vf(yA, yB)}</td>
    </tr>
  );
}
