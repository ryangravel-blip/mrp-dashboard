import React from 'react';
import { DashData } from '../App';
import { PLTableHead, PLRow, PLRowPct, SectionRow, SpacerRow } from '../components/PLTable';
import { K } from '../lib/formatters';
import { QTD, YTD } from '../lib/constants';

const CURRENT = '2026-05-31';

interface Props { data: DashData }

export default function ExecSummary({ data }: Props) {
  const { fin, bud, arr, cash, hc, kpi } = data;

  const mArr    = arr.get(CURRENT);

  // ARR
  const newAct  = mArr.newArr;   const newBud  = kpi.eop('KPI.NewARR', CURRENT);
  const expAct  = mArr.expArr;   const expBud  = kpi.eop('KPI.ExpansionARR', CURRENT);
  const chAct   = mArr.churn;    const chBud   = kpi.eop('KPI.Downsell_Churn', CURRENT);
  const eopAct  = mArr.carArr;   const eopBud  = kpi.eop('KPI.Exiting_ARR', CURRENT);

  // YTD ARR
  const ytdNewAct = ['2026-02-28','2026-03-31','2026-04-30','2026-05-31'].reduce((s,dt)=>s+arr.get(dt).newArr,0);
  const ytdNewBud = kpi.flow('KPI.NewARR', YTD);
  const ytdExpAct = ['2026-02-28','2026-03-31','2026-04-30','2026-05-31'].reduce((s,dt)=>s+arr.get(dt).expArr,0);
  const ytdExpBud = kpi.flow('KPI.ExpansionARR', YTD);
  const ytdChAct  = ['2026-02-28','2026-03-31','2026-04-30','2026-05-31'].reduce((s,dt)=>s+arr.get(dt).churn,0);
  const ytdChBud  = kpi.flow('KPI.Downsell_Churn', YTD);
  const ytdEopAct = arr.get(CURRENT).carArr;
  const ytdEopBud = kpi.eop('KPI.Exiting_ARR', CURRENT);

  // Revenue
  const revTypes = ['Subscription Revenue','Consumption Revenue','Services Revenue'];
  const mRevA = fin.revTotal(QTD); const mRevB = bud.revTotal(QTD);
  const yRevA = fin.revTotal(YTD); const yRevB = bud.revTotal(YTD);

  // Expense & EBITDA
  const mExpA = fin.expAllDepts(QTD); const mExpB = bud.expAllDepts(QTD);
  const yExpA = fin.expAllDepts(YTD); const yExpB = bud.expAllDepts(YTD);
  const mEbA = mRevA - mExpA; const mEbB = mRevB - mExpB;
  const yEbA = yRevA - yExpA; const yEbB = yRevB - yExpB;
  const mEmA = mRevA ? mEbA / mRevA : null;
  const mEmB = mRevB ? mEbB / mRevB : null;
  const yEmA = yRevA ? yEbA / yRevA : null;
  const yEmB = yRevB ? yEbB / yRevB : null;

  // Cash
  const mBurnA = cash.burn(CURRENT); const mBurnB = kpi.eop('Adjusted_CF', CURRENT);
  const yBurnA = cash.burnFrom('2026-01-31', CURRENT); const yBurnB = kpi.flow('Adjusted_CF', YTD);
  const cashA  = cash.get(CURRENT);  const cashB  = kpi.eop('Cash_EOP', CURRENT);

  // HC
  const hcAct = hc.totMay; const hcBud = data.hcBudDept.total();
  const hcApr = hc.totApr;


  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <PLTableHead labelWidth="220px" />
          <tbody>
            <SectionRow label="ARR Movement" />
            <PLRow label="New ARR"
              mA={newAct/1000} mB={newBud/1000}
              qA={newAct/1000} qB={newBud/1000}
              yA={ytdNewAct/1000} yB={ytdNewBud/1000} />
            <PLRow label="Expansion ARR"
              mA={expAct/1000} mB={expBud/1000}
              qA={expAct/1000} qB={expBud/1000}
              yA={ytdExpAct/1000} yB={ytdExpBud/1000} />
            <PLRow label="Churn ARR" lc="label-indent"
              mA={chAct/1000} mB={chBud/1000}
              qA={chAct/1000} qB={chBud/1000}
              yA={ytdChAct/1000} yB={ytdChBud/1000}
              varDir={-1} />
            <PLRow label="EOP ARR" cls="row-subtotal"
              mA={eopAct/1000} mB={eopBud/1000}
              qA={eopAct/1000} qB={eopBud/1000}
              yA={ytdEopAct/1000} yB={ytdEopBud/1000} />

            <SpacerRow />
            <SectionRow label="Revenue" />
            <PLRow label="Total Revenue" cls="row-subtotal"
              mA={mRevA/1000} mB={mRevB/1000}
              qA={mRevA/1000} qB={mRevB/1000}
              yA={yRevA/1000} yB={yRevB/1000} />
            {revTypes.map(rt => (
              <PLRow key={rt} label={rt} lc="label-indent"
                mA={fin.revSum(QTD, rt)/1000} mB={bud.revSum(QTD, rt)/1000}
                qA={fin.revSum(QTD, rt)/1000} qB={bud.revSum(QTD, rt)/1000}
                yA={fin.revSum(YTD, rt)/1000} yB={bud.revSum(YTD, rt)/1000} />
            ))}

            <SpacerRow />
            <SectionRow label="Expenses & Profitability" />
            <PLRow label="Total Expenses" varDir={-1}
              mA={mExpA/1000} mB={mExpB/1000}
              qA={mExpA/1000} qB={mExpB/1000}
              yA={yExpA/1000} yB={yExpB/1000} />
            <PLRow label="EBITDA" cls="row-subtotal"
              mA={mEbA/1000} mB={mEbB/1000}
              qA={mEbA/1000} qB={mEbB/1000}
              yA={yEbA/1000} yB={yEbB/1000} />
            <PLRowPct label="EBITDA Margin %" cls="row-margin"
              mA={mEmA} mB={mEmB}
              qA={mEmA} qB={mEmB}
              yA={yEmA} yB={yEmB} />

            <SpacerRow />
            <SectionRow label="Cash" />
            <PLRow label="Cash Burn MoM" varDir={-1}
              mA={mBurnA/1000} mB={mBurnB/1000}
              qA={mBurnA/1000} qB={mBurnB/1000}
              yA={yBurnA/1000} yB={yBurnB/1000} />
            <PLRow label="Ending Cash" cls="row-subtotal"
              mA={cashA/1000} mB={cashB/1000}
              qA={cashA/1000} qB={cashB/1000}
              yA={cashA/1000} yB={cashB/1000} />

            <SpacerRow />
            <SectionRow label="Headcount" />
            <tr className="text-[12px]">
              <td className="px-3 py-1 text-left">Total Headcount (EOM)</td>
              <td className="px-2 py-1 text-right border-l border-gray-100">{K(hcAct)}</td>
              <td className="px-2 py-1 text-right text-gray-500">{K(hcBud)}</td>
              <td className={`px-2 py-1 text-right ${hcAct <= hcBud ? 'var-good' : 'var-bad'}`}>
                {hcAct - hcBud > 0 ? '+' : ''}{K(hcAct - hcBud)}
              </td>
              <td className="w-4" />
              <td className="px-2 py-1 text-right border-l border-gray-100">{K(hcAct)}</td>
              <td className="px-2 py-1 text-right text-gray-500">{K(hcBud)}</td>
              <td className={`px-2 py-1 text-right ${hcAct <= hcBud ? 'var-good' : 'var-bad'}`}>
                {hcAct - hcBud > 0 ? '+' : ''}{K(hcAct - hcBud)}
              </td>
              <td className="w-4" />
              <td className="px-2 py-1 text-right border-l border-gray-100">{K(hcAct)}</td>
              <td className="px-2 py-1 text-right text-gray-500">{K(hcBud)}</td>
              <td className={`px-2 py-1 text-right ${hcAct <= hcBud ? 'var-good' : 'var-bad'}`}>
                {hcAct - hcBud > 0 ? '+' : ''}{K(hcAct - hcBud)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
