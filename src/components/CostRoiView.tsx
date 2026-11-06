import React, { useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calculator,
  ArrowRight,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
  ShieldCheck,
  Calendar,
  Cloud,
  FileSpreadsheet,
  Info,
} from "lucide-react";
import { StorageCostRoiChart } from "./StorageCostRoiChart";
import {
  HISTORICAL_MONTHLY_COSTS,
  PLATFORM_ROI_SUMMARY,
  PROVIDER_COST_TRENDS,
} from "../data/costRoiData";
import { formatNumber, CLOUD_PAYG_RATE_PER_GB } from "../utils/formatters";

interface CostRoiViewProps {
  onBackToDashboard: () => void;
}

export const CostRoiView: React.FC<CostRoiViewProps> = ({ onBackToDashboard }) => {
  // Interactive Custom Volume Estimator
  const [customVolumeTB, setCustomVolumeTB] = useState<number>(60);
  const [customCompressionRatio, setCustomCompressionRatio] = useState<number>(4.8); // 79.2% reduction
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Estimator Calculations
  const calculatedRawGB = customVolumeTB * 1024;
  const rawMonthlyCost = calculatedRawGB * CLOUD_PAYG_RATE_PER_GB;
  const compressedMonthlyCost = rawMonthlyCost / customCompressionRatio;
  const monthlySavings = Math.max(0, rawMonthlyCost - compressedMonthlyCost);
  const annualSavings = monthlySavings * 12;
  const estimatedPlatformFee = Math.min(1200, Math.max(450, customVolumeTB * 8.5));
  const estimatedNetBenefit = monthlySavings - estimatedPlatformFee;
  const estimatedRoiPercent = Math.round((estimatedNetBenefit / estimatedPlatformFee) * 100);
  const estimatedRoiMultiplier = (monthlySavings / estimatedPlatformFee).toFixed(1);
  const paybackDays = Math.max(2, Math.round((estimatedPlatformFee / (monthlySavings / 30.5))));

  const handleExportCsv = () => {
    // Generate simple CSV for user download
    const headers = "Month,Cost Before ($),Cost After ($),Monthly Savings ($),Reduction (%),Cumulative Savings ($),ROI (%)\n";
    const rows = HISTORICAL_MONTHLY_COSTS.map(
      (m) =>
        `"${m.month}",${m.costBefore},${m.costAfter},${m.monthlySavings},${m.savingsPercent}%,${m.cumulativeSavings},${m.roiPercent}%`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CloudOptima_Cost_ROI_Trends_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* 1. View Header & Quick Action Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold font-mono">
                Financial Telemetry Engine
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified ROI: 36.4x
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cloud Storage Cost Trends &amp; Platform ROI
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Real-world financial audit comparing enterprise uncompressed cloud storage bills against post-compression invoices, proving total ROI and capital efficiency across multi-cloud environments.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700/80 cursor-pointer shadow-sm"
              title="Download Historical Telemetry CSV"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Exported CSV</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Export Telemetry CSV</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 cursor-pointer"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. The Primary Recharts Line Chart Visualization */}
      <StorageCostRoiChart />

      {/* 3. Interactive ROI & Ingestion Scale Calculator */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              <span>Interactive ROI &amp; Scale Estimator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate cloud storage cost deflation and net dollar savings at any monthly ingestion throughput.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span>PAYG Storage Baseline:</span>
            <strong className="text-emerald-400">${CLOUD_PAYG_RATE_PER_GB.toFixed(2)}/GB</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Controls Side */}
          <div className="lg:col-span-6 space-y-5 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Monthly Ingestion Volume (TB):</span>
                <span className="font-mono text-cyan-400 text-sm font-bold bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/60">
                  {customVolumeTB} TB / month ({formatNumber(calculatedRawGB)} GB)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={customVolumeTB}
                onChange={(e) => setCustomVolumeTB(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>5 TB (Startup)</span>
                <span>60 TB (Mid-Market)</span>
                <span>150 TB (Enterprise)</span>
                <span>300 TB (Hyperscale)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Compression Factor (Algorithm Ratio):</span>
                <span className="font-mono text-emerald-400 text-sm font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                  {customCompressionRatio.toFixed(1)}:1 ({Math.round((1 - 1 / customCompressionRatio) * 100)}% reduction)
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="6.5"
                step="0.1"
                value={customCompressionRatio}
                onChange={(e) => setCustomCompressionRatio(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>2.0:1 (Raw Text)</span>
                <span>4.8:1 (CloudOptima Avg)</span>
                <span>6.5:1 (Structured JSON Logs)</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Calculated using actual public cloud rates ($0.50/GB for hot telemetry storage) with lossless bitwise recovery guarantees.
              </span>
            </div>
          </div>

          {/* Results Display Side */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Uncompressed Monthly Bill</span>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono mt-1">
                ${formatNumber(Math.round(rawMonthlyCost))}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Baseline storage cost</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Compressed Monthly Bill</span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                ${formatNumber(Math.round(compressedMonthlyCost))}
              </div>
              <span className="text-[10px] text-emerald-500 mt-1 block font-medium">
                -${formatNumber(Math.round(monthlySavings))} saved / mo
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-cyan-950/40 border border-cyan-500/30 shadow-lg shadow-cyan-950/20">
              <span className="text-[11px] text-cyan-300 block font-medium">Annualized Gross Savings</span>
              <div className="text-xl sm:text-2xl font-extrabold text-cyan-300 font-mono mt-1">
                ${formatNumber(Math.round(annualSavings))}
              </div>
              <span className="text-[10px] text-cyan-400/80 mt-1 block">Full 12-month run rate</span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-purple-950/40 border border-purple-500/30 shadow-lg shadow-purple-950/20">
              <span className="text-[11px] text-purple-300 block font-medium">Projected Platform ROI</span>
              <div className="text-xl sm:text-2xl font-extrabold text-purple-300 font-mono mt-1">
                +{formatNumber(estimatedRoiPercent)}%
              </div>
              <span className="text-[10px] text-purple-400 mt-1 block font-medium">
                {estimatedRoiMultiplier}x Return &bull; {paybackDays}-day payback
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Detailed Historical Financial Ledger Table */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Historical Cost Ledger &amp; ROI Expansion</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological accounting ledger tracking monthly expenditure before and after compression from initial pilot rollout to today.
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-mono">
            {HISTORICAL_MONTHLY_COSTS.length} Accounting Periods Audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3 px-3">Period</th>
                <th className="py-3 px-3">Raw Volume</th>
                <th className="py-3 px-3">Cost Before ($)</th>
                <th className="py-3 px-3">Compressed Vol</th>
                <th className="py-3 px-3">Cost After ($)</th>
                <th className="py-3 px-3">Monthly Savings ($)</th>
                <th className="py-3 px-3">Reduction</th>
                <th className="py-3 px-3">Cumulative Savings</th>
                <th className="py-3 px-3 text-right">Platform ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {HISTORICAL_MONTHLY_COSTS.map((row, idx) => (
                <tr
                  key={row.month}
                  className={`hover:bg-slate-850/60 transition ${
                    idx === HISTORICAL_MONTHLY_COSTS.length - 1 ? "bg-cyan-950/20 font-bold" : ""
                  }`}
                >
                  <td className="py-3 px-3 text-white font-sans font-medium">{row.fullDate}</td>
                  <td className="py-3 px-3 text-slate-300">{row.rawVolumeTB} TB</td>
                  <td className="py-3 px-3 text-amber-300">${formatNumber(row.costBefore)}</td>
                  <td className="py-3 px-3 text-slate-300">{row.compressedVolumeTB} TB</td>
                  <td className="py-3 px-3 text-emerald-400">${formatNumber(row.costAfter)}</td>
                  <td className="py-3 px-3 text-cyan-300">+${formatNumber(row.monthlySavings)}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {row.savingsPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-200">${formatNumber(row.cumulativeSavings)}</td>
                  <td className="py-3 px-3 text-right text-purple-300 font-bold">
                    +{formatNumber(row.roiPercent)}%
                    <span className="text-[10px] text-slate-400 ml-1 font-normal">({row.roiMultiplier}x)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
