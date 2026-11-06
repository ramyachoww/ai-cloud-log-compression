import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Activity,
  Zap,
  CheckCircle2,
  HardDrive,
  Eye,
  Info,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Layers,
  DollarSign,
  Plus,
} from "lucide-react";
import { CloudFile, RecentActivityItem } from "../types";
import {
  formatBytes,
  calculateCloudPrice,
  formatCloudPrice,
} from "../utils/formatters";

interface UploadFileViewProps {
  files: CloudFile[];
  onOpenFile: (file: CloudFile) => void;
  onInspectFile: (file: CloudFile) => void;
  onCompressFile: (file: CloudFile) => void;
  onOpenUploadModal: () => void;
  onNavigateToAi: (fileId?: string) => void;
}

export const UploadFileView: React.FC<UploadFileViewProps> = ({
  files = [],
  onOpenFile,
  onInspectFile,
  onCompressFile,
  onOpenUploadModal,
  onNavigateToAi,
}) => {
  const safeFiles = files || [];
  const uncompressedFiles = safeFiles.filter((f) => f.status === "uncompressed");
  const compressedFiles = safeFiles.filter((f) => f.status === "compressed");

  const totalUncompressedBytes = uncompressedFiles.reduce((acc, f) => acc + f.originalSizeBytes, 0);
  const uncompressedCost = calculateCloudPrice(totalUncompressedBytes);
  const potentialSavingsBytes = Math.round(totalUncompressedBytes * 0.74);
  const potentialSavingsCost = calculateCloudPrice(potentialSavingsBytes);

  return (
    <div className="space-y-7">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Upload &amp; Compress Cloud Telemetry
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold uppercase tracking-wider">
                  Ingestion Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Ingest telemetry and server logs from your computer or cloud sources, then immediately execute 100% bitwise lossless compression to reduce storage and PAYG costs by ~75%.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenUploadModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New File</span>
          </button>
        </div>
      </div>

      {/* 2. Key Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Uncompressed Files Waiting */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Awaiting Compression</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px]">
              Action Required
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {uncompressedFiles.length}{" "}
            <span className="text-xs font-normal text-slate-400">files</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {formatBytes(totalUncompressedBytes)} uncompressed data &bull; Current PAYG:{" "}
            <strong className="text-amber-400">{formatCloudPrice(uncompressedCost)}</strong>
          </p>
        </div>

        {/* Potential Savings */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Potential Reduction</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            ~74%{" "}
            <span className="text-xs font-normal text-slate-300">
              ({formatBytes(potentialSavingsBytes)})
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Estimated bill reduction:{" "}
            <strong className="text-emerald-300">{formatCloudPrice(potentialSavingsCost)}/month</strong>
          </p>
        </div>

        {/* Compressed & Verified */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Already Compressed</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {compressedFiles.length}{" "}
            <span className="text-xs font-normal text-slate-400">files active</span>
          </div>
          <p className="text-[11px] text-slate-400">
            100% bitwise verified with SHA-256 integrity checks
          </p>
        </div>
      </div>

      {/* 3. Drag & Drop Upload Quick Launcher */}
      <div
        onClick={onOpenUploadModal}
        className="p-7 rounded-2xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/70 bg-gradient-to-br from-slate-900/90 to-cyan-950/20 transition-all hover:bg-slate-900 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 group shadow-lg"
      >
        <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition border border-cyan-500/20 shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
            Click to Browse or Drag &amp; Drop Telemetry Logs Here
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            Upload .log, .txt, .json, .csv, or syslog files. You can choose to upload and compress immediately with a single click.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
            Fast Bitwise Pipeline
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-mono">
            ~75% Lossless Ratio
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-purple-400 font-mono">
            AI Schema Templates
          </span>
        </div>
      </div>

      {/* 4. Files Awaiting Compression Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Uploaded Files Ready for Compression
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                {uncompressedFiles.length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any uploaded file below and click "Compress Now" to execute lossless compression.
            </p>
          </div>

          {uncompressedFiles.length > 0 && (
            <button
              type="button"
              onClick={() => onCompressFile(uncompressedFiles[0])}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer self-start sm:self-auto"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Compress Next Pending File</span>
            </button>
          )}
        </div>

        {uncompressedFiles.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">All Uploaded Files Are Compressed!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Every file in your storage catalog has undergone lossless compression and bitwise verification.
            </p>
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="mt-3 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Another File</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">File Name &amp; Cloud</th>
                  <th className="py-3 px-3">Type &amp; Category</th>
                  <th className="py-3 px-3">Original Size</th>
                  <th className="py-3 px-3">Current PAYG</th>
                  <th className="py-3 px-3">Expected Savings</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {uncompressedFiles.map((file) => {
                  const origPrice = calculateCloudPrice(file.originalSizeBytes);
                  const expPrice = calculateCloudPrice(Math.round(file.originalSizeBytes * 0.26));
                  const savings = origPrice - expPrice;

                  return (
                    <tr key={file.id} className="hover:bg-slate-850/50 transition group">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                            {file.category === "log" ? (
                              <FileText className="w-4 h-4" />
                            ) : (
                              <Activity className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white group-hover:text-cyan-300 transition truncate block">
                              {file.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {file.environmentName} &bull; Uploaded {file.uploadDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300 uppercase">
                          {file.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-white">
                        {formatBytes(file.originalSizeBytes)}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-amber-400 font-semibold">
                        {formatCloudPrice(origPrice)}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-emerald-400 font-semibold">
                        Save ~{formatCloudPrice(savings)} (74%)
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenFile(file)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1 border border-slate-700"
                            title="Inspect file lines"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Open</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onNavigateToAi(file.id)}
                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition cursor-pointer"
                            title="Ask AI questions about this file"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          </button>

                          {/* Primary Compress Action */}
                          <button
                            type="button"
                            onClick={() => onCompressFile(file)}
                            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold transition cursor-pointer text-xs flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
                            title="Compress this file now"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Compress Now</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. How Lossless Compression Operates on Uploaded Files */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Lossless Telemetry Compression Lifecycle</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              Phase 1
            </span>
            <h5 className="font-bold text-white">Ingestion &amp; Format Parsing</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Auto-detects syslog, JSON telemetry, Apache HTTP, or VPC flow schema.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
              Phase 2
            </span>
            <h5 className="font-bold text-white">AI Schema Mining</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Extracts repeated templates and replaces timestamps with delta offsets.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Phase 3
            </span>
            <h5 className="font-bold text-white">Entropy Compression</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Encodes structural variables with ZSTD/LZ4 for ~75% byte reduction.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
              Phase 4
            </span>
            <h5 className="font-bold text-white">Bitwise SHA-256 Check</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verifies 100% reversible bit-for-bit fidelity for compliance audits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
