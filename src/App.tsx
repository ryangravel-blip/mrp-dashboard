import React, { useState, useEffect } from 'react';
import { snowflakeQuery } from './lib/snowflake';
import { QUERIES } from './lib/queries';
import {
  preProcessFin, preProcessBudget, preProcessARR, preProcessCash,
  preProcessBC, preProcessHC, preProcessSales, preProcessSalesTargets,
  preProcessHCBudgetDept, preProcessKPI,
  FinProc, ARRProc, CashProc, BCProc, HCProc, SalesProc, TgtProc, HCBudDeptProc, KPIProc,
} from './lib/processors';
import TabNav from './components/TabNav';
import LoadingSpinner from './components/LoadingSpinner';
import ExecSummary from './pages/ExecSummary';
import ARROverview from './pages/ARROverview';
import SalesPerformance from './pages/SalesPerformance';
import RevenueOverview from './pages/RevenueOverview';
import RevenueTTM from './pages/RevenueTTM';
import CashFlow from './pages/CashFlow';
import ServicesPL from './pages/ServicesPL';
import ExpenseView from './pages/ExpenseView';
import DeptView from './pages/DeptView';
import Headcount from './pages/Headcount';
import QSSummary from './pages/QSSummary';

export interface DashData {
  fin: FinProc;
  bud: FinProc;
  arr: ARRProc;
  cash: CashProc;
  bill: BCProc;
  hc: HCProc;
  sales: SalesProc;
  tgt: TgtProc;
  kpi: KPIProc;
  hcBudDept: HCBudDeptProc;
}

const TABS = [
  'Executive Summary',
  'ARR Overview',
  'Sales Performance',
  'Revenue Overview',
  'Revenue TTM',
  'Cash Flow',
  'Services P&L',
  'P&L by Expense',
  'P&L by Department',
  'Headcount',
  'Q1 Summary',
];

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [
          finR, budR, arrR, cashR, billR, collR,
          salesR, salesTgtR, hcR, hcBridgeR, kpiR, hcBudDeptR,
        ] = await Promise.all([
          snowflakeQuery(QUERIES.financials),
          snowflakeQuery(QUERIES.budget),
          snowflakeQuery(QUERIES.arr),
          snowflakeQuery(QUERIES.cash),
          snowflakeQuery(QUERIES.billings),
          snowflakeQuery(QUERIES.collections),
          snowflakeQuery(QUERIES.sales),
          snowflakeQuery(QUERIES.salesTargets),
          snowflakeQuery(QUERIES.headcount),
          snowflakeQuery(QUERIES.hcBridge),
          snowflakeQuery(QUERIES.kpi),
          snowflakeQuery(QUERIES.hcBudgetDept),
        ]);
        setData({
          fin:       preProcessFin(finR),
          bud:       preProcessBudget(budR),
          arr:       preProcessARR(arrR),
          cash:      preProcessCash(cashR),
          bill:      preProcessBC(billR, collR),
          hc:        preProcessHC(hcR, hcBridgeR),
          sales:     preProcessSales(salesR),
          tgt:       preProcessSalesTargets(salesTgtR),
          kpi:       preProcessKPI(kpiR),
          hcBudDept: preProcessHCBudgetDept(hcBudDeptR),
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Unknown error loading data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg border border-red-200 p-6 max-w-lg">
        <h2 className="text-red-600 font-semibold mb-2">Data load failed</h2>
        <p className="text-sm text-gray-600 font-mono break-all">{error}</p>
        <p className="text-xs text-gray-400 mt-3">Check Settings → Connectors → Snowflake is linked to this project.</p>
      </div>
    </div>
  );
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">Management Reporting Package</h1>
            <p className="text-gray-400 text-xs">Current Month: May-26 · QTD: May · YTD: Feb–May FY27</p>
          </div>
          <span className="text-xs text-gray-400">Live · Snowflake</span>
        </div>
      </header>
      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />
      <main className="p-6">
        {activeTab === 'Executive Summary'   && <ExecSummary data={data} />}
        {activeTab === 'ARR Overview'        && <ARROverview data={data} />}
        {activeTab === 'Sales Performance'   && <SalesPerformance data={data} />}
        {activeTab === 'Revenue Overview'    && <RevenueOverview data={data} />}
        {activeTab === 'Revenue TTM'         && <RevenueTTM data={data} />}
        {activeTab === 'Cash Flow'           && <CashFlow data={data} />}
        {activeTab === 'Services P&L'        && <ServicesPL data={data} />}
        {activeTab === 'P&L by Expense'      && <ExpenseView data={data} />}
        {activeTab === 'P&L by Department'   && <DeptView data={data} />}
        {activeTab === 'Headcount'           && <Headcount data={data} />}
        {activeTab === 'Q1 Summary'          && <QSSummary data={data} />}
      </main>
    </div>
  );
}
