import React, { useState } from "react";
import { X, Copy, Check, Search, Download, FileText, Activity, ShieldCheck, HardDrive, RotateCcw } from "lucide-react";
import { CloudFile } from "../types";
import { formatBytes } from "../utils/formatters";
import { downloadSingleCompressedFile, downloadOriginalUncompressedFile } from "../utils/fileDownload";

interface OpenFileModalProps {
  file: CloudFile;
  onClose: () => void;
  onOpenDetails: (file: CloudFile) => void;
  onTriggerCompress: (file: CloudFile) => void;
}

export const OpenFileModal: React.FC<OpenFileModalProps> = ({
  file,
  onClose,
  onOpenDetails,
  onTriggerCompress,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);

  const sampleLines = Array.isArray(file?.sampleContent) ? file.sampleContent : [];
  const filteredLines = sampleLines.filter((line) =>
    (line || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleLines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-xl shrink-0 ${
              file.category === "log"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
            }`}>
              {file.category === "log" ? <FileText className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">{file.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                  file.category === "log"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                    : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                }`}>
                  {file.category === "log" ? "Cloud Log File" : "Cloud Activity File"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {file.environmentName}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {file.description || `Raw telemetry captured from ${file.environmentName}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-open-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Toolbar */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>Original: <strong className="text-white">{formatBytes(file.originalSizeBytes)}</strong></span>
            </span>
            {file.compressedSizeBytes && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span>Compressed: <strong className="text-white">{formatBytes(file.compressedSizeBytes)}</strong></span>
                <span className="text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  {Math.round((1 - file.compressedSizeBytes / file.originalSizeBytes) * 100)}% Saved
                </span>
              </span>
            )}
            <span className="hidden sm:inline text-slate-500">&bull;</span>
            <span className="hidden sm:inline text-slate-400">Lines: ~{file.linesCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDetails(file);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition cursor-pointer"
            >
              View Full Details
            </button>
            {file.status !== "compressed" && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerCompress(file);
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <span>Compress Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter / Search within file */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search text or pattern inside sample lines..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* Log Viewer Content Area */}
        <div className="p-4 bg-slate-950 font-mono text-xs overflow-y-auto flex-1 text-slate-300 selection:bg-cyan-500/30">
          <div className="space-y-1">
            {filteredLines.length > 0 ? (
              filteredLines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 py-1 px-2 rounded hover:bg-slate-900/60 transition group"
                >
                  <span className="text-slate-600 select-none text-[11px] w-8 shrink-0 text-right">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200 break-all leading-relaxed whitespace-pre-wrap">
                    {line}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500">
                <p>No matching lines found for "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono truncate max-w-[280px] sm:max-w-md">
              SHA-256: {file.sha256Original}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {file.status === "compressed" ? (
              <>
                <button
                  type="button"
                  onClick={() => downloadOriginalUncompressedFile(file)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white border border-emerald-500/35 transition flex items-center gap-1.5 cursor-pointer font-medium"
                  title="Decompress and download restored file"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Decompress &amp; Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadSingleCompressedFile(file)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-white border border-cyan-500/35 transition flex items-center gap-1.5 cursor-pointer font-medium"
                  title="Download .zst compressed archive"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>.zst</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => downloadOriginalUncompressedFile(file)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white border border-emerald-500/35 transition flex items-center gap-1.5 cursor-pointer font-medium"
                title={file.status === "decompressed" ? "Download decompressed file" : "Download raw file"}
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{file.status === "decompressed" ? "Download Decompressed" : "Download File"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Sample"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
