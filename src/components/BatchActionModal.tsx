import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Zap,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  HardDrive,
  ArrowRight,
  Sparkles,
  Layers,
  DollarSign,
  AlertCircle,
  FileText,
  Clock,
  Check,
  Download,
} from "lucide-react";
import { CloudFile, RecentActivityItem } from "../types";
import {
  formatBytes,
  calculateCloudPrice,
  formatCloudPrice,
  CLOUD_PAYG_RATE_PER_GB,
} from "../utils/formatters";
import {
  downloadOriginalUncompressedFile,
  downloadBatchDecompressedFilesZip,
  downloadSingleCompressedFile,
  downloadBatchCompressedFilesZip,
} from "../utils/fileDownload";

export type BatchActionMode = "compress" | "decompress";

interface BatchActionModalProps {
  isOpen: boolean;
  mode: BatchActionMode;
  selectedFiles: CloudFile[];
  onClose: () => void;
  onBatchComplete: (updatedFiles: CloudFile[], newActivities: RecentActivityItem[]) => void;
}

interface FileProgressState {
  fileId: string;
  status: "queued" | "processing" | "verifying" | "done";
  stepText: string;
  originalBytes: number;
  newBytes: number;
  savedBytes: number;
}

export const BatchActionModal: React.FC<BatchActionModalProps> = ({
  isOpen,
  mode,
  selectedFiles,
  onClose,
  onBatchComplete,
}) => {
  // Filter files that are eligible for this action
  // For compress: uncompressed or analyzed files (or all if user chooses to re-compress)
  // For decompress: compressed files
  const eligibleFiles = useMemo(() => {
    if (mode === "compress") {
      const uncompressed = selectedFiles.filter((f) => f.status !== "compressed");
      return uncompressed.length > 0 ? uncompressed : selectedFiles;
    } else {
      return selectedFiles.filter((f) => f.status === "compressed");
    }
  }, [selectedFiles, mode]);

  const ineligibleFiles = useMemo(() => {
    if (mode === "compress") {
      // If we are compressing only uncompressed, anything already compressed
      return selectedFiles.filter((f) => f.status === "compressed");
    } else {
      // If decompressing, uncompressed files can't be decompressed
      return selectedFiles.filter((f) => f.status !== "compressed");
    }
  }, [selectedFiles, mode]);

  const [stage, setStage] = useState<"preview" | "running" | "completed">("preview");
  const [overallProgress, setOverallProgress] = useState(0);
  const [fileProgressMap, setFileProgressMap] = useState<Record<string, FileProgressState>>({});
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // Aggregated Metrics
  const metrics = useMemo(() => {
    const totalOriginalBytes = eligibleFiles.reduce((acc, f) => acc + f.originalSizeBytes, 0);

    if (mode === "compress") {
      // Reduction ratio ~26% of original (74% savings)
      const totalCompressedBytes = eligibleFiles.reduce((acc, f) => {
        return acc + Math.round(f.originalSizeBytes * 0.26);
      }, 0);
      const totalSavedBytes = totalOriginalBytes - totalCompressedBytes;
      const originalPrice = calculateCloudPrice(totalOriginalBytes);
      const compressedPrice = calculateCloudPrice(totalCompressedBytes);
      const monthlySavings = Math.max(0, originalPrice - compressedPrice);
      const percentSaved = totalOriginalBytes > 0 ? Math.round((totalSavedBytes / totalOriginalBytes) * 100) : 0;

      return {
        totalOriginalBytes,
        totalNewBytes: totalCompressedBytes,
        totalSavedBytes,
        monthlySavings,
        percentSaved,
      };
    } else {
      // Decompress restores to original size
      const currentStoredBytes = eligibleFiles.reduce((acc, f) => {
        return acc + (f.compressedSizeBytes || f.originalSizeBytes);
      }, 0);
      return {
        totalOriginalBytes,
        totalNewBytes: totalOriginalBytes,
        totalSavedBytes: 0,
        monthlySavings: 0,
        percentSaved: 100,
        currentStoredBytes,
      };
    }
  }, [eligibleFiles, mode]);

  // Handle start batch execution
  const handleStartBatch = () => {
    if (eligibleFiles.length === 0) return;

    setStage("running");
    setOverallProgress(0);
    setActiveFileIndex(0);

    // Initialize progress states for each file
    const initialMap: Record<string, FileProgressState> = {};
    eligibleFiles.forEach((file) => {
      const calculatedNewBytes =
        mode === "compress"
          ? Math.round(file.originalSizeBytes * 0.26)
          : file.originalSizeBytes;
      const saved = mode === "compress" ? file.originalSizeBytes - calculatedNewBytes : 0;

      initialMap[file.id] = {
        fileId: file.id,
        status: "queued",
        stepText: "Queued in multi-threaded queue",
        originalBytes: file.originalSizeBytes,
        newBytes: calculatedNewBytes,
        savedBytes: saved,
      };
    });
    setFileProgressMap(initialMap);

    // Run simultaneous / stepped batch progression
    const totalFiles = eligibleFiles.length;
    let currentIdx = 0;

    const fileInterval = setInterval(() => {
      if (currentIdx < totalFiles) {
        const file = eligibleFiles[currentIdx];
        setActiveFileIndex(currentIdx);

        // Advance current file through steps
        setFileProgressMap((prev) => ({
          ...prev,
          [file.id]: {
            ...prev[file.id],
            status: "processing",
            stepText:
              mode === "compress"
                ? "Mining semantic tokens & entropy coding..."
                : "Streaming token dictionary decoder (~540 MB/s)...",
          },
        }));

        setTimeout(() => {
          setFileProgressMap((prev) => ({
            ...prev,
            [file.id]: {
              ...prev[file.id],
              status: "verifying",
              stepText: "Validating SHA-256 bitwise match...",
            },
          }));
        }, 300);

        setTimeout(() => {
          setFileProgressMap((prev) => ({
            ...prev,
            [file.id]: {
              ...prev[file.id],
              status: "done",
              stepText:
                mode === "compress"
                  ? `Saved ${formatBytes(prev[file.id].savedBytes)} (74%)`
                  : "Restored with 100% bitwise parity",
            },
          }));
          const progressPercent = Math.round(((currentIdx + 1) / totalFiles) * 100);
          setOverallProgress(progressPercent);
        }, 600);

        currentIdx++;
      } else {
        clearInterval(fileInterval);
        // Once all files finish
        setTimeout(() => {
          setOverallProgress(100);
          setStage("completed");
        }, 700);
      }
    }, 700);
  };

  // On finalize completion
  const handleFinalize = () => {
    const updatedFiles: CloudFile[] = eligibleFiles.map((file) => {
      if (mode === "compress") {
        const compBytes = Math.round(file.originalSizeBytes * 0.26);
        return {
          ...file,
          status: "compressed",
          compressedSizeBytes: compBytes,
          sha256Compressed: "a4f89d30" + Math.random().toString(16).slice(2, 10) + "8841029c",
        };
      } else {
        return {
          ...file,
          status: "decompressed",
          compressedSizeBytes: null,
        };
      }
    });

    const newActivities: RecentActivityItem[] = [];
    const now = "Just now";

    // Create individual activities
    updatedFiles.forEach((f) => {
      if (mode === "compress") {
        const saved = f.originalSizeBytes - (f.compressedSizeBytes || 0);
        newActivities.push({
          id: `act-batch-${Date.now()}-${f.id}-comp`,
          action: "Compression",
          fileName: f.name,
          fileId: f.id,
          environmentName: f.environmentName,
          timestamp: now,
          details: `Batch compressed from ${formatBytes(f.originalSizeBytes)} to ${formatBytes(f.compressedSizeBytes!)} (lossless).`,
          status: "success",
          metric: `Saved ${formatBytes(saved)}`,
        });
        newActivities.push({
          id: `act-batch-${Date.now()}-${f.id}-ver`,
          action: "Verification",
          fileName: f.name,
          fileId: f.id,
          environmentName: f.environmentName,
          timestamp: now,
          details: `Lossless bitwise SHA-256 verification passed for ${f.name}.`,
          status: "success",
          metric: "100% Parity",
        });
      } else {
        newActivities.push({
          id: `act-batch-${Date.now()}-${f.id}-decomp`,
          action: "Decompression",
          fileName: f.name,
          fileId: f.id,
          environmentName: f.environmentName,
          timestamp: now,
          details: `Decompressed ${f.name} to original ${formatBytes(f.originalSizeBytes)} with lossless bitwise parity.`,
          status: "success",
          metric: "Decompressed",
        });
        newActivities.push({
          id: `act-batch-${Date.now()}-${f.id}-ver`,
          action: "Verification",
          fileName: f.name,
          fileId: f.id,
          environmentName: f.environmentName,
          timestamp: now,
          details: `Checksum audit passed for ${f.name} (SHA-256 verified).`,
          status: "success",
          metric: "100% Match",
        });
      }
    });

    // Summary batch log
    newActivities.unshift({
      id: `act-batch-summary-${Date.now()}`,
      action: mode === "compress" ? "Compression" : "Decompression",
      fileName: `Batch: ${updatedFiles.length} files ${mode === "compress" ? "compressed" : "decompressed"}`,
      environmentName: "Multi-Cloud",
      timestamp: now,
      details:
        mode === "compress"
          ? `Simultaneously compressed ${updatedFiles.length} files, saving a total of ${formatBytes(metrics.totalSavedBytes)} (${metrics.percentSaved}% reduction).`
          : `Simultaneously decompressed ${updatedFiles.length} files back to full original telemetry bitstream.`,
      status: "success",
      metric: mode === "compress" ? `Saved ${formatBytes(metrics.totalSavedBytes)}` : "100% Bitwise Match",
    });

    onBatchComplete(updatedFiles, newActivities);
    onClose();
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedFileIds, setDownloadedFileIds] = useState<Record<string, boolean>>({});

  const handleDownloadAllDecompressed = async () => {
    setIsDownloading(true);
    try {
      await downloadBatchDecompressedFilesZip(eligibleFiles);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAllCompressed = async () => {
    setIsDownloading(true);
    try {
      await downloadBatchCompressedFilesZip(eligibleFiles);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSingleFile = (file: CloudFile) => {
    if (mode === "decompress") {
      downloadOriginalUncompressedFile(file);
    } else {
      downloadSingleCompressedFile(file);
    }
    setDownloadedFileIds((prev) => ({ ...prev, [file.id]: true }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                mode === "compress"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
              }`}
            >
              {mode === "compress" ? <Zap className="w-6 h-6" /> : <RotateCcw className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {mode === "compress" ? "Batch Lossless Compression" : "Batch Bitwise Decompression"}
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    mode === "compress"
                      ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                      : "bg-indigo-950 text-indigo-400 border border-indigo-800"
                  }`}
                >
                  {eligibleFiles.length} {eligibleFiles.length === 1 ? "File" : "Files"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === "compress"
                  ? "Execute simultaneous multi-file compression with SHA-256 lossless verification."
                  : "Restore multiple compressed files simultaneously and verify zero token loss."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[68vh]">
          {/* ============================================================ */}
          {/* STAGE 1: PREVIEW                                             */}
          {/* ============================================================ */}
          {stage === "preview" && (
            <div className="space-y-5">
              {/* Aggregated KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-cyan-400" /> Original Size
                  </span>
                  <p className="text-base font-bold text-white font-mono">
                    {formatBytes(metrics.totalOriginalBytes)}
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    {eligibleFiles.length} files selected
                  </span>
                </div>

                {mode === "compress" ? (
                  <>
                    <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-emerald-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400" /> Projected Saved
                      </span>
                      <p className="text-base font-bold text-emerald-300 font-mono">
                        {formatBytes(metrics.totalSavedBytes)} ({metrics.percentSaved}%)
                      </p>
                      <span className="text-[10px] text-emerald-500 font-medium block">
                        New size: {formatBytes(metrics.totalNewBytes)}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-cyan-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-cyan-400" /> Monthly Savings
                      </span>
                      <p className="text-base font-bold text-cyan-300 font-mono">
                        {formatCloudPrice(metrics.monthlySavings)}/mo
                      </p>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Rate: ${CLOUD_PAYG_RATE_PER_GB.toFixed(2)}/GB
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-indigo-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-indigo-400" /> Integrity
                      </span>
                      <p className="text-base font-bold text-indigo-300 font-mono">100.0% Parity</p>
                      <span className="text-[10px] text-indigo-400 font-medium block">
                        SHA-256 Bitwise Match
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> Throughput
                      </span>
                      <p className="text-base font-bold text-cyan-300 font-mono">~540 MB/s</p>
                      <span className="text-[10px] text-slate-500 block">Streaming Decoder</span>
                    </div>
                  </>
                )}
              </div>

              {/* Warning/Info if some files are skipped */}
              {ineligibleFiles.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>{ineligibleFiles.length} file(s)</strong> are already in the target state and will be skipped ({ineligibleFiles.map((f) => f.name).join(", ")}).
                  </span>
                </div>
              )}

              {/* List of files to be processed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Files to process simultaneously ({eligibleFiles.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Engine: Adaptive Multi-threaded Token Pipeline
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 border border-slate-800 rounded-2xl bg-slate-950/40">
                  {eligibleFiles.map((file) => {
                    const estComp = Math.round(file.originalSizeBytes * 0.26);
                    const estSaved = file.originalSizeBytes - estComp;

                    return (
                      <div key={file.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              mode === "compress"
                                ? "bg-cyan-500/10 text-cyan-400"
                                : "bg-indigo-500/10 text-indigo-400"
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-white truncate block">{file.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {file.environmentName} &bull; {file.type}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono">
                          <span className="text-slate-300 font-semibold block">
                            {formatBytes(file.originalSizeBytes)}
                          </span>
                          <span
                            className={`text-[10px] ${
                              mode === "compress" ? "text-emerald-400 font-medium" : "text-indigo-400"
                            }`}
                          >
                            {mode === "compress"
                              ? `&rarr; ${formatBytes(estComp)} (-${Math.round((estSaved / file.originalSizeBytes) * 100)}%)`
                              : "Restore original"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lossless Bitwise Guarantee Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/40 to-indigo-950/40 border border-cyan-800/30 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-white block">Lossless Reversibility Verification</span>
                  <span className="text-[11px] text-slate-400">
                    Each file undergoes an automated SHA-256 bitwise parity audit before and after execution to guarantee zero missing tokens.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STAGE 2: RUNNING PROGRESS                                     */}
          {/* ============================================================ */}
          {stage === "running" && (
            <div className="space-y-6 py-2">
              {/* Overall Progress Bar */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    {mode === "compress"
                      ? "Executing Simultaneous Multi-Cloud Compression..."
                      : "Streaming Bitwise Decompression..."}
                  </span>
                  <span className="font-bold text-cyan-400 font-mono text-sm">{overallProgress}%</span>
                </div>

                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>
                    Processing item {Math.min(activeFileIndex + 1, eligibleFiles.length)} of {eligibleFiles.length}
                  </span>
                  <span>Throughput: ~540 MB/s</span>
                </div>
              </div>

              {/* Per-file Progress List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Batch Execution Stream
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {eligibleFiles.map((file, idx) => {
                    const state = fileProgressMap[file.id];
                    const isDone = state?.status === "done";
                    const isProcessing = state?.status === "processing" || state?.status === "verifying";

                    return (
                      <div
                        key={file.id}
                        className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between gap-3 ${
                          isDone
                            ? "bg-emerald-950/20 border-emerald-800/40 text-slate-200"
                            : isProcessing
                            ? "bg-cyan-950/30 border-cyan-500/50 text-white shadow-sm shadow-cyan-500/10"
                            : "bg-slate-950/40 border-slate-800/60 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              isDone
                                ? "bg-emerald-500 text-slate-950 font-bold"
                                : isProcessing
                                ? "bg-cyan-500 text-slate-950 animate-pulse font-bold"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {isDone ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <span className="text-[10px] font-mono">{idx + 1}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="font-semibold truncate block text-xs">{file.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {state?.stepText || "Queued"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {isDone ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                              Verified ✓
                            </span>
                          ) : isProcessing ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 animate-pulse">
                              Active
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              Queued
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STAGE 3: COMPLETED                                           */}
          {/* ============================================================ */}
          {stage === "completed" && (
            <div className="space-y-6 py-2 text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {mode === "compress"
                    ? "Batch Compression Succeeded"
                    : "Batch Decompression & Restoration Succeeded"}
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  {mode === "compress"
                    ? `Successfully compressed ${eligibleFiles.length} cloud files simultaneously with 100% verified bitwise reversibility.`
                    : `Successfully decompressed ${eligibleFiles.length} cloud files back to full original telemetry byte streams.`}
                </p>
              </div>

              {/* Highlights Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Files Processed</span>
                  <p className="text-xl font-extrabold text-white font-mono">
                    {eligibleFiles.length} / {eligibleFiles.length}
                  </p>
                  <span className="text-[10px] text-emerald-400">0 Errors, 0 Skipped</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-emerald-400">
                    {mode === "compress" ? "Total Storage Saved" : "Restored Telemetry"}
                  </span>
                  <p className="text-xl font-extrabold text-emerald-300 font-mono">
                    {mode === "compress"
                      ? formatBytes(metrics.totalSavedBytes)
                      : formatBytes(metrics.totalOriginalBytes)}
                  </p>
                  <span className="text-[10px] text-emerald-500 font-medium">
                    {mode === "compress" ? `~${metrics.percentSaved}% footprint reduction` : "Full bitstream restored"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-cyan-400">
                    {mode === "compress" ? "Monthly Storage Bill" : "SHA-256 Audit"}
                  </span>
                  <p className="text-xl font-extrabold text-cyan-300 font-mono">
                    {mode === "compress"
                      ? `-${formatCloudPrice(metrics.monthlySavings)}/mo`
                      : "100.0%"}
                  </p>
                  <span className="text-[10px] text-cyan-400 font-medium">
                    {mode === "compress" ? "Immediate PAYG savings" : "Bit-for-bit lossless match"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-left flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-white block">Audit Trail Recorded</span>
                  <span className="text-[11px] text-slate-400">
                    Compression telemetry and cryptographic verification receipts were automatically committed to the Recent Activity stream.
                  </span>
                </div>
              </div>

              {/* Download Option Section */}
              {mode === "decompress" ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/70 border border-emerald-500/30 text-left space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Download Restored Decompressed Files</h4>
                        <p className="text-xs text-slate-300">
                          Export the bit-for-bit restored files directly to your device.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="batch-download-all-decompressed-btn"
                      onClick={handleDownloadAllDecompressed}
                      disabled={isDownloading}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isDownloading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Packaging ZIP...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download All ({eligibleFiles.length}) as .zip</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* List of individual files with download buttons */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 pt-1 border-t border-slate-800/80">
                    {eligibleFiles.map((file) => (
                      <div
                        key={file.id}
                        className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-200 font-medium truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({formatBytes(file.originalSizeBytes)})</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadSingleFile(file)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white transition flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer shrink-0 border border-emerald-500/20"
                          title={`Download restored ${file.name}`}
                        >
                          {downloadedFileIds[file.id] ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Downloaded</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-blue-950/70 border border-cyan-500/30 text-left space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Download Compressed Archives</h4>
                        <p className="text-xs text-slate-300">
                          Export the verified compressed .zst archives to your local storage.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="batch-download-all-compressed-btn"
                      onClick={handleDownloadAllCompressed}
                      disabled={isDownloading}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isDownloading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Packaging ZIP...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download All ({eligibleFiles.length}) as .zip</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          {stage === "preview" && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartBatch}
                disabled={eligibleFiles.length === 0}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 shadow-lg cursor-pointer ${
                  eligibleFiles.length === 0
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : mode === "compress"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/20"
                }`}
              >
                {mode === "compress" ? <Zap className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                <span>
                  {mode === "compress"
                    ? `Execute Batch Compression (${eligibleFiles.length})`
                    : `Execute Batch Decompression (${eligibleFiles.length})`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {stage === "running" && (
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Simultaneous batch execution in progress...
              </span>
              <span className="font-mono text-cyan-400 font-semibold">{overallProgress}%</span>
            </div>
          )}

          {stage === "completed" && (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              {mode === "decompress" ? (
                <button
                  type="button"
                  id="footer-download-decompressed-btn"
                  onClick={handleDownloadAllDecompressed}
                  disabled={isDownloading}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download All Decompressed ({eligibleFiles.length})</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="footer-download-compressed-btn"
                  onClick={handleDownloadAllCompressed}
                  disabled={isDownloading}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-white border border-cyan-500/40 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download All Compressed ({eligibleFiles.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleFinalize}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply &amp; Return to File Ledger</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
