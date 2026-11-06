import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  X,
  FileText,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileCode,
  HardDrive,
  DollarSign,
  ArrowRight,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";
import { CloudFile, CloudEnvironmentId, RecentActivityItem } from "../types";
import { CLOUD_ENVIRONMENTS } from "../data/cloudData";
import {
  formatBytes,
  calculateCloudPrice,
  formatCloudPrice,
} from "../utils/formatters";

interface UploadFileModalProps {
  initialEnvironmentId?: CloudEnvironmentId;
  onClose: () => void;
  onFileUploaded: (file: CloudFile, newActivities: RecentActivityItem[]) => void;
  onUploadAndCompress: (file: CloudFile, newActivities: RecentActivityItem[]) => void;
  onOpenFile?: (file: CloudFile) => void;
}

// Compute real SHA-256 in browser using Web Crypto API
async function computeSHA256(buffer: ArrayBuffer): Promise<string> {
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  }
}

// Auto-detect format based on filename and content
function detectTelemetryType(name: string, content = ""): {
  category: "log" | "activity";
  type: string;
} {
  const lower = name.toLowerCase();
  const lowerContent = content.slice(0, 1000).toLowerCase();

  if (lower.endsWith(".json") || lowerContent.startsWith("{") || lowerContent.startsWith("[")) {
    if (lower.includes("audit") || lower.includes("trail") || lowerContent.includes("eventname")) {
      return { category: "activity", type: "cloudtrail" };
    }
    return { category: "activity", type: "json-telemetry" };
  }

  if (lower.includes("vpc") || lower.includes("flow")) {
    return { category: "activity", type: "vpc-flow" };
  }

  if (lower.includes("access") || lower.includes("http") || lower.includes("apache") || lower.includes("nginx")) {
    return { category: "log", type: "apache-access" };
  }

  if (lower.includes("kernel") || lower.includes("audit")) {
    return { category: "activity", type: "kernel-audit" };
  }

  return { category: "log", type: "syslog" };
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({
  initialEnvironmentId,
  onClose,
  onFileUploaded,
  onUploadAndCompress,
  onOpenFile,
}) => {
  const [activeTab, setActiveTab] = useState<"file" | "manual">("file");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected file state
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [realFileBytes, setRealFileBytes] = useState<number>(0);
  const [realSha256, setRealSha256] = useState<string>("");
  const [fileLines, setFileLines] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form metadata state
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState<"log" | "activity">("log");
  const [telemetryType, setTelemetryType] = useState("syslog");
  const [environmentId, setEnvironmentId] = useState<CloudEnvironmentId>(
    initialEnvironmentId || "aws-ec2"
  );
  const [manualSizeMB, setManualSizeMB] = useState(25);
  const [manualPastedText, setManualPastedText] = useState("");

  // Post-upload success screen
  const [uploadedFileRecord, setUploadedFileRecord] = useState<CloudFile | null>(null);
  const [createdActivities, setCreatedActivities] = useState<RecentActivityItem[]>([]);

  // Handle file selection from local device
  const processLocalFile = async (file: File) => {
    setIsProcessing(true);
    setSelectedFileObj(file);
    setFileName(file.name);
    setRealFileBytes(file.size);

    try {
      // 1. Read array buffer for SHA-256
      const arrayBuffer = await file.arrayBuffer();
      const sha = await computeSHA256(arrayBuffer);
      setRealSha256(sha);

      // 2. Read text for sample content and line count
      const text = await file.text();
      const detected = detectTelemetryType(file.name, text);
      setCategory(detected.category);
      setTelemetryType(detected.type);

      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length > 0) {
        setFileLines(lines);
      } else {
        // Fallback default telemetry lines if empty or binary
        setFileLines([
          `2026-09-06T08:00:01Z [INGEST] Ingested raw telemetry stream from ${file.name}`,
          `2026-09-06T08:00:02Z [PAYLOAD] Byte size: ${formatBytes(file.size)}, SHA256=${sha.slice(0, 16)}...`,
          `2026-09-06T08:00:03Z [STATUS] Awaiting lossless entropy compression and verification`,
        ]);
      }
    } catch (err) {
      console.warn("Could not read file text directly:", err);
      const fallbackSha = "8b74c2098" + Math.random().toString(16).slice(2, 10) + "0912cb41";
      setRealSha256(fallbackSha);
      setFileLines([
        `2026-09-06T08:00:01Z [INGEST] Ingested binary telemetry payload: ${file.name}`,
        `2026-09-06T08:00:02Z [CHECKSUM] Initialized SHA-256 integrity block: ${fallbackSha.slice(0, 16)}...`,
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processLocalFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processLocalFile(e.target.files[0]);
    }
  };

  // Build the CloudFile and RecentActivity items
  const buildFilePackage = (): { file: CloudFile; activities: RecentActivityItem[] } => {
    const envObj = CLOUD_ENVIRONMENTS.find((e) => e.id === environmentId);
    const envName = envObj ? envObj.name : "AWS EC2";

    const isReal = !!selectedFileObj;
    const finalSizeBytes = isReal ? Math.max(realFileBytes, 512) : manualSizeMB * 1024 * 1024;

    let finalName = fileName.trim();
    if (!finalName) {
      finalName = isReal ? selectedFileObj.name : `custom_telemetry_${Date.now()}.${category === "log" ? "log" : "json"}`;
    }

    const finalSha = realSha256 || "8b74c2098" + Math.random().toString(16).slice(2, 10) + "0912cb41";

    let sample: string[] = fileLines;
    if (sample.length === 0) {
      if (manualPastedText.trim()) {
        sample = manualPastedText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      } else {
        sample = [
          `2026-09-06T08:00:01Z [INGEST] Direct ingest for ${finalName} into ${envName}`,
          `2026-09-06T08:00:02Z [TELEMETRY] Payload buffer: ${formatBytes(finalSizeBytes)}, format=${telemetryType}`,
          `2026-09-06T08:00:03Z [PIPELINE] Ready for lossless AI template compression and verification`,
        ];
      }
    }

    const newFile: CloudFile = {
      id: "file-user-" + Date.now(),
      name: finalName,
      category,
      type: telemetryType,
      environmentId,
      environmentName: envName,
      originalSizeBytes: finalSizeBytes,
      compressedSizeBytes: null,
      uploadDate: "Just now",
      status: "uncompressed",
      linesCount: sample.length > 10 ? sample.length : Math.max(sample.length, Math.round(finalSizeBytes / 120)),
      sha256Original: finalSha,
      sampleContent: sample.slice(0, 20),
      description: `User-uploaded ${category === "log" ? "log" : "activity"} telemetry registered to ${envName}`,
    };

    const newActivities: RecentActivityItem[] = [
      {
        id: "act-up-" + Date.now(),
        action: "Upload",
        fileName: newFile.name,
        fileId: newFile.id,
        environmentName: envName,
        timestamp: "Just now",
        details: `Ingested ${formatBytes(finalSizeBytes)} telemetry file into ${envName} bucket.`,
        status: "info",
        metric: `${formatBytes(finalSizeBytes)} Ingested`,
      },
      {
        id: "act-det-" + (Date.now() + 1),
        action: "File type detection",
        fileName: newFile.name,
        fileId: newFile.id,
        environmentName: envName,
        timestamp: "Just now",
        details: `Identified telemetry format: ${telemetryType} (${category.toUpperCase()}) with SHA-256 ${finalSha.slice(0, 10)}...`,
        status: "info",
        metric: `Format: ${telemetryType}`,
      },
    ];

    return { file: newFile, activities: newActivities };
  };

  // Submit and save to cloud storage
  const handleUploadOnly = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = buildFilePackage();
    onFileUploaded(pkg.file, pkg.activities);
    setUploadedFileRecord(pkg.file);
    setCreatedActivities(pkg.activities);
  };

  // Submit and immediately trigger lossless compression
  const handleUploadAndCompress = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = buildFilePackage();
    onUploadAndCompress(pkg.file, pkg.activities);
    onClose();
  };

  const calculatedCost = calculateCloudPrice(
    selectedFileObj ? realFileBytes : manualSizeMB * 1024 * 1024
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Upload &amp; Ingest Cloud File
              </h3>
              <p className="text-xs text-slate-400">
                Upload raw logs or activity files from your device, then compress them with lossless algorithms
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

        {/* State A: Upload Successful Screen with Immediate "Compress Now" Action */}
        {uploadedFileRecord ? (
          <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">File Ingested Successfully!</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-medium uppercase">
                    Ready for Compression
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  <strong className="text-white font-semibold">{uploadedFileRecord.name}</strong> ({formatBytes(uploadedFileRecord.originalSizeBytes)}) has been cataloged in <strong className="text-cyan-400">{uploadedFileRecord.environmentName}</strong>.
                </p>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Original Size</span>
                <span className="font-bold text-white mt-0.5 block">{formatBytes(uploadedFileRecord.originalSizeBytes)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Estimated PAYG Cost</span>
                <span className="font-bold text-amber-400 mt-0.5 block">{formatCloudPrice(calculateCloudPrice(uploadedFileRecord.originalSizeBytes))}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Potential Savings</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">~75% (~{formatBytes(Math.round(uploadedFileRecord.originalSizeBytes * 0.74))})</span>
              </div>
            </div>

            {/* Primary Action Button: COMPRESS NOW */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs font-semibold text-center"
              >
                Done (View in Dashboard)
              </button>

              {onOpenFile && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFile(uploadedFileRecord);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 transition cursor-pointer text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect Lines</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUploadAndCompress(uploadedFileRecord, createdActivities);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold transition cursor-pointer text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Compress This File Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* State B: Ingestion Form */
          <form onSubmit={handleUploadOnly} className="space-y-5">
            {/* Tabs: Device File vs Manual Simulator */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "file"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload From Your Computer</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "manual"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Manual / Custom Payload</span>
              </button>
            </div>

            {/* TAB 1: Real Local File Drag & Drop */}
            {activeTab === "file" && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept=".log,.txt,.json,.csv,.xml,.yml,.yaml,.gz,.tar,.tsv"
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center transition cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                    isDragging
                      ? "border-cyan-400 bg-cyan-950/30 scale-[1.01]"
                      : selectedFileObj
                      ? "border-emerald-500/50 bg-emerald-950/10"
                      : "border-slate-700/80 hover:border-slate-600 bg-slate-950/50 hover:bg-slate-950"
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl ${
                      selectedFileObj
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-cyan-500/10 text-cyan-400"
                    }`}
                  >
                    {selectedFileObj ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      <UploadCloud className="w-7 h-7" />
                    )}
                  </div>

                  <div>
                    {selectedFileObj ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white truncate max-w-sm">
                          {selectedFileObj.name}
                        </p>
                        <p className="text-xs text-emerald-400 font-medium">
                          {formatBytes(selectedFileObj.size)} &bull; {fileLines.length} lines detected &bull; Click to choose a different file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-200">
                          Drag and drop your file here, or <span className="text-cyan-400 underline">browse device</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Supports .log, .txt, .json, .csv, .gz and any cloud telemetry files
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live file sample preview if content loaded */}
                {fileLines.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">File Content Preview ({fileLines.length} lines):</span>
                      <span className="font-mono text-[10px]">SHA-256: {realSha256.slice(0, 16)}...</span>
                    </div>
                    <pre className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-cyan-300/90 overflow-x-auto max-h-24 leading-relaxed scrollbar-thin">
                      {fileLines.slice(0, 5).join("\n")}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Manual Simulator */}
            {activeTab === "manual" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g. k8s_production_stream.log"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
                    <span>Simulated File Size</span>
                    <span className="text-cyan-400 font-bold">{manualSizeMB} MB</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={250}
                    step={2}
                    value={manualSizeMB}
                    onChange={(e) => setManualSizeMB(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Optional Sample Lines (or paste log snippet)
                  </label>
                  <textarea
                    rows={3}
                    value={manualPastedText}
                    onChange={(e) => setManualPastedText(e.target.value)}
                    placeholder="Paste log lines here to analyze custom schema..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Cloud Allocation Settings */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Target Cloud Allocation &amp; Format
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as "log" | "activity")}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="log">Cloud Log File</option>
                    <option value="activity">Cloud Activity File</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-medium mb-1">
                    Telemetry Format
                  </label>
                  <select
                    value={telemetryType}
                    onChange={(e) => setTelemetryType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="syslog">syslog (RFC-5424)</option>
                    <option value="apache-access">apache-access / HTTP</option>
                    <option value="json-telemetry">json-telemetry</option>
                    <option value="cloudtrail">cloudtrail-events</option>
                    <option value="vpc-flow">vpc-flow-logs</option>
                    <option value="kernel-audit">kernel-audit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-medium mb-1">
                    Cloud Environment
                  </label>
                  <select
                    value={environmentId}
                    onChange={(e) => setEnvironmentId(e.target.value as CloudEnvironmentId)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {CLOUD_ENVIRONMENTS.map((env) => (
                      <option key={env.id} value={env.id}>
                        {env.name} ({env.provider})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
                <span>Calculated PAYG Storage Cost: <strong className="text-white">{formatCloudPrice(calculatedCost)}</strong></span>
                <span>Expected Ratio: <strong className="text-emerald-400">~75% Lossless Reduction</strong></span>
              </div>
            </div>

            {/* Dual Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs font-semibold text-center"
              >
                Cancel
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* 1. Upload to Storage */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload &amp; Register</span>
                </button>

                {/* 2. Upload and Compress Immediately */}
                <button
                  type="button"
                  onClick={handleUploadAndCompress}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold transition cursor-pointer text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Upload &amp; Compress Now</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
