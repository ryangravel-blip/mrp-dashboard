import React from 'react';
import { DashData } from '../App';
import { PLTableHead, PLRow, PLRowPct, SectionRow, SpacerRow } from '../components/PLTable';
import { YTD, C_ACT, C_BUD, BRAND } from '../lib/constants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

const MONTHS = ['2026-02-28','2026-03-31','2026-04-30','2026-05-31'];
const MLBL   = ['Feb-26','Mar-26','Apr-26','May-26'];
const CURRENT = '2026-05-31';

interface Props { data: DashData }

export default function ARROverview({ data }: Props) {
  const { arr, kpi } = data;

  const mArr  = arr.get(CURRENT);

  // New Business
  const newAct = mArr.newArr;   const newBud = kpi.eop('KPI.NewARR', CURRENT);
  const expAct = mArr.expArr;   const expBud = kpi.eop('KPI.ExpansionARR', CURRENT);
  const grossNAct = newAct + expAct;
  const grossNBud = newBud + expBud;
  const ytdNewAct = MONTHS.reduce((s,dt)=>s+arr.get(dt).newArr,0);
  const ytdNewBud = kpi.flow('KPI.NewARR', YTD);
  const ytdExpAct = MONTHS.reduce((s,dt)=>s+arr.get(dt).expArr,0);
  const ytdExpBud = kpi.flow('KPI.ExpansionARR', YTD);
  const ytdGrossNAct = ytdNewAct + ytdExpAct;
  const ytdGrossNBud = ytdNewBud + ytdExpBud;

  // Renewals
  const upAct = mArr.upRenew;   const upBud = kpi.eop('Bookings.UpForRenewal', CURRENT);
  const chAct = mArr.churn;     const chBud = kpi.eop('KPI.Downsell_Churn', CURRENT);
  const renewedAct = mArr.renewed;
  const grossRenewAct = upAct + chAct;
  const grossRenewBud = upBud + chBud;
  const renewRateAct = upAct ? renewedAct / upAct : null;
  const renewRateBud = upBud ? (upBud + chBud) / upBud : null;
  const ytdUpAct = MONTHS.reduce((s,dt)=>s+arr.get(dt).upRenew,0);
  const ytdUpBud = kpi.flow('Bookings.UpForRenewal', YTD);
  const ytdChAct = MONTHS.reduce((s,dt)=>s+arr.get(dt).churn,0);
  const ytdChBud = kpi.flow('KPI.Downsell_Churn', YTD);
  const ytdRenewedAct = MONTHS.reduce((s,dt)=>s+arr.get(dt).renewed,0);
  const ytdGrossRAct = ytdUpAct + ytdChAct;
  const ytdGrossRBud = ytdUpBud + ytdChBud;
  const ytdRenewRateAct = ytdUpAct ? ytdRenewedAct / ytdUpAct : null;
  const ytdRenewRateBud = ytdUpBud ? (ytdUpBud + ytdChBud) / ytdUpBud : null;

  // ARR Position
  const bopArr  = arr.bop(CURRENT);
  const eopAct  = mArr.carArr;   const eopBud = kpi.eop('KPI.Exiting_ARR', CURRENT);
  const bopFYBud = kpi.bopFY();
  const ytdEopAct = arr.get(CURRENT).carArr;
  const ytdEopBud = kpi.eop('KPI.Exiting_ARR', CURRENT);

  // Bridge chart
  const bridgeData = [
    { name: 'BOP', bop: bopArr/1000, new: 0, exp: 0, churn: 0 },
    { name: 'New', bop: bopArr/1000, new: newAct/1000, exp: 0, churn: 0 },
    { name: '+Exp', bop: bopArr/1000, new: newAct/1000, exp: expAct/1000, churn: 0 },
    { name: '-Churn', bop: bopArr/1000, new: newAct/1000, exp: expAct/1000, churn: chAct/1000 },
    { name: 'EOP', bop: eopAct/1000, new: 0, exp: 0, churn: 0 },
  ];

  // Monthly New+Exp
  const monthlyData = MONTHS.map((dt, i) => ({
    name: MLBL[i],
    'New ARR': arr.get(dt).newArr / 1000,
    'Expansion': arr.get(dt).expArr / 1000,
    'Budget': (kpi.eop('KPI.NewARR', dt) + kpi.eop('KPI.ExpansionARR', dt)) / 1000,
  }));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <PLTableHead labelWidth="220px" />
          <tbody>
            <SectionRow label="New Business" />
            <PLRow label="New ARR"
              mA={newAct/1000} mB={newBud/1000}
              qA={newAct/1000} qB={newBud/1000}
              yA={ytdNewAct/1000} yB={ytdNewBud/1000} />
            <PLRow label="Expansion ARR"
              mA={expAct/1000} mB={expBud/1000}
              qA={expAct/1000} qB={expBud/1000}
              yA={ytdExpAct/1000} yB={ytdExpBud/1000} />
            <PLRow label="Gross New + Expansion" cls="row-subtotal"
              mA={grossNAct/1000} mB={grossNBud/1000}
              qA={grossNAct/1000} qB={grossNBud/1000}
              yA={ytdGrossNAct/1000} yB={ytdGrossNBud/1000} />

            <SpacerRow />
            <SectionRow label="Renewals" />
            <PLRow label="Up for Renewal"
              mA={upAct/1000} mB={upBud/1000}
              qA={upAct/1000} qB={upBud/1000}
              yA={ytdUpAct/1000} yB={ytdUpBud/1000} />
            <PLRow label="Churn ARR" varDir={-1}
              mA={chAct/1000} mB={chBud/1000}
              qA={chAct/1000} qB={chBud/1000}
              yA={ytdChAct/1000} yB={ytdChBud/1000} />
            <PLRow label="Gross Renewal ARR" cls="row-subtotal"
              mA={grossRenewAct/1000} mB={grossRenewBud/1000}
              qA={grossRenewAct/1000} qB={grossRenewBud/1000}
              yA={ytdGrossRAct/1000} yB={ytdGrossRBud/1000} />
            <PLRowPct label="Gross Renewal Rate %" cls="row-margin"
              mA={renewRateAct} mB={renewRateBud}
              qA={renewRateAct} qB={renewRateBud}
              yA={ytdRenewRateAct} yB={ytdRenewRateBud} />

            <SpacerRow />
            <SectionRow label="ARR Position" />
            <PLRow label="BOP ARR"
              mA={bopArr/1000} mB={bopFYBud/1000}
              qA={bopArr/1000} qB={bopFYBud/1000}
              yA={arr.bop('2026-02-28')/1000} yB={bopFYBud/1000} />
            <PLRow label="EOP ARR" cls="row-subtotal"
              mA={eopAct/1000} mB={eopBud/1000}
              qA={eopAct/1000} qB={eopBud/1000}
              yA={ytdEopAct/1000} yB={ytdEopBud/1000} />
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Monthly New + Expansion ARR ($K)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}K`]} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="New ARR" stackId="a" fill={C_ACT} />
              <Bar dataKey="Expansion" stackId="a" fill={BRAND.teal} />
              <Bar dataKey="Budget" fill={C_BUD} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">ARR Bridge (May-26, $K)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bridgeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}K`]} />
              <Bar dataKey="bop" fill="#e5e7eb" name="BOP" />
              <Bar dataKey="new" stackId="move" fill={C_ACT} name="New" />
              <Bar dataKey="exp" stackId="move" fill={BRAND.teal} name="Expansion" />
              <Bar dataKey="churn" stackId="move" fill="#fca5a5" name="Churn" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
