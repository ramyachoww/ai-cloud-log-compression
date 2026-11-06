import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Cloud,
} from "lucide-react";
import {
  HISTORICAL_MONTHLY_COSTS,
  HISTORICAL_DAILY_COSTS,
  PROVIDER_COST_TRENDS,
  PLATFORM_ROI_SUMMARY,
  MonthlyCostPoint,
} from "../data/costRoiData";
import { formatNumber } from "../utils/formatters";

type TimeRange = "30D" | "6M" | "12M" | "24M";
type ChartMode = "comparison" | "cumulative" | "roi";
type ProviderScope = "All" | "AWS" | "Azure" | "GCP" | "Hybrid Cloud";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  chartMode?: ChartMode;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  chartMode = "comparison",
}) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  const costBefore = dataPoint.costBefore || 0;
  const costAfter = dataPoint.costAfter || 0;
  const savings = dataPoint.monthlySavings || dataPoint.savings || Math.max(0, costBefore - costAfter);
  const savingsPercent =
    dataPoint.savingsPercent || (costBefore > 0 ? Math.round((savings / costBefore) * 100) : 0);
  const roi = dataPoint.roiPercent || 0;
  const roiMultiplier = dataPoint.roiMultiplier || (roi / 100).toFixed(1);

  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/95 border border-slate-700 shadow-2xl backdrop-blur-xl text-xs max-w-xs space-y-2 z-50">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          {dataPoint.fullDate || label}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
          {savingsPercent}% saved
        </span>
      </div>

      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Cost Before:
          </span>
          <span className="font-mono font-bold text-amber-300">
            ${formatNumber(Math.round(costBefore))}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Cost After:
          </span>
          <span className="font-mono font-bold text-emerald-400">
            ${formatNumber(Math.round(costAfter))}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/80">
          <span className="text-slate-300 font-semibold flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-cyan-400" /> Net Savings:
          </span>
          <span className="font-mono font-bold text-cyan-300">
            +${formatNumber(Math.round(savings))}
          </span>
        </div>

        {dataPoint.cumulativeSavings && (
          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="text-slate-400">Cumulative Savings:</span>
            <span className="font-mono text-slate-200">
              ${formatNumber(Math.round(dataPoint.cumulativeSavings))}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 text-[11px] pt-1 border-t border-slate-800/80">
          <span className="text-purple-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Platform ROI:
          </span>
          <span className="font-mono font-bold text-purple-300">
            +{formatNumber(roi)}% ({roiMultiplier}x)
          </span>
        </div>

        {dataPoint.rawVolumeTB && (
          <div className="flex items-center justify-between gap-4 text-[10px] text-slate-500 pt-0.5">
            <span>Volume Stored:</span>
            <span className="font-mono">
              {dataPoint.rawVolumeTB} TB &rarr; {dataPoint.compressedVolumeTB} TB
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const StorageCostRoiChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("12M");
  const [chartMode, setChartMode] = useState<ChartMode>("comparison");
  const [providerScope, setProviderScope] = useState<ProviderScope>("All");

  // Derive active dataset based on time range and provider
  const chartData = useMemo(() => {
    if (timeRange === "30D") {
      // Return 30 days daily telemetry
      return HISTORICAL_DAILY_COSTS;
    }

    if (providerScope !== "All") {
      const p = PROVIDER_COST_TRENDS.find((item) => item.provider === providerScope);
      if (p) {
        return p.monthlyData.map((d) => ({
          month: d.month,
          fullDate: `${d.month} (${providerScope})`,
          costBefore: d.costBefore,
          costAfter: d.costAfter,
          monthlySavings: d.savings,
          savingsPercent: Math.round(((d.costBefore - d.costAfter) / d.costBefore) * 100),
          roiPercent: d.roiPercent,
          cumulativeSavings: d.savings * 3, // normalized preview
        }));
      }
    }

    if (timeRange === "6M") {
      return HISTORICAL_MONTHLY_COSTS.slice(-6);
    }
    if (timeRange === "12M") {
      return HISTORICAL_MONTHLY_COSTS.slice(-12);
    }
    // 24M
    return HISTORICAL_MONTHLY_COSTS;
  }, [timeRange, providerScope]);

  // Aggregate metrics for currently visible time range
  const currentSummary = useMemo(() => {
    let totalBefore = 0;
    let totalAfter = 0;
    let maxSavings = 0;
    let latestRoi = 0;

    chartData.forEach((item: any) => {
      totalBefore += item.costBefore || 0;
      totalAfter += item.costAfter || 0;
      const s = item.monthlySavings || item.savings || (item.costBefore - item.costAfter) || 0;
      if (s > maxSavings) maxSavings = s;
      if (item.roiPercent) latestRoi = item.roiPercent;
    });

    const netSaved = Math.max(0, totalBefore - totalAfter);
    const overallReduction = totalBefore > 0 ? Math.round((netSaved / totalBefore) * 100) : 0;
    const avgMonthlySavings = chartData.length > 0 ? Math.round(netSaved / chartData.length) : 0;

    return {
      totalBefore,
      totalAfter,
      netSaved,
      overallReduction,
      latestRoi: latestRoi || 3539,
      avgMonthlySavings,
    };
  }, [chartData]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Cloud Storage Cost &amp; Platform ROI Trends
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold font-mono">
                  Recharts Visualizer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Historical comparison of cloud expenditure before vs. after lossless compression, tracking ROI expansion over time.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls: Time Range & Visualization Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            {(["30D", "6M", "12M", "24M"] as TimeRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  timeRange === r
                    ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {r === "30D" ? "30 Days (Daily)" : r === "24M" ? "24M (All-Time)" : r}
              </button>
            ))}
          </div>

          {/* Metric View Mode */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setChartMode("comparison")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                chartMode === "comparison"
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              Cost Before vs After
            </button>
            <button
              type="button"
              onClick={() => setChartMode("cumulative")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                chartMode === "cumulative"
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              Cumulative Savings ($)
            </button>
            <button
              type="button"
              onClick={() => setChartMode("roi")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                chartMode === "roi"
                  ? "bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              Platform ROI (%)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive Financial ROI Metrics Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Cost Before */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Spend (Before)</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-amber-300 font-mono tracking-tight">
            ${formatNumber(currentSummary.totalBefore)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Raw uncompressed bill</span>
        </div>

        {/* Metric 2: Cost After */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Spend (After)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
            ${formatNumber(currentSummary.totalAfter)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Actual compressed bill</span>
        </div>

        {/* Metric 3: Net Savings */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 bg-gradient-to-br from-slate-950 to-cyan-950/30 relative overflow-hidden shadow-lg shadow-cyan-950/10">
          <div className="flex items-center justify-between text-[11px] text-cyan-300 mb-1">
            <span>Net Saved ($)</span>
            <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-cyan-300 font-mono tracking-tight">
            +${formatNumber(currentSummary.netSaved)}
          </div>
          <span className="text-[10px] text-cyan-400/80 font-medium block mt-0.5">
            {currentSummary.overallReduction}% bill reduction
          </span>
        </div>

        {/* Metric 4: Platform ROI */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/30 bg-gradient-to-br from-slate-950 to-purple-950/30 relative overflow-hidden shadow-lg shadow-purple-950/10">
          <div className="flex items-center justify-between text-[11px] text-purple-300 mb-1">
            <span>Platform ROI</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-purple-300 font-mono tracking-tight">
            +{formatNumber(currentSummary.latestRoi)}%
          </div>
          <span className="text-[10px] text-purple-400 font-medium block mt-0.5">
            {PLATFORM_ROI_SUMMARY.roiMultiplier} net return
          </span>
        </div>

        {/* Metric 5: Average Payback */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Payback Time</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-white font-mono tracking-tight">
            {PLATFORM_ROI_SUMMARY.averagePaybackDays}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Full capital breakeven</span>
        </div>

        {/* Metric 6: Annualized Run-Rate */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Run-Rate Savings</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
            ${formatNumber(PLATFORM_ROI_SUMMARY.annualizedProjectedSavings)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Projected / 12 months</span>
        </div>
      </div>

      {/* 3. Filter Scope & Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" /> Cloud Scope:
          </span>
          {(["All", "AWS", "Azure", "GCP", "Hybrid Cloud"] as ProviderScope[]).map((prov) => (
            <button
              key={prov}
              type="button"
              onClick={() => setProviderScope(prov)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                providerScope === prov
                  ? "bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {prov === "All" ? "All Clouds" : prov}
            </button>
          ))}
        </div>

        {/* Chart Color Legend */}
        <div className="flex items-center gap-4 flex-wrap text-[11px]">
          {chartMode === "comparison" && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-amber-400 rounded-full inline-block" />
                <span className="text-slate-300 font-medium">Cost Before (Uncompressed)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block" />
                <span className="text-slate-300 font-medium">Cost After (Compressed)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-cyan-400/60 rounded-full inline-block border border-dashed border-cyan-400" />
                <span className="text-cyan-300 font-medium">Net Savings Spread</span>
              </div>
            </>
          )}
          {chartMode === "cumulative" && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-cyan-400 rounded-full inline-block" />
              <span className="text-cyan-300 font-medium">Cumulative Savings Snowball ($)</span>
            </div>
          )}
          {chartMode === "roi" && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-purple-400 rounded-full inline-block" />
              <span className="text-purple-300 font-medium">Platform Return On Investment (%)</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. The Interactive Recharts Line Chart Visualization */}
      <div className="w-full h-80 sm:h-96 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === "comparison" ? (
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <defs>
                {/* Subtle gradient fill between costs */}
                <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey={timeRange === "30D" ? "date" : "month"}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
              />

              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
                tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />

              <Tooltip
                content={<CustomChartTooltip chartMode={chartMode} />}
                cursor={{ stroke: "#475569", strokeWidth: 1, strokeDasharray: "4 4" }}
              />

              {/* Shaded Area between Before and After */}
              <Area
                type="monotone"
                dataKey="costBefore"
                fill="url(#savingsFill)"
                stroke="none"
              />

              {/* Line 1: Cost Before (Uncompressed baseline bill) */}
              <Line
                type="monotone"
                dataKey="costBefore"
                name="Cost Before ($)"
                stroke="#fbbf24"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#fbbf24", strokeWidth: 1.5, stroke: "#0f172a" }}
                activeDot={{ r: 6, fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2 }}
              />

              {/* Line 2: Cost After (Lossless compressed bill) */}
              <Line
                type="monotone"
                dataKey="costAfter"
                name="Cost After ($)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#10b981", strokeWidth: 1.5, stroke: "#0f172a" }}
                activeDot={{ r: 6, fill: "#34d399", stroke: "#ffffff", strokeWidth: 2 }}
              />

              {/* Reference indicator of average savings */}
              <ReferenceLine
                y={5000}
                stroke="#334155"
                strokeDasharray="3 3"
                label={{
                  value: "Enterprise Efficiency Threshold",
                  fill: "#64748b",
                  fontSize: 10,
                  position: "insideBottomRight",
                }}
              />
            </ComposedChart>
          ) : chartMode === "cumulative" ? (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey={timeRange === "30D" ? "date" : "month"}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
              />

              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
                tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />

              <Tooltip
                content={<CustomChartTooltip chartMode={chartMode} />}
                cursor={{ stroke: "#475569", strokeWidth: 1, strokeDasharray: "4 4" }}
              />

              <Line
                type="monotone"
                dataKey="cumulativeSavings"
                name="Cumulative Savings ($)"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ r: 3.5, fill: "#06b6d4", strokeWidth: 1.5, stroke: "#0f172a" }}
                activeDot={{ r: 6, fill: "#22d3ee", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey={timeRange === "30D" ? "date" : "month"}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
              />

              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                content={<CustomChartTooltip chartMode={chartMode} />}
                cursor={{ stroke: "#475569", strokeWidth: 1, strokeDasharray: "4 4" }}
              />

              <Line
                type="monotone"
                dataKey="roiPercent"
                name="Platform ROI (%)"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ r: 3.5, fill: "#a855f7", strokeWidth: 1.5, stroke: "#0f172a" }}
                activeDot={{ r: 6, fill: "#c084fc", stroke: "#ffffff", strokeWidth: 2 }}
              />

              <ReferenceLine
                y={100}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{
                  value: "100% Breakeven",
                  fill: "#10b981",
                  fontSize: 10,
                  position: "insideTopLeft",
                }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 5. Telemetric Insights & ROI Drivers Footer Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4 border-t border-slate-800/80 text-xs">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Sustained 78%+ Bill Deflation</span>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
              As log volume grew from 16.8 TB to 158.8 TB, cloud storage spending stayed capped at ~$16.6k instead of exploding to $79.4k.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Exponential ROI Growth</span>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
              Net platform ROI accelerated from 410% in month 2 to over 4,500% as token dictionary clustering achieved 4.8:1 compression.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">100% Bitwise Data Integrity</span>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
              Financial savings achieved with zero data loss — verified by matching SHA-256 hashes on every decompressed archive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
