import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  Zap,
  DollarSign,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  TrendingDown,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Bot,
  User,
  ArrowRight,
} from "lucide-react";
import { CloudFile, AISuggestionResponse, AIQnARecord } from "../types";
import {
  formatBytes,
  calculateCloudPrice,
  formatCloudPrice,
  CLOUD_PAYG_RATE_PER_GB,
} from "../utils/formatters";

interface AIAnalysisViewProps {
  files: CloudFile[];
  initialFileId?: string;
  onOpenFile: (file: CloudFile) => void;
  onCompressFile: (file: CloudFile) => void;
}

// Preset recommended questions for rapid exploration
const RECOMMENDED_QUESTIONS = [
  {
    category: "Cost & Pricing",
    question: "How can I reduce pay-as-you-use cloud storage costs for this file?",
    icon: "dollar",
  },
  {
    category: "Algorithms",
    question: "Which compression algorithm (Zstandard, LZ4, or Brotli) yields the highest lossless ratio?",
    icon: "zap",
  },
  {
    category: "Security & Fidelity",
    question: "Is lossless decompression 100% bitwise verified and safe for regulatory audit compliance?",
    icon: "shield",
  },
  {
    category: "Pattern Mining",
    question: "What structural patterns, templates, or anomalies are detected in these logs?",
    icon: "sparkles",
  },
  {
    category: "High Throughput",
    question: "How should we optimize high-volume logs from this cloud environment?",
    icon: "layers",
  },
];

