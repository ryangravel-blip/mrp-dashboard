import React from 'react';
import { DashData } from '../App';
import { PLTableHead, PLRow, PLRowPct, SectionRow, SpacerRow } from '../components/PLTable';
import { QTD, YTD, DEPTS } from '../lib/constants';

const OPEX_DEPTS = ['Engineering','Product','Customer Success','Sales','Marketing','G&A'];
const COGS_CATS = ['Headcount','Non-Headcount','Overhead'];

interface Props { data: DashData }

export default function DeptView({ data }: Props) {
  const { fin, bud } = data;

  const mRevA = fin.revTotal(QTD); const mRevB = bud.revTotal(QTD);
  const yRevA = fin.revTotal(YTD); const yRevB = bud.revTotal(YTD);

  const mInfraA = fin.expSum(QTD, 'COGS: Infrastructure', '', '');
  const mInfraB = bud.expSum(QTD, 'COGS: Infrastructure', '', '');
  const yInfraA = fin.expSum(YTD, 'COGS: Infrastructure', '', '');
  const yInfraB = bud.expSum(YTD, 'COGS: Infrastructure', '', '');

  const mSvcA = fin.expSum(QTD, 'COGS: Services', '', '');
  const mSvcB = bud.expSum(QTD, 'COGS: Services', '', '');
  const ySvcA = fin.expSum(YTD, 'COGS: Services', '', '');
  const ySvcB = bud.expSum(YTD, 'COGS: Services', '', '');

  const mCOGSA = mInfraA + mSvcA; const mCOGSB = mInfraB + mSvcB;
  const yCOGSA = yInfraA + ySvcA; const yCOGSB = yInfraB + ySvcB;

  const mGPA = mRevA - mCOGSA; const mGPB = mRevB - mCOGSB;
  const yGPA = yRevA - yCOGSA; const yGPB = yRevB - yCOGSB;
  const mGMActPct = mRevA ? mGPA / mRevA : null;
  const mGMBudPct = mRevB ? mGPB / mRevB : null;
  const yGMActPct = yRevA ? yGPA / yRevA : null;
  const yGMBudPct = yRevB ? yGPB / yRevB : null;

  const opexDeptTotals = OPEX_DEPTS.map(dept => ({
    dept,
    mA: fin.expSum(QTD, dept, '', ''),
    mB: bud.expSum(QTD, dept, '', ''),
    yA: fin.expSum(YTD, dept, '', ''),
    yB: bud.expSum(YTD, dept, '', ''),
  }));

  const mOpexA = opexDeptTotals.reduce((s, d) => s + d.mA, 0);
  const mOpexB = opexDeptTotals.reduce((s, d) => s + d.mB, 0);
  const yOpexA = opexDeptTotals.reduce((s, d) => s + d.yA, 0);
  const yOpexB = opexDeptTotals.reduce((s, d) => s + d.yB, 0);

  const mEbA = mRevA - mCOGSA - mOpexA; const mEbB = mRevB - mCOGSB - mOpexB;
  const yEbA = yRevA - yCOGSA - yOpexA; const yEbB = yRevB - yCOGSB - yOpexB;
  const mEmA = mRevA ? mEbA / mRevA : null;
  const mEmB = mRevB ? mEbB / mRevB : null;
  const yEmA = yRevA ? yEbA / yRevA : null;
  const yEmB = yRevB ? yEbB / yRevB : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <PLTableHead labelWidth="220px" />
        <tbody>
          <SectionRow label="Revenue" />
          <PLRow label="Total Revenue" cls="row-subtotal"
            mA={mRevA/1000} mB={mRevB/1000}
            qA={mRevA/1000} qB={mRevB/1000}
            yA={yRevA/1000} yB={yRevB/1000} />

          <SpacerRow />
          <SectionRow label="Cost of Goods Sold" />
          <PLRow label="COGS: Infrastructure" varDir={-1}
            mA={mInfraA/1000} mB={mInfraB/1000}
            qA={mInfraA/1000} qB={mInfraB/1000}
            yA={yInfraA/1000} yB={yInfraB/1000} />
          {COGS_CATS.map(cat => {
            const mA = fin.expDeptCatSum(QTD, 'COGS: Infrastructure', cat);
            const mB = bud.expDeptCatSum(QTD, 'COGS: Infrastructure', cat);
            const yA = fin.expDeptCatSum(YTD, 'COGS: Infrastructure', cat);
            const yB = bud.expDeptCatSum(YTD, 'COGS: Infrastructure', cat);
            if (Math.abs(mA) < 100 && Math.abs(yA) < 100) return null;
            return (
              <PLRow key={`infra-${cat}`} label={cat} lc="label-indent" varDir={-1}
                mA={mA/1000} mB={mB/1000}
                qA={mA/1000} qB={mB/1000}
                yA={yA/1000} yB={yB/1000} />
            );
          })}
          <PLRow label="COGS: Services" varDir={-1}
            mA={mSvcA/1000} mB={mSvcB/1000}
            qA={mSvcA/1000} qB={mSvcB/1000}
            yA={ySvcA/1000} yB={ySvcB/1000} />
          {COGS_CATS.map(cat => {
            const mA = fin.expDeptCatSum(QTD, 'COGS: Services', cat);
            const mB = bud.expDeptCatSum(QTD, 'COGS: Services', cat);
            const yA = fin.expDeptCatSum(YTD, 'COGS: Services', cat);
            const yB = bud.expDeptCatSum(YTD, 'COGS: Services', cat);
            if (Math.abs(mA) < 100 && Math.abs(yA) < 100) return null;
            return (
              <PLRow key={`svc-${cat}`} label={cat} lc="label-indent" varDir={-1}
                mA={mA/1000} mB={mB/1000}
                qA={mA/1000} qB={mB/1000}
                yA={yA/1000} yB={yB/1000} />
            );
          })}
          <PLRow label="Total COGS" cls="row-subtotal" varDir={-1}
            mA={mCOGSA/1000} mB={mCOGSB/1000}
            qA={mCOGSA/1000} qB={mCOGSB/1000}
            yA={yCOGSA/1000} yB={yCOGSB/1000} />

          <SpacerRow />
          <PLRow label="Gross Profit" cls="row-subtotal"
            mA={mGPA/1000} mB={mGPB/1000}
            qA={mGPA/1000} qB={mGPB/1000}
            yA={yGPA/1000} yB={yGPB/1000} />
          <PLRowPct label="Gross Margin %" cls="row-margin"
            mA={mGMActPct} mB={mGMBudPct}
            qA={mGMActPct} qB={mGMBudPct}
            yA={yGMActPct} yB={yGMBudPct} />

          <SpacerRow />
          <SectionRow label="Operating Expenses" />
          {opexDeptTotals.map(({ dept, mA, mB, yA, yB }) => (
            <React.Fragment key={dept}>
              <PLRow label={dept} varDir={-1}
                mA={mA/1000} mB={mB/1000}
                qA={mA/1000} qB={mB/1000}
                yA={yA/1000} yB={yB/1000} />
              {COGS_CATS.map(cat => {
                const dcmA = fin.expDeptCatSum(QTD, dept, cat);
                const dcmB = bud.expDeptCatSum(QTD, dept, cat);
                const dcyA = fin.expDeptCatSum(YTD, dept, cat);
                const dcyB = bud.expDeptCatSum(YTD, dept, cat);
                if (Math.abs(dcmA) < 100 && Math.abs(dcyA) < 100) return null;
                return (
                  <PLRow key={`${dept}-${cat}`} label={cat} lc="label-indent" varDir={-1}
                    mA={dcmA/1000} mB={dcmB/1000}
                    qA={dcmA/1000} qB={dcmB/1000}
                    yA={dcyA/1000} yB={dcyB/1000} />
                );
              })}
            </React.Fragment>
          ))}
          <PLRow label="Total OpEx" cls="row-subtotal" varDir={-1}
            mA={mOpexA/1000} mB={mOpexB/1000}
            qA={mOpexA/1000} qB={mOpexB/1000}
            yA={yOpexA/1000} yB={yOpexB/1000} />

          <SpacerRow />
          <PLRow label="EBITDA" cls="row-total"
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
  );
}
