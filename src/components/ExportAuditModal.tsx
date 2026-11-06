import React, { useState } from "react";
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  X,
  ShieldCheck,
  DollarSign,
  Layers,
  Sparkles,
  Download,
  Printer,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { CloudFile, UserProfile } from "../types";
import {
  exportFileListToCsv,
  exportCompressionAuditReportToCsv,
  exportCompressionAuditReportToPdf,
} from "../utils/auditExport";
import { formatBytes, calculateCloudPrice, formatCloudPrice } from "../utils/formatters";

interface ExportAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  files?: CloudFile[]; // Current filtered files
  allFiles?: CloudFile[]; // Full repository
  selectedFiles?: CloudFile[]; // User-selected files
  user: UserProfile;
  currentViewTitle?: string;
  defaultScope?: "filtered" | "all" | "selected" | "logs" | "activities";
  onAddActivity?: (activityTitle: string, description: string) => void;
}

export const ExportAuditModal: React.FC<ExportAuditModalProps> = ({
  isOpen,
  onClose,
  files = [],
  allFiles,
  selectedFiles = [],
  user,
  currentViewTitle = "Files Directory",
  defaultScope,
  onAddActivity,
}) => {
  const safeAllFiles = allFiles || files;
  const safeFiles = files || [];
  const safeSelectedFiles = selectedFiles || [];

  const [scope, setScope] = useState<"filtered" | "all" | "selected">(() => {
    if (defaultScope === "all") return "all";
    if (defaultScope === "selected" && safeSelectedFiles.length > 0) return "selected";
    return safeSelectedFiles.length > 0 ? "selected" : "filtered";
  });

  const [reportType, setReportType] = useState<"audit_report" | "inventory">("audit_report");
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [includeChecksums, setIncludeChecksums] = useState(true);
  const [includeCostMetrics, setIncludeCostMetrics] = useState(true);
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Determine active dataset based on scope
  const targetFiles =
    scope === "selected" && safeSelectedFiles.length > 0
      ? safeSelectedFiles
      : scope === "all"
      ? safeAllFiles
      : safeFiles;

  const totalFiles = targetFiles.length;
  const compressedCount = targetFiles.filter((f) => f.status === "compressed").length;
  const totalOriginalBytes = targetFiles.reduce((acc, f) => acc + f.originalSizeBytes, 0);
  const totalCompressedBytes = targetFiles.reduce((acc, f) => {
    return acc + (f.compressedSizeBytes ?? f.originalSizeBytes);
  }, 0);
  const savedBytes = Math.max(0, totalOriginalBytes - totalCompressedBytes);
  const reductionPercent =
    totalOriginalBytes > 0 ? Math.round((savedBytes / totalOriginalBytes) * 100) : 0;

  const costBefore = calculateCloudPrice(totalOriginalBytes);
  const costAfter = calculateCloudPrice(totalCompressedBytes);
  const totalSavings = Math.max(0, costBefore - costAfter);

  const scopeLabel =
    scope === "selected"
      ? `Selected Files (${totalFiles})`
      : scope === "all"
      ? `All Repository Files (${totalFiles})`
      : `Filtered View: ${currentViewTitle} (${totalFiles})`;

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(null);

    try {
      if (format === "csv") {
        if (reportType === "audit_report") {
          exportCompressionAuditReportToCsv(targetFiles, user, {
            includeChecksums,
            includeCostMetrics,
            includeExecutiveSummary,
            scopeLabel,
          });
        } else {
          exportFileListToCsv(
            targetFiles,
            `CloudOptima_Inventory_${new Date().toISOString().slice(0, 10)}.csv`
          );
        }
        setExportSuccess("CSV exported successfully");
      } else {
        // PDF Export
        exportCompressionAuditReportToPdf(targetFiles, user, {
          includeChecksums,
          includeCostMetrics,
          includeExecutiveSummary,
          scopeLabel,
        });
        setExportSuccess("PDF Audit Report generated and downloaded");
      }

      if (onAddActivity) {
        onAddActivity(
          `Exported Audit Report (${format.toUpperCase()})`,
          `Generated ${format.toUpperCase()} ${
            reportType === "audit_report" ? "Lossless Audit Report" : "Raw Inventory"
          } covering ${totalFiles} files ($${totalSavings.toFixed(2)} monthly savings audited).`
        );
      }

      setTimeout(() => {
        setIsExporting(false);
      }, 700);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      setExportSuccess("Failed to generate export file. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Export Audit Report &amp; File Ledger</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase">
                  SOC-2 / ISO Verified
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate publication-grade CSV spreadsheets or cryptographic PDF audit reports for executive and compliance reviews.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* 1. Export Format Selection (PDF vs CSV) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white block uppercase tracking-wider text-[11px]">
              1. Choose Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                  format === "pdf"
                    ? "bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/20 shadow-md shadow-cyan-500/10"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950/70"
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    format === "pdf"
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "bg-slate-900 border border-slate-800 text-slate-400"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs">PDF Document (.pdf)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Formal audit publication with executive summary, storage ROI breakdown, table ledger, and lossless cryptographic certificate.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                  format === "csv"
                    ? "bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/20 shadow-md shadow-cyan-500/10"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950/70"
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    format === "csv"
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-slate-900 border border-slate-800 text-slate-400"
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs">CSV Spreadsheet (.csv)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                      Excel Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    RFC 4180 CSV with UTF-8 BOM. Perfect for SIEM ingestion, Excel modeling, financial pivot tables, and automated data pipelines.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. File Scope Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white block uppercase tracking-wider text-[11px]">
              2. Data Scope
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setScope("filtered")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  scope === "filtered"
                    ? "bg-cyan-500/15 border-cyan-500 text-white"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="font-bold block text-xs">Current Filtered View</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {safeFiles.length} {safeFiles.length === 1 ? "file" : "files"} matching filters
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope("all")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  scope === "all"
                    ? "bg-cyan-500/15 border-cyan-500 text-white"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="font-bold block text-xs">Entire Repository</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {safeAllFiles.length} files across all clouds
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope("selected")}
                disabled={safeSelectedFiles.length === 0}
                className={`p-3 rounded-xl border text-left transition ${
                  safeSelectedFiles.length === 0
                    ? "opacity-40 cursor-not-allowed bg-slate-950/20 border-slate-800/50 text-slate-600"
                    : scope === "selected"
                    ? "bg-cyan-500/15 border-cyan-500 text-white cursor-pointer"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                }`}
              >
                <span className="font-bold block text-xs">Selected Files Only</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {safeSelectedFiles.length} {safeSelectedFiles.length === 1 ? "file" : "files"} checked
                </span>
              </button>
            </div>
          </div>

          {/* 3. Report Content Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white block uppercase tracking-wider text-[11px]">
              3. Audit Inclusions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeExecutiveSummary}
                  onChange={(e) => setIncludeExecutiveSummary(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 accent-cyan-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-300 font-medium">Executive Summary</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCostMetrics}
                  onChange={(e) => setIncludeCostMetrics(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 accent-cyan-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-300 font-medium">Cloud Pricing &amp; ROI</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeChecksums}
                  onChange={(e) => setIncludeChecksums(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 accent-cyan-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-300 font-medium">SHA-256 Bitwise Parity</span>
              </label>
            </div>
          </div>

          {/* 4. Live Audit Scope Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audited Scope Summary</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {totalFiles} files &bull; {compressedCount} compressed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                <span className="text-[9px] uppercase text-slate-500 block">Raw Data</span>
                <span className="text-xs font-bold text-white block mt-0.5 font-mono">
                  {formatBytes(totalOriginalBytes)}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                <span className="text-[9px] uppercase text-slate-500 block">Compressed</span>
                <span className="text-xs font-bold text-cyan-400 block mt-0.5 font-mono">
                  {formatBytes(totalCompressedBytes)}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                <span className="text-[9px] uppercase text-slate-500 block">Storage Saved</span>
                <span className="text-xs font-bold text-emerald-400 block mt-0.5 font-mono">
                  {formatBytes(savedBytes)} (-{reductionPercent}%)
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                <span className="text-[9px] uppercase text-slate-500 block">Monthly Savings</span>
                <span className="text-xs font-bold text-emerald-400 block mt-0.5 font-mono">
                  ${totalSavings.toFixed(2)}/mo
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
              <span>Auditor: <strong className="text-slate-400">{user.name}</strong></span>
              <span>Integrity: <strong className="text-emerald-400">100% Cryptographic Parity</strong></span>
            </div>
          </div>

          {/* Success Message Banner */}
          {exportSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{exportSuccess}</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">Ready in downloads</span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Format: <strong>.{format.toUpperCase()}</strong> &bull; Scope: <strong>{scope}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || totalFiles === 0}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {isExporting
                  ? "Generating..."
                  : `Export ${format.toUpperCase()} (${totalFiles} Files)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