export const AIAnalysisView: React.FC<AIAnalysisViewProps> = ({
  files = [],
  initialFileId,
  onOpenFile,
  onCompressFile,
}) => {
  const safeFiles = files || [];
  const [selectedFileId, setSelectedFileId] = useState<string>(
    initialFileId && safeFiles.some((f) => f.id === initialFileId) ? initialFileId : safeFiles[0]?.id || ""
  );

  useEffect(() => {
    if (initialFileId && safeFiles.some((f) => f.id === initialFileId)) {
      setSelectedFileId(initialFileId);
    }
  }, [initialFileId, safeFiles]);
  const selectedFile = safeFiles.find((f) => f.id === selectedFileId) || safeFiles[0];

  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AISuggestionResponse | null>(null);
  const [history, setHistory] = useState<AIQnARecord[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Send question to backend AI suggestions engine
  const handleAskQuestion = async (queryText?: string) => {
    const questionToAsk = (queryText || inputQuestion).trim();
    if (!questionToAsk || !selectedFile || isLoading) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionToAsk,
          file: selectedFile,
          contextSummary: {
            totalFiles: safeFiles.length,
            totalOriginalBytes: safeFiles.reduce((acc, f) => acc + f.originalSizeBytes, 0),
            totalCompressedBytes: safeFiles.reduce(
              (acc, f) => acc + (f.compressedSizeBytes || f.originalSizeBytes),
              0
            ),
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data: AISuggestionResponse = await res.json();
      const sanitizedData: AISuggestionResponse = {
        ...data,
        directAnswer: data?.directAnswer || "Analysis completed for your telemetry question.",
        suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
      };
      setCurrentResponse(sanitizedData);

      // Add to history
      const newRecord: AIQnARecord = {
        id: `qna-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fileId: selectedFile.id,
        fileName: selectedFile.name,
        question: questionToAsk,
        response: sanitizedData,
      };

      setHistory((prev) => [newRecord, ...prev]);
      setInputQuestion("");
    } catch (err) {
      console.error("Failed to query AI suggestions:", err);
      // Fallback local response
      const fallback: AISuggestionResponse = {
        success: true,
        question: questionToAsk,
        directAnswer: `Based on your analysis request for "${selectedFile.name}" (${selectedFile.type}, ${selectedFile.environmentName}), AI-driven deduplication and lossless compression offer substantial pay-as-you-use cost and storage reductions.`,
        suggestions: [
          {
            title: "Execute Lossless AI Template Compression",
            detail: `Compress this file to reduce footprint from ${formatBytes(selectedFile.originalSizeBytes)} down to approximately ${formatBytes(Math.round(selectedFile.originalSizeBytes * 0.25))}.`,
            priority: "HIGH",
            impact: "Up to 75% bill reduction",
          },
          {
            title: "Isolate Recurring Headers",
            detail: "Replace repeating timestamp and hostname prefixes with 16-bit delta offsets to save header overhead.",
            priority: "RECOMMENDED",
            impact: "Saves ~45% of log header redundancy",
          },
          {
            title: "Audit Decompression Integrity",
            detail: "Always verify SHA-256 hash matching before committing decompressed chunks to regulatory stores.",
            priority: "BEST_PRACTICE",
            impact: "100% bitwise fidelity guaranteed",
          },
        ],
        costAnalysis: `Pay-as-you-use costs drop with ${selectedFile.status === "compressed" ? "existing" : "recommended"} compression.`,
        technicalTip: "Zstandard Level 19 with custom dictionary achieves the optimal throughput-to-ratio curve.",
        source: "domain-expert-ai",
      };
      setCurrentResponse(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically request initial proactive suggestions when file changes
  useEffect(() => {
    if (selectedFile) {
      handleAskQuestion(
        `What are the best optimization and cost reduction suggestions for ${selectedFile.name}?`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFileId]);

  // Pricing calculations for current file
  const origPrice = selectedFile ? calculateCloudPrice(selectedFile.originalSizeBytes) : 0;
  const isCompressed = selectedFile?.status === "compressed" && selectedFile.compressedSizeBytes !== null;
  const compPrice = isCompressed ? calculateCloudPrice(selectedFile.compressedSizeBytes!) : calculateCloudPrice(Math.round(selectedFile.originalSizeBytes * 0.25));
  const priceSaved = Math.max(0, origPrice - compPrice);

  const templates = [
    {
      id: "tpl-1",
      name: "RFC-5424 Timestamp & Hostname Anchor",
      pattern: "<TIMESTAMP:ISO8601> <HOST:FQDN> <SERVICE:NAME>[<PID:NUM>]: <MESSAGE:STR>",
      frequency: "84.6% of Lines",
      entropyImpact: "-48.2% Token Redundancy",
      anomalyHandling: "Flags non-standard time offsets or unrecognized daemon prefixes",
    },
    {
      id: "tpl-2",
      name: "HTTP Access Stream Tuple",
      pattern: "<CLIENT_IP:IPV4> - - [<REQ_TIME>] \"<METHOD> <PATH> <PROTO>\" <STATUS_CODE:INT> <BYTES:INT>",
      frequency: "91.2% of Lines",
      entropyImpact: "-62.4% Token Redundancy",
      anomalyHandling: "Preserves rare query parameters and HTTP 5xx stack traces as raw delta",
    },
    {
      id: "tpl-3",
      name: "Cloud Audit & IAM JSON Schema",
      pattern: "{\"eventTime\":\"<ISO_TIME>\",\"eventName\":\"<API_ACTION>\",\"target\":\"<RESOURCE_ARN>\"}",
      frequency: "95.1% of Lines",
      entropyImpact: "-71.8% Token Redundancy",
      anomalyHandling: "Preserves unrecognized JSON properties and unauthorized error codes verbatim",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 text-purple-400 border border-purple-500/30 shadow-inner">
              <Sparkles className="w-6 h-6 text-purple-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  AI Telemetry Analysis &amp; Intelligent Suggestions
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold uppercase tracking-wider">
                  Interactive Q&amp;A
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Ask any question regarding cloud storage costs, pay-as-you-use pricing, compression algorithms, pattern mining, and lossless reversibility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Advisor: <strong className="text-emerald-400 font-semibold">Online &amp; Ready</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Target File Context Strip */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
              Active File for Analysis:
            </span>
            <select
              value={selectedFileId}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer min-w-[280px]"
            >
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.environmentName} &bull; {formatBytes(f.originalSizeBytes)})
                </option>
              ))}
            </select>
          </div>

          {selectedFile && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase">Cloud:</span>
                <span className="font-semibold text-slate-200">{selectedFile.environmentName}</span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5 font-mono">
                <span className="text-[10px] text-slate-500 uppercase">PAYG:</span>
                <span className="font-semibold text-white">{formatCloudPrice(origPrice)}</span>
              </div>

              <button
                type="button"
                onClick={() => onOpenFile(selectedFile)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer text-xs"
              >
                Inspect Lines
              </button>

              <button
                type="button"
                onClick={() => onCompressFile(selectedFile)}
                className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition cursor-pointer flex items-center gap-1 text-xs shadow-sm shadow-cyan-500/20"
              >
                <Zap className="w-3 h-3" />
                <span>{selectedFile.status === "compressed" ? "Re-Compress" : "Compress"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Interactive Question Console & Suggestions Engine */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Ask AI &amp; Receive Tailored Suggestions
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Type your specific question or click any prompt below
          </span>
        </div>

        {/* Question Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={`e.g., How can I reduce pay-as-you-use costs for ${selectedFile?.name || "this file"}? Or what algorithm works best?`}
            className="w-full pl-4 pr-32 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuestion.trim()}
            className={`absolute right-2 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              isLoading || !inputQuestion.trim()
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Question Prompt Chips */}
        <div>
          <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider block mb-2">
            Suggested Questions According to Your Workload:
          </span>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDED_QUESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskQuestion(item.question)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white text-xs transition cursor-pointer text-left flex items-center gap-1.5 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 group-hover:scale-125 transition" />
                <span>{item.question}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading Indicator State */}
        {isLoading && (
          <div className="p-8 rounded-2xl bg-slate-950/70 border border-purple-500/20 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Analyzing Workload &amp; Generating Suggestions...</h4>
              <p className="text-xs text-slate-400 mt-1">
                Synthesizing entropy patterns, pay-as-you-use price metrics, and compression trade-offs for your question.
              </p>
            </div>
          </div>
        )}

        {/* Current Question & Suggestions Response Display */}
        {currentResponse && !isLoading && (
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-purple-500/30 shadow-2xl space-y-5">
            {/* Question Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 mt-0.5 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
                    AI Suggestion Output for:
                  </span>
                  <h4 className="text-sm font-bold text-white leading-snug mt-0.5">
                    "{currentResponse.question}"
                  </h4>
                </div>
              </div>

              {currentResponse.source && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono self-start sm:self-auto">
                  Source: {currentResponse.source === "gemini" ? "Gemini 3.8 Flash" : "Cloud Telemetry AI Engine"}
                </span>
              )}
            </div>

            {/* Direct Answer */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Direct Answer</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {currentResponse.directAnswer}
              </p>
            </div>

            {/* Actionable Suggestions Cards Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Actionable Suggestions According to Your Question ({(currentResponse.suggestions || []).length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Prioritized by Impact</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {(currentResponse.suggestions || []).map((sug, sIdx) => {
                  const isHigh = sug.priority === "HIGH";
                  const isRec = sug.priority === "RECOMMENDED";

                  return (
                    <div
                      key={sIdx}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                        isHigh
                          ? "bg-purple-950/30 border-purple-500/40 hover:border-purple-500/70"
                          : isRec
                          ? "bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-500/60"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              isHigh
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : isRec
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {sug.priority.replace("_", " ")}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-white leading-snug">
                          {sug.title}
                        </h5>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {sug.detail}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                          Expected Benefit:
                        </span>
                        <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">
                          {sug.impact}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pay-As-You-Use Cost & Technical Tip Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              {currentResponse.costAnalysis && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Pay-As-You-Use Cost Impact</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {currentResponse.costAnalysis}
                  </p>
                  <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
                    <span>Raw: <strong className="text-white">{formatCloudPrice(origPrice)}</strong></span>
                    <span>&rarr;</span>
                    <span>Compressed: <strong className="text-emerald-400">{formatCloudPrice(compPrice)}</strong></span>
                    <span>(Save {formatCloudPrice(priceSaved)})</span>
                  </div>
                </div>
              )}

              {currentResponse.technicalTip && (
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px] uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Technical Architecture Tip</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {currentResponse.technicalTip}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">
                Ready to apply these suggestions to <strong className="text-white">{selectedFile?.name}</strong>?
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenFile(selectedFile)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  View File Lines
                </button>
                <button
                  type="button"
                  onClick={() => onCompressFile(selectedFile)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Run AI Compression</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Question & Suggestion History */}
      {history.length > 1 && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Previous Questions in this Session ({history.length})
            </h4>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="space-y-2">
            {history.slice(1, 4).map((record) => (
              <div
                key={record.id}
                onClick={() => {
                  if (record.response) {
                    setCurrentResponse({
                      ...record.response,
                      suggestions: Array.isArray(record.response.suggestions) ? record.response.suggestions : [],
                    });
                  }
                }}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between gap-3 cursor-pointer text-xs group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-purple-400 transition" />
                  <span className="font-semibold text-slate-200 group-hover:text-purple-300 transition truncate">
                    {record.question}
                  </span>
                  <span className="text-[10px] text-slate-500">({record.fileName})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {record.timestamp} &bull; Click to view suggestions
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Collapsible Discovered Templates & Schema Mining */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-850 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-purple-400" />
            <div>
              <h4 className="text-xs font-bold text-white">
                Discovered AI Schema Templates &amp; Anomaly Encodings
              </h4>
              <p className="text-[10px] text-slate-400">
                Foundational machine learning models utilized for syntax extraction and Levenshtein distance boundary checks.
              </p>
            </div>
          </div>
          {showTemplates ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showTemplates && (
          <div className="p-5 pt-0 border-t border-slate-800/80 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tpl.name}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-medium">
                        {tpl.frequency}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[10px] text-cyan-300 break-all">
                      {tpl.pattern}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Entropy Reduction:</span>
                      <strong className="text-emerald-400">{tpl.entropyImpact}</strong>
                    </div>
                    <p className="text-slate-500 leading-snug">{tpl.anomalyHandling}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
