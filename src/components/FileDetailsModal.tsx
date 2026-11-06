import React from "react";
import {
  X,
  FileText,
  Activity,
  ShieldCheck,
  HardDrive,
  Calendar,
  Layers,
  Server,
  ArrowDownRight,
  Zap,
  DollarSign,
  Download,
  RotateCcw,
} from "lucide-react";
import { CloudFile } from "../types";
import {
  formatBytes,
  calculateCloudPrice,
  formatCloudPrice,
  CLOUD_PAYG_RATE_PER_GB,
} from "../utils/formatters";
import { downloadSingleCompressedFile, downloadOriginalUncompressedFile } from "../utils/fileDownload";

interface FileDetailsModalProps {
  file: CloudFile;
  onClose: () => void;
  onOpenFile: (file: CloudFile) => void;
  onTriggerCompress: (file: CloudFile) => void;
  onTriggerDecompress?: (file: CloudFile) => void;
}

export const FileDetailsModal: React.FC<FileDetailsModalProps> = ({
  file,
  onClose,
  onOpenFile,
  onTriggerCompress,
  onTriggerDecompress,
}) => {
  const isCompressed = file.status === "compressed" && file.compressedSizeBytes !== null;
  const storageSaved = isCompressed
    ? Math.max(0, file.originalSizeBytes - (file.compressedSizeBytes || 0))
    : 0;
  const reductionPercent = isCompressed && file.compressedSizeBytes
    ? Math.round((storageSaved / file.originalSizeBytes) * 100)
    : 0;

  const origPrice = calculateCloudPrice(file.originalSizeBytes);
  const compPrice = isCompressed && file.compressedSizeBytes ? calculateCloudPrice(file.compressedSizeBytes) : null;
  const priceSaved = compPrice !== null ? Math.max(0, origPrice - compPrice) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              file.category === "log"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
            }`}>
              {file.category === "log" ? <FileText className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{file.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Comprehensive Telemetry &amp; Storage Profile</p>
            </div>
          </div>

          <button
            type="button"
            id="close-details-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Top Storage Comparison Banner */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-semibold text-slate-400">Original Size</span>
              <p className="text-lg font-bold text-white">{formatBytes(file.originalSizeBytes)}</p>
              <span className="text-[10px] text-slate-500">Uncompressed disk footprint</span>
            </div>

            <div className="space-y-1 sm:border-x sm:border-slate-800 sm:px-2">
              <span className="text-[11px] uppercase font-semibold text-slate-400">Compressed Size</span>
              <p className="text-lg font-bold text-cyan-400">
                {file.compressedSizeBytes ? formatBytes(file.compressedSizeBytes) : "Pending"}
              </p>
              <span className="text-[10px] text-slate-500">
                {isCompressed ? "Semantic entropy compressed" : "Awaiting compression"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase font-semibold text-slate-400">Storage Saved</span>
              <p className="text-lg font-bold text-emerald-400">
                {isCompressed ? formatBytes(storageSaved) : "0 B"}
              </p>
              <span className="text-[10px] text-emerald-500 font-medium">
                {isCompressed ? `${reductionPercent}% Net Reduction` : "0% reduction"}
              </span>
            </div>
          </div>

          {/* Pay-As-You-Use Cloud Cost Banner */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-semibold text-slate-400">
                <DollarSign className="w-3 h-3 text-slate-400" />
                <span>Cloud Price (PAYG)</span>
              </div>
              <p className="text-lg font-bold text-white font-mono">{formatCloudPrice(origPrice)}</p>
              <span className="text-[10px] text-slate-500">Rate: ${CLOUD_PAYG_RATE_PER_GB.toFixed(2)}/GB</span>
            </div>

            <div className="space-y-1 sm:border-x sm:border-slate-800 sm:px-2">
              <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-semibold text-slate-400">
                <DollarSign className="w-3 h-3 text-cyan-400" />
                <span>Compressed Price</span>
              </div>
              <p className="text-lg font-bold text-cyan-400 font-mono">
                {compPrice !== null ? formatCloudPrice(compPrice) : "Pending"}
              </p>
              <span className="text-[10px] text-slate-500">
                {isCompressed ? "Compressed pay-as-you-use" : "Awaiting compression"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-semibold text-slate-400">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>Cost Saved</span>
              </div>
              <p className="text-lg font-bold text-emerald-400 font-mono">
                {isCompressed ? formatCloudPrice(priceSaved) : "$0.00"}
              </p>
              <span className="text-[10px] text-emerald-500 font-medium">
                {isCompressed ? `${Math.round((priceSaved / origPrice) * 100)}% Bill Reduction` : "0% reduction"}
              </span>
            </div>
          </div>

          {/* Core Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold uppercase text-[10px]">File Category</span>
              </div>
              <p className="text-sm font-semibold text-white">
                {file.category === "log" ? "Cloud Log File" : "Cloud Activity File"}
              </p>
              <span className="text-[11px] text-slate-500">
                {file.category === "log" ? "Server daemon runtime logs" : "Cloud audit & user interaction events"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold uppercase text-[10px]">Cloud Environment</span>
              </div>
              <p className="text-sm font-semibold text-white">{file.environmentName}</p>
              <span className="text-[11px] text-slate-500">Target host infrastructure</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold uppercase text-[10px]">Upload Date &amp; Time</span>
              </div>
              <p className="text-sm font-semibold text-white">{file.uploadDate}</p>
              <span className="text-[11px] text-slate-500">Timestamp of file ingestion</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold uppercase text-[10px]">Processing Status</span>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                  file.status === "compressed"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : file.status === "analyzed"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}>
                  {file.status}
                </span>
                <span className="text-[11px] text-slate-400">
                  {file.linesCount.toLocaleString()} total entries
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {file.description && (
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/70 text-xs">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Functional Description</span>
              <p className="text-slate-300 leading-relaxed">{file.description}</p>
            </div>
          )}

          {/* Bitwise Integrity Verification Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Lossless Bitwise Verification</span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                SHA-256 Authenticated
              </span>
            </div>

            <div className="space-y-2 pt-1 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Original Ingestion Hash:</span>
                <p className="text-slate-300 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                  {file.sha256Original}
                </p>
              </div>

              {file.sha256Compressed && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Compressed Archive Hash:</span>
                  <p className="text-cyan-300 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                    {file.sha256Compressed}
                  </p>
                </div>
              )}
            </div>

            {isCompressed && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">Export options:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onTriggerDecompress) {
                        onTriggerDecompress(file);
                      } else {
                        downloadOriginalUncompressedFile(file);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Decompress &amp; Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadSingleCompressedFile(file)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .zst</span>
                  </button>
                </div>
              </div>
            )}

            {file.status === "decompressed" && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Restored decompressed stream:</span>
                <button
                  type="button"
                  id="details-card-download-decompressed-btn"
                  onClick={() => downloadOriginalUncompressedFile(file)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Decompressed File</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {isCompressed && (
              <>
                <button
                  type="button"
                  id="details-decompress-download-btn"
                  onClick={() => {
                    if (onTriggerDecompress) {
                      onTriggerDecompress(file);
                    } else {
                      downloadOriginalUncompressedFile(file);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Decompress &amp; Download</span>
                </button>

                <button
                  type="button"
                  id="details-download-btn"
                  onClick={() => downloadSingleCompressedFile(file)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Archive</span>
                </button>
              </>
            )}

            {file.status === "decompressed" && (
              <button
                type="button"
                id="details-download-decompressed-btn"
                onClick={() => downloadOriginalUncompressedFile(file)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Decompressed File</span>
              </button>
            )}

            <button
              type="button"
              id="details-open-file-btn"
              onClick={() => {
                onClose();
                onOpenFile(file);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open &amp; View Content</span>
            </button>

            {file.status !== "compressed" && file.status !== "decompressed" && (
              <button
                type="button"
                id="details-compress-btn"
                onClick={() => {
                  onClose();
                  onTriggerCompress(file);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Compress File</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
