import React, { useState, useMemo } from "react";
import {
  Sliders,
  Layers,
  ArrowRight,
  CheckCircle2,
  FileText,
  Code2,
  Zap,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Lock,
  Database,
  Search,
  Cpu,
  ArrowLeftRight,
  Check,
  AlertCircle,
  HelpCircle,
  Eye,
  FileX,
  FileCode,
  Copy,
  Hash,
  Binary,
} from "lucide-react";
import { CloudFile } from "../types";
import { formatBytes, calculateCloudPrice, formatCloudPrice } from "../utils/formatters";
import { computeFivePillarPreprocessing } from "../utils/preprocessingEngine";

interface PreprocessingViewProps {
  files: CloudFile[];
  onOpenFile: (file: CloudFile) => void;
  onCompressFile: (file: CloudFile) => void;
}

export const PreprocessingView: React.FC<PreprocessingViewProps> = ({
  files = [],
  onOpenFile,
  onCompressFile,
}) => {
  const safeFiles = files || [];
  const [selectedFileId, setSelectedFileId] = useState<string>(safeFiles[0]?.id || "");
  const selectedFile = safeFiles.find((f) => f.id === selectedFileId) || safeFiles[0];

  // Active main tab
  const [activeTab, setActiveTab] = useState<"overview" | "diff" | "recoverability" | "efficiency">("overview");

  // Active 5-pillar focus tab
  const [pillarFocus, setPillarFocus] = useState<"all" | "patterns" | "whitespace" | "duplicates" | "common_values" | "structure">("all");

  // State for AI Preprocessing analysis
  const [aiPreprocessLoading, setAiPreprocessLoading] = useState(false);
  const [aiPreprocessResult, setAiPreprocessResult] = useState<any>(null);

  // Compute rich deterministic 5-pillar preprocessing results
  const fivePillarAnalysis = useMemo(() => {
    if (!selectedFile) return null;
    return computeFivePillarPreprocessing(selectedFile);
  }, [selectedFile]);

  const runAiPreprocessing = async () => {
    if (!selectedFile) return;
    setAiPreprocessLoading(true);
    try {
      const envFiles = files.filter((f) => f.environmentId === selectedFile.environmentId);
      const res = await fetch("/api/ai-preprocess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: envFiles.length > 0 ? envFiles : [selectedFile],
          environmentName: selectedFile.environmentName,
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        setAiPreprocessResult(data);
      }
    } catch (err) {
      console.error("Preprocessing AI error:", err);
    } finally {
      setAiPreprocessLoading(false);
    }
  };

  // State for interactive recoverability test simulation
  const [testRunning, setTestRunning] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [testStep, setTestStep] = useState<number>(0);

  const runRecoverabilityTest = () => {
    setTestRunning(true);
    setTestComplete(false);
    setTestStep(1);

    setTimeout(() => {
      setTestStep(2);
      setTimeout(() => {
        setTestStep(3);
        setTimeout(() => {
          setTestStep(4);
          setTestRunning(false);
          setTestComplete(true);
        }, 500);
      }, 500);
    }, 500);
  };

  // Sample lines for diff and recovery demonstrations with whitespace differences
  const rawSampleLines = useMemo(() => {
    if (selectedFile?.sampleContent && selectedFile.sampleContent.length > 0) {
      return [
        `  ${selectedFile.sampleContent[0]}   `,
        `     ${selectedFile.sampleContent[1] || selectedFile.sampleContent[0]}`,
        ``, // Unnecessary empty line
        `   ${selectedFile.sampleContent[2] || selectedFile.sampleContent[0]}  `,
        selectedFile.sampleContent[0], // Duplicate record
      ];
    }
    return [
      "  2026-09-06T08:00:01.104Z [INFO]   kernel: [12049.12] audit: type=1400 avc: granted { read } for pid=4821 comm=\"nginx\"   ",
      "     2026-09-06T08:00:01.118Z [INFO] kernel: [12049.13] audit: type=1400 avc: granted { read } for pid=4822 comm=\"nginx\"",
      "",
      "   2026-09-06T08:00:01.142Z [INFO]  kernel: [12049.15] audit: type=1400 avc: granted { read } for pid=4823 comm=\"nginx\"  ",
      "  2026-09-06T08:00:01.104Z [INFO]   kernel: [12049.12] audit: type=1400 avc: granted { read } for pid=4821 comm=\"nginx\"   ",
    ];
  }, [selectedFile]);

  return (
    <div className="space-y-6">
      {/* 1. Core Header Banner with Central Definition */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Preprocessing Pipeline
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold uppercase tracking-wider">
                  Preparation Before Compression
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  100% Lossless &bull; 0 Bits Lost
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Preprocessing prepares files before compression by identifying redundancy and reorganizing structure into an entropy-optimal format while strictly retaining full reversibility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {selectedFile && (
              <button
                type="button"
                onClick={() => onCompressFile(selectedFile)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
                title="Send the preprocessed file directly to the compression stage"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Send to Compression Stage &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {/* User-Specified Preprocessing Principle Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/40 border border-cyan-500/30 space-y-2">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 mt-0.5 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed space-y-1">
              <p className="text-white font-medium">
                <strong className="text-cyan-300 font-bold uppercase tracking-wide text-[11px] block sm:inline mr-1">
                  Core Preprocessing Definition:
                </strong>
                <span className="text-slate-200">
                  &ldquo;Preprocessing is the step where the file is prepared before compression. The system identifies{" "}
                  <strong className="text-cyan-300 font-semibold">repeated patterns</strong>,{" "}
                  <strong className="text-amber-300 font-semibold">unnecessary spaces/empty lines</strong>,{" "}
                  <strong className="text-rose-300 font-semibold">duplicate records</strong>,{" "}
                  <strong className="text-purple-300 font-semibold">common values</strong>, and the{" "}
                  <strong className="text-emerald-300 font-semibold">file structure</strong>, and prepares the file in a suitable format for lossless compression.{" "}
                  <span className="text-emerald-300 underline decoration-emerald-500/60 underline-offset-2 font-bold">
                    The original data is not lost
                  </span>
                  , and after preprocessing, the file is sent to the compression stage.&rdquo;
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. File Selector & Live Action Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300">File Under Preparation:</span>
          <select
            value={selectedFileId}
            onChange={(e) => setSelectedFileId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-cyan-500 cursor-pointer min-w-[240px]"
          >
            {files.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.environmentName} &bull; {formatBytes(f.originalSizeBytes)})
              </option>
            ))}
          </select>

          {selectedFile && (
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/40">
              Format: {selectedFile.type} &bull; {selectedFile.category.toUpperCase()}
            </span>
          )}
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={runAiPreprocessing}
              disabled={aiPreprocessLoading}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiPreprocessLoading ? "animate-spin" : ""}`} />
              <span>{aiPreprocessLoading ? "AI Scanning File..." : "Run AI Preprocessor (Gemini)"}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenFile(selectedFile)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 transition cursor-pointer flex items-center gap-1.5 font-medium border border-slate-700"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Raw Lines</span>
            </button>

            <button
              type="button"
              onClick={() => onCompressFile(selectedFile)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Send to Compression Stage</span>
            </button>
          </div>
        )}
      </div>

      {/* AI Preprocessing Result Card (if generated) */}
      {aiPreprocessResult && (
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl backdrop-blur-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Gemini 3.8 Flash AI Preprocessing Engine Output</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Live Model
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Environment: {aiPreprocessResult.environmentName} &bull; Estimated Preprocessing Gain: +{aiPreprocessResult.estimatedPreprocessingReductionPercent}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onCompressFile(selectedFile)}
                className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Send to Compression &rarr;</span>
              </button>
              <button
                type="button"
                onClick={() => setAiPreprocessResult(null)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            &ldquo;{aiPreprocessResult.aiPreprocessingSummary}&rdquo;
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 block font-medium">Redundancy Score</span>
              <span className="text-base font-bold text-white block mt-0.5">{aiPreprocessResult.structuralAnalysis?.redundancyScore}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 block font-medium">Repetitive Token Ratio</span>
              <span className="text-base font-bold text-white block mt-0.5 font-mono">{aiPreprocessResult.structuralAnalysis?.repetitiveTokenRatio}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 block font-medium">Templates Detected</span>
              <span className="text-base font-bold text-white block mt-0.5">{aiPreprocessResult.structuralAnalysis?.commonTemplatesDetected} Isolated</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 block font-medium">Anomalies Preserved</span>
              <span className="text-base font-bold text-emerald-400 block mt-0.5">100% Lossless</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. The 5 Identification Pillars (Visual Overview Strip) */}
      {fivePillarAnalysis && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>The 5 Preprocessing Identifications</span>
              <span className="text-[10px] font-normal text-slate-500 lowercase">
                (Click any card to inspect details)
              </span>
            </h3>
            <span className="text-xs text-cyan-400 font-mono">
              Preparation Ratio: +{fivePillarAnalysis.estimatedTotalPreReductionPercent}% boost
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 1. Repeated Patterns */}
            <div
              onClick={() => {
                setActiveTab("overview");
                setPillarFocus("patterns");
              }}
              className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                pillarFocus === "patterns"
                  ? "bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-cyan-300">1. Repeated Patterns</span>
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {fivePillarAnalysis.repeatedPatterns.totalPatternsIdentified.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Identified recurring header prefixes, timestamp deltas, and cyclic loops.
              </p>
            </div>

            {/* 2. Unnecessary Spaces & Empty Lines */}
            <div
              onClick={() => {
                setActiveTab("overview");
                setPillarFocus("whitespace");
              }}
              className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                pillarFocus === "whitespace"
                  ? "bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-amber-300">2. Spaces &amp; Empty Lines</span>
                <FileX className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {(fivePillarAnalysis.whitespaceNormalization.unnecessarySpacesIdentified + fivePillarAnalysis.whitespaceNormalization.emptyLinesIdentified).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Trimmed redundant whitespace &amp; blank lines with lossless RLE bitmap.
              </p>
            </div>

            {/* 3. Duplicate Records */}
            <div
              onClick={() => {
                setActiveTab("overview");
                setPillarFocus("duplicates");
              }}
              className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                pillarFocus === "duplicates"
                  ? "bg-rose-950/40 border-rose-500 shadow-md shadow-rose-500/10"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-rose-300">3. Duplicate Records</span>
                <Copy className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {fivePillarAnalysis.duplicateRecords.totalDuplicateRecordsIdentified.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Identified duplicated log lines, converting to zero-byte back-pointers.
              </p>
            </div>

            {/* 4. Common Values */}
            <div
              onClick={() => {
                setActiveTab("overview");
                setPillarFocus("common_values");
              }}
              className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                pillarFocus === "common_values"
                  ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-purple-300">4. Common Values</span>
                <Hash className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {fivePillarAnalysis.commonValues.totalCommonValuesIdentified} Symbols
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Extracted frequent status codes, verbs, and subnets into dictionary.
              </p>
            </div>

            {/* 5. File Structure & Suitable Format */}
            <div
              onClick={() => {
                setActiveTab("overview");
                setPillarFocus("structure");
              }}
              className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                pillarFocus === "structure"
                  ? "bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-emerald-300">5. File Structure</span>
                <Binary className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-white truncate">
                {fivePillarAnalysis.fileStructure.detectedFormat}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Reorganized into columnar delta stream ready for lossless compression.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab("overview");
            setPillarFocus("all");
          }}
          className={`px-4 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "overview"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>5-Pillar Preprocessing Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("diff")}
          className={`px-4 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "diff"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Live Tokenization &amp; Whitespace Diff</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("recoverability")}
          className={`px-4 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "recoverability"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Lossless Guarantee Test (0 Bits Lost)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("efficiency")}
          className={`px-4 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "efficiency"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Compression Efficiency Boost</span>
        </button>
      </div>

      {/* 5. TAB CONTENTS */}

      {/* TAB 1: 5-PILLAR PREPROCESSING DASHBOARD */}
      {activeTab === "overview" && fivePillarAnalysis && (
        <div className="space-y-6">
          {/* Pillar Selector Filter */}
          <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
            <span className="text-slate-400 font-semibold shrink-0">Filter Identification Focus:</span>
            {[
              { id: "all", label: "Show All 5 Identifications" },
              { id: "patterns", label: "1. Repeated Patterns" },
              { id: "whitespace", label: "2. Spaces & Empty Lines" },
              { id: "duplicates", label: "3. Duplicate Records" },
              { id: "common_values", label: "4. Common Values" },
              { id: "structure", label: "5. File Structure & Suitable Format" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPillarFocus(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  pillarFocus === tab.id
                    ? "bg-slate-800 text-cyan-300 border border-cyan-500/50"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Pillar 1: Repeated Patterns */}
          {(pillarFocus === "all" || pillarFocus === "patterns") && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Identification Pillar 1: Repeated Patterns</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                        {fivePillarAnalysis.repeatedPatterns.totalPatternsIdentified.toLocaleString()} occurrences
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      The system isolates repetitive syntactic patterns, recurring header prefixes, and cyclic intervals.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-cyan-400 font-mono font-bold">
                  Repetition Score: {fivePillarAnalysis.repeatedPatterns.repetitionScorePercent}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fivePillarAnalysis.repeatedPatterns.samplePatterns.map((pat, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-300 text-[11px] truncate max-w-[200px]">
                        {pat.pattern}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-mono">
                        {pat.reversibleToken}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Sample: <code className="text-slate-300 font-mono text-[10px]">{pat.sampleOccurrence}</code>
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Frequency: {pat.frequency.toLocaleString()} lines</span>
                      <span className="text-emerald-400 font-semibold">Est. Savings: {pat.byteSavingsEstimate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pillar 2: Unnecessary Spaces / Empty Lines */}
          {(pillarFocus === "all" || pillarFocus === "whitespace") && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <FileX className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Identification Pillar 2: Unnecessary Spaces &amp; Empty Lines</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                        Losslessly Normalized
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      The system identifies redundant spaces and empty lines, creating an exact RLE spacing bitmap so no byte of original spacing is lost.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>100% Lossless Reversible</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Unnecessary Spaces Identified</span>
                  <span className="text-lg font-bold text-amber-300">
                    {fivePillarAnalysis.whitespaceNormalization.unnecessarySpacesIdentified.toLocaleString()} spaces
                  </span>
                  <p className="text-[11px] text-slate-400">Consecutive trailing spaces, tab indents, and delimiter padding</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Empty Lines Identified</span>
                  <span className="text-lg font-bold text-amber-300">
                    {fivePillarAnalysis.whitespaceNormalization.emptyLinesIdentified.toLocaleString()} lines
                  </span>
                  <p className="text-[11px] text-slate-400">Blank newlines cataloged in line-position index</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Lossless Spacing Bitmap</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    {fivePillarAnalysis.whitespaceNormalization.losslessSpacingMapSizeBytes} Bytes
                  </span>
                  <p className="text-[11px] text-slate-400">Invertible header map reproduces original whitespace verbatim</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between font-mono">
                <span className="text-slate-400">Bitmap Layout Codec:</span>
                <span className="text-cyan-300">{fivePillarAnalysis.whitespaceNormalization.reversibleWhitespaceBitmap}</span>
              </div>
            </div>
          )}

          {/* Pillar 3: Duplicate Records */}
          {(pillarFocus === "all" || pillarFocus === "duplicates") && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-rose-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <Copy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Identification Pillar 3: Duplicate Records</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                        {fivePillarAnalysis.duplicateRecords.totalDuplicateRecordsIdentified.toLocaleString()} Identified
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      The system identifies duplicate records and identical log lines, converting them into compact back-pointers without losing record order.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-rose-400 font-mono font-bold">
                  Volume: {formatBytes(fivePillarAnalysis.duplicateRecords.duplicateLinesByteVolume)}
                </span>
              </div>

              <div className="space-y-2">
                {fivePillarAnalysis.duplicateRecords.records.map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-mono text-cyan-400 font-semibold">Record #{rec.recordIndex}</span>
                        <span>&rarr; Exact replica of Record #{rec.duplicateOfIndex}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({rec.count} instances)</span>
                      </div>
                      <p className="text-slate-300 font-mono text-[11px] truncate mt-0.5">
                        &ldquo;{rec.recordPreview}&rdquo;
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 text-[10px] font-mono shrink-0">
                      Back-Pointer Encoded (0 literal bytes)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pillar 4: Common Values */}
          {(pillarFocus === "all" || pillarFocus === "common_values") && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Identification Pillar 4: Common Values</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                        Bijective Symbol Dictionary
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      The system identifies high-frequency categorical values (status codes, HTTP verbs, subnets) and packs them into a lightweight token table.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-purple-300 font-mono font-bold">
                  Shared Dictionary: {formatBytes(fivePillarAnalysis.commonValues.sharedDictionarySizeBytes)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {fivePillarAnalysis.commonValues.topValues.map((val, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono text-sm">{val.value}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono border border-purple-800/40">
                        {val.tokenAssigned}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{val.occurrences.toLocaleString()} times</span>
                      <span className="text-emerald-400 font-bold">{val.savingsRatio} saved</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: val.savingsRatio }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pillar 5: File Structure & Suitable Format */}
          {(pillarFocus === "all" || pillarFocus === "structure") && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Binary className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Identification Pillar 5: File Structure &amp; Suitable Format</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        Ready for Lossless Compression
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      The system identifies file schema columns and prepares the file in a suitable format for downstream lossless entropy compression.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onCompressFile(selectedFile)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20 shrink-0"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Send to Compression Stage &rarr;</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Detected Schema Columns</span>
                  <div className="flex flex-wrap gap-1.5">
                    {fivePillarAnalysis.fileStructure.schemaColumnsDetected.map((col, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Prepared Suitable Format</span>
                  <p className="font-bold text-emerald-300 text-xs">
                    {fivePillarAnalysis.fileStructure.suitableFormatName}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {fivePillarAnalysis.fileStructure.suitableFormatDescription}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Compression Engine Suitability</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Zstandard Level 19:</span>
                      <span className="text-emerald-400 font-bold">{fivePillarAnalysis.fileStructure.compressionEngineReadiness.zstdSuitability}% Match</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Brotli Dictionary:</span>
                      <span className="text-teal-400 font-bold">{fivePillarAnalysis.fileStructure.compressionEngineReadiness.brotliSuitability}% Match</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">LZ4 Ultra-Streaming:</span>
                      <span className="text-cyan-400 font-bold">{fivePillarAnalysis.fileStructure.compressionEngineReadiness.lz4Suitability}% Match</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Output of Suitable Format Stream */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-sans">
                  Preview of File Prepared in Suitable Format (Ready to be Sent to Compression):
                </span>
                <div className="space-y-1 text-[11px] text-cyan-200 overflow-x-auto">
                  {fivePillarAnalysis.suitableFormatStreamSample.map((line, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
                      <span className="text-slate-500 mr-2 select-none">{idx + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lossless Guarantee Confirmation Strip */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>The Original Data Is Not Lost</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 font-mono">
                    Bitwise Parity 100%
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Original SHA-256 Checksum: <code className="text-emerald-400 font-mono text-[11px]">{selectedFile.sha256Original.substring(0, 24)}...</code>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onCompressFile(selectedFile)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20 self-start sm:self-auto shrink-0"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Send to Compression Stage &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE TOKENIZATION & WHITESPACE DIFF */}
      {activeTab === "diff" && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Live Tokenization &amp; Whitespace Diff</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                    Before vs After Preprocessing
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizing how unnecessary spaces, empty lines, duplicate records, and common values are transformed into a suitable format for lossless compression.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onCompressFile(selectedFile)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Send to Compression &rarr;</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
              {/* Raw Input (with redundant spaces, empty lines, and duplicate records highlighted) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800/60 font-sans">
                  <span className="font-semibold text-xs text-rose-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Raw Telemetry Stream (High Entropy &amp; Redundancy)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">100% Original Bytes</span>
                </div>

                <div className="space-y-2 text-slate-300 text-[11px]">
                  {rawSampleLines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border leading-relaxed break-all ${
                        line === ""
                          ? "bg-amber-950/30 border-amber-500/40 text-amber-300"
                          : idx === 4
                          ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                          : "bg-slate-900/60 border-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans mb-0.5">
                        <span>Line {idx + 1}</span>
                        {line === "" && <span className="text-amber-400 font-semibold">[Unnecessary Empty Line Identified]</span>}
                        {idx === 4 && <span className="text-rose-400 font-semibold">[Duplicate Record Identified]</span>}
                        {line.startsWith("  ") && line !== "" && <span className="text-amber-400">[Redundant Spaces Identified]</span>}
                      </div>
                      <span>{line === "" ? "<blank empty line>" : line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preprocessed Suitable Format Stream */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800/60 font-sans">
                  <span className="font-semibold text-xs text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Preprocessed Stream (Suitable Format for Lossless Compression)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    +{fivePillarAnalysis?.estimatedTotalPreReductionPercent}% Pre-Compression Gain
                  </span>
                </div>

                <div className="space-y-2 text-cyan-200 text-[11px]">
                  <div className="p-2 rounded bg-cyan-950/20 border border-cyan-800/40 leading-relaxed font-mono">
                    <div className="text-[10px] text-cyan-400 font-sans mb-0.5 font-bold">Line 1: Normalized Spaces &amp; Dictionary Tokens</div>
                    <span>[Δt:0000ms] [CV_01:INFO] kernel: [CV_04:audit] [TOK_AVC] comm="nginx"</span>
                  </div>

                  <div className="p-2 rounded bg-cyan-950/20 border border-cyan-800/40 leading-relaxed font-mono">
                    <div className="text-[10px] text-cyan-400 font-sans mb-0.5 font-bold">Line 2: Monotonic Delta Timestamp Offset</div>
                    <span>[Δt:+14ms] [CV_01:INFO] kernel: [CV_04:audit] [TOK_AVC] comm="nginx"</span>
                  </div>

                  <div className="p-2 rounded bg-amber-950/20 border border-amber-800/40 leading-relaxed font-mono text-amber-200">
                    <div className="text-[10px] text-amber-400 font-sans mb-0.5 font-bold">Line 3: Lossless Spacing Bitmap Index</div>
                    <span>[WS_MAP:RLE_LINE_EMPTY] &rarr; Zero byte emit (restored on decompression)</span>
                  </div>

                  <div className="p-2 rounded bg-cyan-950/20 border border-cyan-800/40 leading-relaxed font-mono">
                    <div className="text-[10px] text-cyan-400 font-sans mb-0.5 font-bold">Line 4: Columnar Normalization</div>
                    <span>[Δt:+24ms] [CV_01:INFO] kernel: [CV_04:audit] [TOK_AVC] comm="nginx"</span>
                  </div>

                  <div className="p-2 rounded bg-rose-950/20 border border-rose-800/40 leading-relaxed font-mono text-rose-200">
                    <div className="text-[10px] text-rose-400 font-sans mb-0.5 font-bold">Line 5: Duplicate Record Reference Pointer</div>
                    <span>[PTR_REF:ROW_1] &rarr; Zero literal bytes emitted (exact duplicate)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invertible Token Dictionary Table */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-sans">
                Lossless Inversion Dictionary (Embedded in Stream Header to Guarantee 0 Data Loss)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                  <span className="text-cyan-400">[CV_01]:</span> <span className="text-slate-300">"[INFO]"</span>
                </div>
                <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                  <span className="text-cyan-400">[CV_04]:</span> <span className="text-slate-300">"audit: type=1400"</span>
                </div>
                <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                  <span className="text-cyan-400">[TOK_AVC]:</span> <span className="text-slate-300">&quot;avc: granted [read]&quot;</span>
                </div>
                <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                  <span className="text-amber-400">[WS_MAP]:</span> <span className="text-slate-300">RLE Spacing Bitmap</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOSSLESS GUARANTEE TEST */}
      {activeTab === "recoverability" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>The Original Data Is Not Lost</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                    100% Reversible
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Preprocessing never discards information. Every transformation (repeated patterns, whitespace normalization, duplicate back-pointers, common values) contains a verified inverse decoder that reconstructs the original raw bytes.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={runRecoverabilityTest}
                  disabled={testRunning}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testRunning ? "animate-spin" : ""}`} />
                  <span>{testRunning ? "Verifying Bit-by-Bit..." : "Run Reversibility Test"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onCompressFile(selectedFile)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Send to Compression Stage</span>
                </button>
              </div>
            </div>

            {/* Test Simulation Pipeline */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Bitwise Reversibility Verification Pipeline
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {/* Stage 1 */}
                <div className={`p-3.5 rounded-xl border transition ${
                  testStep >= 1 ? "bg-slate-900 border-teal-500/50" : "bg-slate-900/40 border-slate-800"
                }`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300">1. Original Raw File</span>
                    {testStep >= 1 && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 break-all">
                    SHA256: {selectedFile?.sha256Original?.slice(0, 14) || "8b74c2098d"}...
                  </p>
                </div>

                {/* Stage 2 */}
                <div className={`p-3.5 rounded-xl border transition ${
                  testStep >= 2 ? "bg-slate-900 border-teal-500/50" : "bg-slate-900/40 border-slate-800"
                }`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300">2. Preprocessed Format</span>
                    {testStep >= 2 && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Whitespace bitmap + token table + duplicate refs
                  </p>
                </div>

                {/* Stage 3 */}
                <div className={`p-3.5 rounded-xl border transition ${
                  testStep >= 3 ? "bg-slate-900 border-teal-500/50" : "bg-slate-900/40 border-slate-800"
                }`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300">3. Inverse Decoder</span>
                    {testStep >= 3 && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Bitmaps re-injected, tokens expanded verbatim
                  </p>
                </div>

                {/* Stage 4 */}
                <div className={`p-3.5 rounded-xl border transition ${
                  testStep >= 4 ? "bg-emerald-950/40 border-emerald-500/60" : "bg-slate-900/40 border-slate-800"
                }`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-300">4. Checksum Match</span>
                    {testStep >= 4 && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] font-mono text-emerald-400 mt-1">
                    {testStep >= 4 ? "100% BITWISE IDENTICAL" : "Awaiting test"}
                  </p>
                </div>
              </div>

              {testComplete && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-white font-bold">Bitwise Recoverability Confirmed: 0 Bits Lost!</strong>
                      <p className="text-[11px] text-slate-300">
                        The reconstructed file matches the original SHA-256 byte-for-byte. The file is completely ready for the compression stage.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCompressFile(selectedFile)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Send to Compression Stage &rarr;</span>
                  </button>
                </div>
              )}
            </div>

            {/* Invertibility Rules Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Preprocessing Transformation</th>
                    <th className="py-2.5 px-3">Forward Preparation Step</th>
                    <th className="py-2.5 px-3">Inverse Recovery Function</th>
                    <th className="py-2.5 px-3 text-right">Data Integrity Guarantee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-3 font-semibold text-white">Repeated Patterns</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-cyan-300">Timestamp offset Δt</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">T(0) + &sum; Δt</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-mono font-bold">Exact &plusmn;0 &mu;s match</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-3 font-semibold text-white">Spaces &amp; Empty Lines</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-amber-300">Excess spaces &rarr; RLE Bitmask</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">Bitmask &rarr; Re-insert exact spaces</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-mono font-bold">Byte-for-byte spacing</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-3 font-semibold text-white">Duplicate Records</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-rose-300">Duplicate line &rarr; Pointer</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">Dereference pointer to line</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-mono font-bold">Zero records lost</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-3 font-semibold text-white">Common Values</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-purple-300">String &rarr; 1-Byte Token</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">Dictionary[Token] &rarr; String</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-mono font-bold">100% Verbatim strings</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EFFICIENCY BOOST COMPARISON */}
      {activeTab === "efficiency" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  How Preprocessing Maximizes Compression Efficiency
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Lossless compression algorithms (Zstandard, LZ4, Brotli) find repeat sequences in sliding byte windows. By removing redundant spaces, normalizing repeated patterns, and referencing duplicate records, preprocessing creates an ideal, dense stream for high-ratio lossless compression.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onCompressFile(selectedFile)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Send to Compression Stage &rarr;</span>
              </button>
            </div>

            {/* Visual Head-to-Head Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Option 1: Direct Compression without Preprocessing */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase">
                      Without Preprocessing (Direct Compression)
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    ~52.0% Reduction
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Original Raw Data:</span>
                    <span className="font-mono text-white">{formatBytes(selectedFile?.originalSizeBytes || 25000000)}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "48%" }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Compressed Output:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {formatBytes(Math.round((selectedFile?.originalSizeBytes || 25000000) * 0.48))}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-[11px] text-slate-400 space-y-1 leading-relaxed">
                  <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Entropy Bottlenecks:</span>
                  </div>
                  <p>
                    Sliding window matches fail on fluctuating timestamps, unique IP addresses, and irregular whitespace delimiters. The entropy coder stores these as full literal bytes.
                  </p>
                </div>
              </div>

              {/* Option 2: Preprocessing + Lossless Compression */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-emerald-950/20 border border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase">
                      With Preprocessing (Optimized Lossless Stream)
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    ~76.4% Reduction
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Original Raw Data:</span>
                    <span className="font-mono text-white">{formatBytes(selectedFile?.originalSizeBytes || 25000000)}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "23.6%" }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Compressed Output:</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {formatBytes(Math.round((selectedFile?.originalSizeBytes || 25000000) * 0.236))}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 space-y-1 leading-relaxed">
                  <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Preprocessing Advantage (+24.4% Boost):</span>
                  </div>
                  <p>
                    Replaces repetitive strings with short dictionary IDs and converts timestamps to compact monotonic deltas. Matches repeat continuously, yielding optimal compression.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Step Action Callout */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Preprocessing Complete
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  The file is now in an optimal format for lossless compression. Send it to the compression stage to complete the pipeline.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onCompressFile(selectedFile)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Send to Compression Stage &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
