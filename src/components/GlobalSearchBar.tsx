import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  X,
  FileText,
  Eye,
  Info,
  Zap,
  Sparkles,
  Cloud,
  CheckCircle2,
  ArrowRight,
  Filter,
  Layers,
  CornerDownLeft,
} from "lucide-react";
import { CloudFile, CloudEnvironmentInfo } from "../types";
import { CLOUD_ENVIRONMENTS } from "../data/cloudData";
import { formatBytes } from "../utils/formatters";

interface GlobalSearchBarProps {
  files: CloudFile[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenFile: (file: CloudFile) => void;
  onInspectFile: (file: CloudFile) => void;
  onCompressFile: (file: CloudFile) => void;
  onAIAnalyzeFile: (fileId: string) => void;
  onViewAllInTable?: () => void;
}

type ProviderFilter = "all" | "AWS" | "Azure" | "GCP" | "Hybrid Cloud";

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  files,
  searchQuery,
  onSearchChange,
  onOpenFile,
  onInspectFile,
  onCompressFile,
  onAIAnalyzeFile,
  onViewAllInTable,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProviderFilter, setActiveProviderFilter] = useState<ProviderFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Map environments by ID for fast provider lookup
  const envMap = useMemo(() => {
    const map = new Map<string, CloudEnvironmentInfo>();
    CLOUD_ENVIRONMENTS.forEach((e) => map.set(e.id, e));
    return map;
  }, []);

  // Filter files based on search query AND provider chip filter
  const searchResults = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();

    return files.filter((f) => {
      const env = envMap.get(f.environmentId);
      const provider = env?.provider || "";

      // Provider chip filter
      if (activeProviderFilter !== "all" && provider !== activeProviderFilter) {
        return false;
      }

      // If no text typed but provider selected or dropdown open, show files
      if (!trimmed) {
        return activeProviderFilter !== "all";
      }

      // Query matching across name, type, provider, environmentName, category, status
      const matchesName = f.name.toLowerCase().includes(trimmed);
      const matchesType = f.type.toLowerCase().includes(trimmed);
      const matchesProvider = provider.toLowerCase().includes(trimmed);
      const matchesEnv = f.environmentName.toLowerCase().includes(trimmed);
      const matchesCategory = f.category.toLowerCase().includes(trimmed);
      const matchesStatus = f.status.toLowerCase().includes(trimmed);

      return (
        matchesName ||
        matchesType ||
        matchesProvider ||
        matchesEnv ||
        matchesCategory ||
        matchesStatus
      );
    });
  }, [files, searchQuery, activeProviderFilter, envMap]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsMobileSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd+K / Ctrl+K / /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is already typing in another input/textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "/" && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Arrow key navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        const selected = searchResults[selectedIndex];
        onOpenFile(selected);
        setIsOpen(false);
      } else if (onViewAllInTable) {
        onViewAllInTable();
        setIsOpen(false);
      }
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case "AWS":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
          dot: "bg-amber-400",
        };
      case "Azure":
        return {
          bg: "bg-blue-500/10 border-blue-500/30 text-blue-300",
          dot: "bg-blue-400",
        };
      case "GCP":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
          dot: "bg-emerald-400",
        };
      default:
        return {
          bg: "bg-purple-500/10 border-purple-500/30 text-purple-300",
          dot: "bg-purple-400",
        };
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl mx-2 sm:mx-4">
      {/* Mobile Search Icon Toggle on very small screens if collapsed */}
      <div className="flex items-center w-full">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-cyan-400/80" />
          </div>

          <input
            ref={inputRef}
            type="text"
            id="global-search-input"
            value={searchQuery}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search files by name, type, or cloud (AWS, Azure, GCP)..."
            className="w-full pl-9 pr-20 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner backdrop-blur-md"
            autoComplete="off"
            spellCheck={false}
          />

          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                id="global-search-clear-btn"
                onClick={() => {
                  onSearchChange("");
                  setActiveProviderFilter("all");
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono text-slate-400 pointer-events-none">
                <span>⌘K</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Results Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[85vh] flex flex-col">
          {/* Quick Provider Filter Bar inside dropdown */}
          <div className="px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyan-400" /> Filter:
              </span>
              {(["all", "AWS", "Azure", "GCP", "Hybrid Cloud"] as ProviderFilter[]).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setActiveProviderFilter(prov)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    activeProviderFilter === prov
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {prov === "all" ? "All Clouds" : prov}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              {searchResults.length} {searchResults.length === 1 ? "match" : "matches"}
            </span>
          </div>

          {/* List of Matching Files */}
          <div className="overflow-y-auto divide-y divide-slate-800/60 p-1 max-h-[380px]">
            {searchResults.length > 0 ? (
              searchResults.map((file, idx) => {
                const env = envMap.get(file.environmentId);
                const provider = env?.provider || "Cloud";
                const badge = getProviderBadge(provider);
                const isSelected = idx === selectedIndex;
                const isCompressed = file.status === "compressed" && file.compressedSizeBytes !== null;

                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      onOpenFile(file);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`group px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-slate-800/90 text-white"
                        : "hover:bg-slate-900/80 text-slate-200"
                    }`}
                  >
                    {/* Left File Information */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isCompressed
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-white truncate group-hover:text-cyan-300 transition">
                            {file.name}
                          </span>

                          {/* Cloud Provider Pill */}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold inline-flex items-center gap-1 font-mono ${badge.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {provider}
                          </span>

                          {/* Category Tag */}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {file.category === "log" ? "Log" : "Activity"} &bull; {file.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                          <span>{file.environmentName}</span>
                          <span>&bull;</span>
                          <span>{formatBytes(file.originalSizeBytes)}</span>
                          {isCompressed && (
                            <>
                              <span>&rarr;</span>
                              <span className="text-emerald-400 font-bold">
                                {formatBytes(file.compressedSizeBytes!)} (
                                {Math.round(
                                  ((file.originalSizeBytes - file.compressedSizeBytes!) /
                                    file.originalSizeBytes) *
                                    100
                                )}
                                % saved)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Interactive Actions */}
                    <div
                      className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onOpenFile(file);
                          setIsOpen(false);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
                        title="Open file viewer"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onInspectFile(file);
                          setIsOpen(false);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
                        title="Inspect file details & PAYG pricing"
                      >
                        <Info className="w-3.5 h-3.5 text-blue-400" />
                      </button>

                      {file.status === "uncompressed" && (
                        <button
                          type="button"
                          onClick={() => {
                            onCompressFile(file);
                            setIsOpen(false);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 transition cursor-pointer"
                          title="Compress file"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onAIAnalyzeFile(file.id);
                          setIsOpen(false);
                        }}
                        className="p-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700/60 transition cursor-pointer"
                        title="AI Analysis"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  No files found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Try searching by file name (e.g. <span className="text-cyan-400">auth</span>, <span className="text-cyan-400">.log</span>), file type (<span className="text-cyan-400">syslog</span>, <span className="text-cyan-400">cloudtrail</span>), or cloud provider (<span className="text-amber-400">AWS</span>, <span className="text-blue-400">Azure</span>, <span className="text-emerald-400">GCP</span>).
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-3.5 py-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">↵</kbd>
                <span>Open</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">ESC</kbd>
                <span>Close</span>
              </span>
            </div>

            {onViewAllInTable && (
              <button
                type="button"
                onClick={() => {
                  onViewAllInTable();
                  setIsOpen(false);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition cursor-pointer"
              >
                <span>View all in table</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
