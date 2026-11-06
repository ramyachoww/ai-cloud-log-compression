import React from "react";
import {
  Zap,
  RotateCcw,
  X,
  CheckSquare,
  Sparkles,
  Layers,
  HardDrive,
  DollarSign,
  TrendingDown,
  FileDown,
  Download,
} from "lucide-react";
import { CloudFile } from "../types";
import {
  formatBytes,
  calculateCloudPrice,
  formatCloudPrice,
} from "../utils/formatters";

interface BulkActionBarProps {
  selectedFiles: CloudFile[];
  totalFilteredCount: number;
  filteredUncompressedCount: number;
  filteredCompressedCount: number;
  onClearSelection: () => void;
  onSelectAllFiltered: () => void;
  onSelectUncompressedOnly: () => void;
  onSelectCompressedOnly: () => void;
  onTriggerBatchCompress: () => void;
  onTriggerBatchDecompress: () => void;
  onTriggerExport?: () => void;
  onTriggerDownloadCompressed?: () => void;
  onTriggerDownloadDecompressed?: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedFiles = [],
  totalFilteredCount = 0,
  filteredUncompressedCount = 0,
  filteredCompressedCount = 0,
  onClearSelection,
  onSelectAllFiltered,
  onSelectUncompressedOnly,
  onSelectCompressedOnly,
  onTriggerBatchCompress,
  onTriggerBatchDecompress,
  onTriggerExport,
  onTriggerDownloadCompressed,
  onTriggerDownloadDecompressed,
}) => {
  const safeSelected = selectedFiles || [];
  const selectedCount = safeSelected.length;
  if (selectedCount === 0) return null;

  const uncompressedSelected = safeSelected.filter((f) => f.status !== "compressed");
  const compressedSelected = safeSelected.filter((f) => f.status === "compressed");
  const decompressedSelected = safeSelected.filter((f) => f.status === "decompressed");

  const totalOriginalBytes = safeSelected.reduce((acc, f) => acc + f.originalSizeBytes, 0);
  const potentialSavingsBytes = uncompressedSelected.reduce((acc, f) => {
    const comp = Math.round(f.originalSizeBytes * 0.26);
    return acc + (f.originalSizeBytes - comp);
  }, 0);

  return (
    <>
      {/* 1. Inline Action Bar (Appears directly above the table) */}
      <div className="mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-indigo-950/60 border border-cyan-500/40 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Selection details & Quick Select Helpers */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedCount} {selectedCount === 1 ? "file" : "files"} selected</span>
              <span className="text-cyan-400/60">&bull;</span>
              <span className="font-mono text-[11px] text-white">{formatBytes(totalOriginalBytes)}</span>
            </div>

            {/* Quick helper selector chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] text-slate-400">Quick Select:</span>
              <button
                type="button"
                onClick={onSelectAllFiltered}
                className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-[11px] font-medium transition cursor-pointer border border-slate-700/60"
              >
                All Filtered ({totalFilteredCount})
              </button>

              {filteredUncompressedCount > 0 && (
                <button
                  type="button"
                  onClick={onSelectUncompressedOnly}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-medium transition cursor-pointer border border-amber-500/30 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Uncompressed ({filteredUncompressedCount})</span>
                </button>
              )}

              {filteredCompressedCount > 0 && (
                <button
                  type="button"
                  onClick={onSelectCompressedOnly}
                  className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-medium transition cursor-pointer border border-emerald-500/30 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Compressed ({filteredCompressedCount})</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClearSelection}
                className="px-2 py-0.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] transition cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Right: Primary Bulk Action Triggers */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Batch Compress Button */}
            <button
              type="button"
              id="batch-compress-action-btn"
              onClick={onTriggerBatchCompress}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer ${
                uncompressedSelected.length > 0
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20"
                  : "bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
              }`}
              title="Compress selected files simultaneously"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-200" />
              <span>
                Batch Compress ({uncompressedSelected.length > 0 ? uncompressedSelected.length : selectedCount})
              </span>
              {potentialSavingsBytes > 0 && (
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-emerald-300 font-mono">
                  ~{formatBytes(potentialSavingsBytes)} saved
                </span>
              )}
            </button>

            {/* Batch Decompress Button */}
            <button
              type="button"
              id="batch-decompress-action-btn"
              onClick={onTriggerBatchDecompress}
              disabled={compressedSelected.length === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                compressedSelected.length > 0
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20 cursor-pointer"
                  : "bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed"
              }`}
              title={
                compressedSelected.length > 0
                  ? "Decompress selected compressed files simultaneously"
                  : "Select compressed files to decompress"
              }
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-200" />
              <span>Batch Decompress ({compressedSelected.length})</span>
            </button>

            {/* Download Compressed Files Button */}
            {compressedSelected.length > 0 && onTriggerDownloadCompressed && (
              <button
                type="button"
                id="batch-download-compressed-btn"
                onClick={onTriggerDownloadCompressed}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                title="Download selected compressed files as a ZIP archive"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .zst ({compressedSelected.length})</span>
              </button>
            )}

            {/* Download Decompressed Files Button */}
            {decompressedSelected.length > 0 && onTriggerDownloadDecompressed && (
              <button
                type="button"
                id="batch-download-decompressed-btn"
                onClick={onTriggerDownloadDecompressed}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                title="Download selected restored decompressed files as a ZIP archive"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Restored ({decompressedSelected.length})</span>
              </button>
            )}

            {/* Export Selected Audit Report Button */}
            {onTriggerExport && (
              <button
                type="button"
                id="batch-export-action-btn"
                onClick={onTriggerExport}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/40 hover:border-cyan-500 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Export selected files as audit report (CSV or PDF)"
              >
                <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Audit ({selectedCount})</span>
              </button>
            )}

            {/* Clear Selection Button */}
            <button
              type="button"
              onClick={onClearSelection}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Cancel selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Floating Bottom Bulk Action Pill (Remains visible as user scrolls) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto">
        <div className="px-4 py-3 rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl flex items-center justify-between sm:justify-start gap-3 sm:gap-4 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <div className="text-xs">
              <span className="font-bold text-white block leading-tight">
                {selectedCount} {selectedCount === 1 ? "File" : "Files"} Selected
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {formatBytes(totalOriginalBytes)} total
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTriggerBatchCompress}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Batch Compress</span>
            </button>

            <button
              type="button"
              onClick={onTriggerBatchDecompress}
              disabled={compressedSelected.length === 0}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm ${
                compressedSelected.length > 0
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20 cursor-pointer"
                  : "bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Batch Decompress</span>
            </button>

            {compressedSelected.length > 0 && onTriggerDownloadCompressed && (
              <button
                type="button"
                id="floating-batch-download-compressed-btn"
                onClick={onTriggerDownloadCompressed}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Download compressed files"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.zst ({compressedSelected.length})</span>
              </button>
            )}

            {decompressedSelected.length > 0 && onTriggerDownloadDecompressed && (
              <button
                type="button"
                id="floating-batch-download-decompressed-btn"
                onClick={onTriggerDownloadDecompressed}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Download decompressed files"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Restored ({decompressedSelected.length})</span>
              </button>
            )}

            {onTriggerExport && (
              <button
                type="button"
                onClick={onTriggerExport}
                className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Export selected files as audit report"
              >
                <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClearSelection}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Deselect all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
