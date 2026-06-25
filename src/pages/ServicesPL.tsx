import React from 'react';
import { DashData } from '../App';
import { PLTableHead, PLRow, PLRowPct, SectionRow, SpacerRow } from '../components/PLTable';
import { QTD, YTD } from '../lib/constants';

const DEPT_SERVICES = 'COGS: Services';

interface Props { data: DashData }

export default function ServicesPL({ data }: Props) {
  const { fin, bud } = data;

  // Revenue
  const mImplA = fin.revSum(QTD, 'Services Revenue');
  const mImplB = bud.revSum(QTD, 'Services Revenue');
  const yImplA = fin.revSum(YTD, 'Services Revenue');
  const yImplB = bud.revSum(YTD, 'Services Revenue');

  // Split: Impl vs Premium
  const mPremA = fin.revSum(QTD, 'Premium Services');
  const mPremB = bud.revSum(QTD, 'Premium Services');
  const yPremA = fin.revSum(YTD, 'Premium Services');
  const yPremB = bud.revSum(YTD, 'Premium Services');
  const mImplOnlyA = fin.revSum(QTD, 'Implementation Services');
  const mImplOnlyB = bud.revSum(QTD, 'Implementation Services');
  const yImplOnlyA = fin.revSum(YTD, 'Implementation Services');
  const yImplOnlyB = bud.revSum(YTD, 'Implementation Services');

  // COGS: Services categories
  const expCats = ['Headcount','Non-Headcount','Overhead'];
  const filteredCats = expCats.filter(cat => {
    const act = fin.expDeptCatSum(QTD, DEPT_SERVICES, cat);
    const bgt = bud.expDeptCatSum(QTD, DEPT_SERVICES, cat);
    return Math.abs(act) > 100 || Math.abs(bgt) > 100;
  });

  const mCOGSA = fin.expSum(QTD, DEPT_SERVICES, '', '');
  const mCOGSB = bud.expSum(QTD, DEPT_SERVICES, '', '');
  const yCOGSA = fin.expSum(YTD, DEPT_SERVICES, '', '');
  const yCOGSB = bud.expSum(YTD, DEPT_SERVICES, '', '');

  const mGPA = mImplA - mCOGSA;
  const mGPB = mImplB - mCOGSB;
  const yGPA = yImplA - yCOGSA;
  const yGPB = yImplB - yCOGSB;

  const mGMActPct = mImplA ? mGPA / mImplA : null;
  const mGMBudPct = mImplB ? mGPB / mImplB : null;
  const yGMActPct = yImplA ? yGPA / yImplA : null;
  const yGMBudPct = yImplB ? yGPB / yImplB : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <PLTableHead labelWidth="220px" />
        <tbody>
          <SectionRow label="Services Revenue" />
          <PLRow label="Services Revenue" cls="row-subtotal"
            mA={mImplA/1000} mB={mImplB/1000}
            qA={mImplA/1000} qB={mImplB/1000}
            yA={yImplA/1000} yB={yImplB/1000} />
          <PLRow label="Implementation Services" lc="label-indent"
            mA={mImplOnlyA/1000} mB={mImplOnlyB/1000}
            qA={mImplOnlyA/1000} qB={mImplOnlyB/1000}
            yA={yImplOnlyA/1000} yB={yImplOnlyB/1000} />
          <PLRow label="Premium Services" lc="label-indent"
            mA={mPremA/1000} mB={mPremB/1000}
            qA={mPremA/1000} qB={mPremB/1000}
            yA={yPremA/1000} yB={yPremB/1000} />

          <SpacerRow />
          <SectionRow label="Cost of Services" />
          {filteredCats.map(cat => (
            <PLRow key={cat} label={cat} lc="label-indent" varDir={-1}
              mA={fin.expDeptCatSum(QTD, DEPT_SERVICES, cat)/1000}
              mB={bud.expDeptCatSum(QTD, DEPT_SERVICES, cat)/1000}
              qA={fin.expDeptCatSum(QTD, DEPT_SERVICES, cat)/1000}
              qB={bud.expDeptCatSum(QTD, DEPT_SERVICES, cat)/1000}
              yA={fin.expDeptCatSum(YTD, DEPT_SERVICES, cat)/1000}
              yB={bud.expDeptCatSum(YTD, DEPT_SERVICES, cat)/1000} />
          ))}
          <PLRow label="Total Cost of Services" cls="row-subtotal" varDir={-1}
            mA={mCOGSA/1000} mB={mCOGSB/1000}
            qA={mCOGSA/1000} qB={mCOGSB/1000}
            yA={yCOGSA/1000} yB={yCOGSB/1000} />

          <SpacerRow />
          <SectionRow label="Margin" />
          <PLRow label="Gross Profit" cls="row-subtotal"
            mA={mGPA/1000} mB={mGPB/1000}
            qA={mGPA/1000} qB={mGPB/1000}
            yA={yGPA/1000} yB={yGPB/1000} />
          <PLRowPct label="Gross Margin %" cls="row-margin"
            mA={mGMActPct} mB={mGMBudPct}
            qA={mGMActPct} qB={mGMBudPct}
            yA={yGMActPct} yB={yGMBudPct} />
        </tbody>
      </table>
    </div>
  );
}
