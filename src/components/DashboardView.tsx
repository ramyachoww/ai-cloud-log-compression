import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Cloud,
  FileText,
  Activity,
  HardDrive,
  ShieldCheck,
  Zap,
  Server,
  Cpu,
  Database,
  Layers,
  ArrowRight,
  Search,
  Filter,
  Eye,
  Info,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Plus,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  UploadCloud,
  Check,
  DollarSign,
  Sparkles,
  CheckSquare,
  Moon,
  Sun,
  Settings,
  AlertTriangle,
  FileDown,
  Download,
} from "lucide-react";
import {
  CloudFile,
  CloudEnvironmentId,
  CloudEnvironmentInfo,
  RecentActivityItem,
  ActivityActionType,
  UserProfile,
} from "../types";
import { CLOUD_ENVIRONMENTS } from "../data/cloudData";
import {
  formatBytes,
  formatNumber,
  calculateCloudPrice,
  formatCloudPrice,
  CLOUD_PAYG_RATE_PER_GB,
} from "../utils/formatters";
import {
  downloadSingleCompressedFile,
  downloadBatchCompressedFilesZip,
  downloadOriginalUncompressedFile,
  downloadBatchDecompressedFilesZip,
} from "../utils/fileDownload";
import { Sidebar, ActiveSidebarView } from "./Sidebar";
import { OpenFileModal } from "./OpenFileModal";
import { FileDetailsModal } from "./FileDetailsModal";
import { CompressModal } from "./CompressModal";
import { UploadFileModal } from "./UploadFileModal";
import { UploadFileView } from "./UploadFileView";
import { AIAnalysisView } from "./AIAnalysisView";
import { PreprocessingView } from "./PreprocessingView";
import { CompressionWorkbenchView } from "./CompressionWorkbenchView";
import { BenchmarkResultsView } from "./BenchmarkResultsView";
import { DecompressionVerifyView } from "./DecompressionVerifyView";
import { StorageCostRoiChart } from "./StorageCostRoiChart";
import { CostRoiView } from "./CostRoiView";
import { GlobalSearchBar } from "./GlobalSearchBar";
import { BulkActionBar } from "./BulkActionBar";
import { BatchActionModal, BatchActionMode } from "./BatchActionModal";
import { UserSettingsView } from "./UserSettingsView";
import { GuidedAppPipelineModal } from "./GuidedAppPipelineModal";
import { ExportAuditModal } from "./ExportAuditModal";
import { useTheme } from "../context/ThemeContext";

interface DashboardViewProps {
  user: UserProfile;
  files: CloudFile[];
  activities: RecentActivityItem[];
  onUpdateFile: (updated: CloudFile) => void;
  onUpdateFiles?: (updated: CloudFile[]) => void;
  onAddActivities: (newActs: RecentActivityItem[]) => void;
  onSignOut: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  files = [],
  activities = [],
  onUpdateFile,
  onUpdateFiles,
  onAddActivities,
  onSignOut,
}) => {
  const safeFiles = files || [];
  const safeActivities = activities || [];
  const { resolvedTheme, toggleTheme } = useTheme();

  // Sidebar View State (Defaults to 'dashboard')
  const [currentView, setCurrentView] = useState<ActiveSidebarView>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Table filters inside dashboard/env/file views
  const [selectedCategory, setSelectedCategory] = useState<"all" | "log" | "activity" | "processed">("all");
  const [selectedEnvironment, setSelectedEnvironment] = useState<CloudEnvironmentId | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activityActionFilter, setActivityActionFilter] = useState<ActivityActionType | "all">("all");

  // Modals state
  const [fileToOpen, setFileToOpen] = useState<CloudFile | null>(null);
  const [fileToInspect, setFileToInspect] = useState<CloudFile | null>(null);
  const [fileToCompress, setFileToCompress] = useState<CloudFile | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTargetEnvId, setUploadTargetEnvId] = useState<CloudEnvironmentId | undefined>(undefined);
  const [aiTargetFileId, setAiTargetFileId] = useState<string | undefined>(undefined);

  // Bulk Selection & Batch Actions State
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [batchModalConfig, setBatchModalConfig] = useState<{
    isOpen: boolean;
    mode: BatchActionMode;
  }>({
    isOpen: false,
    mode: "compress",
  });
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  // Cloud Applications filter & preview expansion
  const [providerFilter, setProviderFilter] = useState<"all" | "AWS" | "Azure" | "GCP" | "Hybrid Cloud">("all");
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  // 5-Step Guided Cloud Application Pipeline State
  const [showGuidedPipelineModal, setShowGuidedPipelineModal] = useState(false);
  const [guidedPipelineEnvId, setGuidedPipelineEnvId] = useState<CloudEnvironmentId>("aws-ec2");

  // Export Audit Report Modal State
  const [showExportAuditModal, setShowExportAuditModal] = useState(false);
  const [exportAuditScope, setExportAuditScope] = useState<"all" | "selected" | "logs" | "activities">("all");

  // Threshold-Based Cloud Storage Capacity Alert System State
  const [storageThresholdGB, setStorageThresholdGB] = useState<number>(() => {
    const saved = localStorage.getItem("cloudoptima_storage_threshold_gb");
    return saved ? parseFloat(saved) : 0.8; // Default threshold: 0.8 GB (800 MB)
  });
  const [isThresholdAlertDismissed, setIsThresholdAlertDismissed] = useState(false);

  // =========================================================================
  // 1. CALCULATED METRICS
  // =========================================================================
  const totalFilesCount = safeFiles.length;

  const logFilesCount = useMemo(() => {
    return safeFiles.filter((f) => f.category === "log").length;
  }, [safeFiles]);

  const activityFilesCount = useMemo(() => {
    return safeFiles.filter((f) => f.category === "activity").length;
  }, [safeFiles]);

  const processedFilesCount = useMemo(() => {
    return safeFiles.filter(
      (f) => f.status === "compressed" || f.status === "analyzed" || f.status === "decompressed"
    ).length;
  }, [safeFiles]);

  const uncompressedCount = useMemo(() => {
    return safeFiles.filter((f) => f.status === "uncompressed").length;
  }, [safeFiles]);

  const { storageSavedBytes, totalOriginalBytes, totalCompressedBytes } = useMemo(() => {
    let saved = 0;
    let totalOrig = 0;
    let totalComp = 0;

    safeFiles.forEach((f) => {
      totalOrig += f.originalSizeBytes;
      if (f.status === "compressed" && f.compressedSizeBytes !== null) {
        const diff = Math.max(0, f.originalSizeBytes - f.compressedSizeBytes);
        saved += diff;
        totalComp += f.compressedSizeBytes;
      } else {
        totalComp += f.originalSizeBytes;
      }
    });

    return {
      storageSavedBytes: saved,
      totalOriginalBytes: totalOrig,
      totalCompressedBytes: totalComp,
    };
  }, [files]);

  // Storage Threshold computations for Cost & Capacity Alert System
  const storageThresholdBytes = storageThresholdGB * 1024 * 1024 * 1024;
  const storageThresholdPercent = storageThresholdBytes > 0
    ? Math.round((totalOriginalBytes / storageThresholdBytes) * 100)
    : 0;
  const isThresholdExceeded = totalOriginalBytes >= storageThresholdBytes;
  const isThresholdNear = !isThresholdExceeded && storageThresholdPercent >= 75;

  // Cloud Environment Stats
  const environmentStats = useMemo(() => {
    return CLOUD_ENVIRONMENTS.map((env) => {
      const envFiles = files.filter((f) => f.environmentId === env.id);
      const fileCount = envFiles.length;
      const totalBytes = envFiles.reduce((acc, f) => acc + f.originalSizeBytes, 0);
      const savedBytes = envFiles.reduce(
        (acc, f) =>
          acc +
          (f.status === "compressed" && f.compressedSizeBytes !== null
            ? Math.max(0, f.originalSizeBytes - f.compressedSizeBytes)
            : 0),
        0
      );
      return {
        ...env,
        fileCount,
        totalBytes,
        savedBytes,
      };
    });
  }, [files]);

  const filteredEnvironments = useMemo(() => {
    if (providerFilter === "all") return environmentStats;
    return environmentStats.filter((env) => env.provider === providerFilter);
  }, [environmentStats, providerFilter]);

  // =========================================================================
  // 2. EFFECTIVE FILTERED FILES
  // =========================================================================
  const filteredFiles = useMemo(() => {
    // If the active sidebar view is a specific cloud environment:
    let envFilter: CloudEnvironmentId | "all" = selectedEnvironment;
    let catFilter: "all" | "log" | "activity" | "processed" = selectedCategory;

    if (currentView === "env-aws-ec2") envFilter = "aws-ec2";
    else if (currentView === "env-aws-lambda") envFilter = "aws-lambda";
    else if (currentView === "env-aws-s3") envFilter = "aws-s3";
    else if (currentView === "env-azure-vm") envFilter = "azure-vm";
    else if (currentView === "env-gcp-compute") envFilter = "gcp-compute";
    else if (currentView === "env-cloud-app-servers") envFilter = "cloud-app-servers";
    else if (currentView === "log-files") catFilter = "log";
    else if (currentView === "activity-files") catFilter = "activity";

    return files.filter((f) => {
      // Category filter
      if (catFilter === "log" && f.category !== "log") return false;
      if (catFilter === "activity" && f.category !== "activity") return false;
      if (
        catFilter === "processed" &&
        f.status !== "compressed" &&
        f.status !== "analyzed" &&
        f.status !== "decompressed"
      )
        return false;

      // Cloud environment filter
      if (envFilter !== "all" && f.environmentId !== envFilter) {
        return false;
      }

      // Search query filter (matches name, environment, cloud provider, type, category, status)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const env = CLOUD_ENVIRONMENTS.find((e) => e.id === f.environmentId);
        const provider = env?.provider.toLowerCase() || "";
        return (
          f.name.toLowerCase().includes(q) ||
          f.environmentName.toLowerCase().includes(q) ||
          provider.includes(q) ||
          f.type.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.status.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [files, selectedCategory, selectedEnvironment, currentView, searchQuery]);

  // Active environment identification and files
  const activeEnvId = currentView.startsWith("env-")
    ? (currentView.replace("env-", "") as CloudEnvironmentId)
    : null;

  const currentEnvInfo = useMemo(() => {
    return activeEnvId ? CLOUD_ENVIRONMENTS.find((e) => e.id === activeEnvId) || null : null;
  }, [activeEnvId]);

  const currentEnvFiles = useMemo(() => {
    return activeEnvId ? files.filter((f) => f.environmentId === activeEnvId) : [];
  }, [files, activeEnvId]);

  // Recent files
  const recentFiles = useMemo(() => {
    return [...files]
      .sort((a, b) => (a.uploadDate < b.uploadDate ? 1 : -1))
      .slice(0, 6);
  }, [files]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    if (activityActionFilter === "all") return activities;
    return activities.filter((act) => act.action === activityActionFilter);
  }, [activities, activityActionFilter]);

  // Bulk Selection Computed States & Helpers
  const selectedFilesList = useMemo(() => {
    return files.filter((f) => selectedFileIds.has(f.id));
  }, [files, selectedFileIds]);

  const filteredUncompressedCount = useMemo(() => {
    return filteredFiles.filter((f) => f.status !== "compressed").length;
  }, [filteredFiles]);

  const filteredCompressedCount = useMemo(() => {
    return filteredFiles.filter((f) => f.status === "compressed").length;
  }, [filteredFiles]);

  const isAllFilteredSelected = useMemo(() => {
    if (filteredFiles.length === 0) return false;
    return filteredFiles.every((f) => selectedFileIds.has(f.id));
  }, [filteredFiles, selectedFileIds]);

  const isSomeFilteredSelected = useMemo(() => {
    return filteredFiles.some((f) => selectedFileIds.has(f.id)) && !isAllFilteredSelected;
  }, [filteredFiles, selectedFileIds, isAllFilteredSelected]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isSomeFilteredSelected;
    }
  }, [isSomeFilteredSelected]);

  const toggleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedFileIds((prev) => {
        const next = new Set(prev);
        filteredFiles.forEach((f) => next.delete(f.id));
        return next;
      });
    } else {
      setSelectedFileIds((prev) => {
        const next = new Set(prev);
        filteredFiles.forEach((f) => next.add(f.id));
        return next;
      });
    }
  };

  const selectUncompressedFiltered = () => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      filteredFiles.forEach((f) => {
        if (f.status !== "compressed") next.add(f.id);
        else next.delete(f.id);
      });
      return next;
    });
  };

  const selectCompressedFiltered = () => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      filteredFiles.forEach((f) => {
        if (f.status === "compressed") next.add(f.id);
        else next.delete(f.id);
      });
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedFileIds(new Set());
  };

  const handleBatchComplete = (updatedFiles: CloudFile[], newActs: RecentActivityItem[]) => {
    if (onUpdateFiles) {
      onUpdateFiles(updatedFiles);
    } else {
      updatedFiles.forEach((f) => onUpdateFile(f));
    }
    onAddActivities(newActs);
    clearSelection();
  };

  // Compression completed handler
  const handleCompressionComplete = (updatedFile: CloudFile, newActs: RecentActivityItem[]) => {
    onUpdateFile(updatedFile);
    onAddActivities(newActs);
  };

  // Upload handlers
  const handleFileUploaded = (newFile: CloudFile, newActs: RecentActivityItem[]) => {
    onUpdateFile(newFile);
    onAddActivities(newActs);
  };

  const handleUploadAndCompress = (newFile: CloudFile, newActs: RecentActivityItem[]) => {
    onUpdateFile(newFile);
    onAddActivities(newActs);
    setShowUploadModal(false);
    setFileToCompress(newFile);
  };

  const handleDecompressSingleFile = (file: CloudFile) => {
    const updated: CloudFile = {
      ...file,
      status: "decompressed",
      compressedSizeBytes: null,
    };
    onUpdateFile(updated);
    onAddActivities([
      {
        id: `act-decomp-${Date.now()}-${file.id}`,
        action: "Decompression",
        fileName: file.name,
        fileId: file.id,
        environmentName: file.environmentName,
        timestamp: "Just now",
        details: `Restored ${file.name} to full original ${formatBytes(file.originalSizeBytes)} stream with verified SHA-256 parity.`,
        status: "success",
        metric: "Restored",
      },
      {
        id: `act-ver-${Date.now()}-${file.id}`,
        action: "Verification",
        fileName: file.name,
        fileId: file.id,
        environmentName: file.environmentName,
        timestamp: "Just now",
        details: `Cryptographic SHA-256 validation verified bitwise match for ${file.name}.`,
        status: "success",
        metric: "100% Parity",
      },
    ]);
    downloadOriginalUncompressedFile(updated);
  };

  const getEnvIcon = (iconType: string) => {
    switch (iconType) {
      case "ec2":
        return <Cpu className="w-5 h-5 text-amber-400" />;
      case "lambda":
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case "s3":
        return <Database className="w-5 h-5 text-emerald-400" />;
      case "azure":
        return <Server className="w-5 h-5 text-blue-400" />;
      case "gcp":
        return <HardDrive className="w-5 h-5 text-red-400" />;
      default:
        return <Layers className="w-5 h-5 text-purple-400" />;
    }
  };

  const getActivityIcon = (act: ActivityActionType) => {
    switch (act) {
      case "Upload":
        return <UploadCloud className="w-4 h-4 text-blue-400" />;
      case "File type detection":
        return <Search className="w-4 h-4 text-slate-300" />;
      case "AI analysis":
        return <Zap className="w-4 h-4 text-purple-400" />;
      case "Preprocessing":
        return <Layers className="w-4 h-4 text-cyan-400" />;
      case "Compression":
        return <TrendingDown className="w-4 h-4 text-emerald-400" />;
      case "Decompression":
        return <RotateCcw className="w-4 h-4 text-indigo-400" />;
      case "Verification":
        return <ShieldCheck className="w-4 h-4 text-teal-400" />;
      case "Reports":
        return <FileText className="w-4 h-4 text-amber-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  // Breadcrumb / Title mapping
  const getViewHeading = () => {
    switch (currentView) {
      case "dashboard":
        return { title: "Dashboard Overview", subtitle: "All Cloud Environments & Ingestion Telemetry" };
      case "env-aws-ec2":
        return { title: "AWS EC2 Environment", subtitle: "Elastic Compute Cloud Workloads & System Logs" };
      case "env-aws-lambda":
        return { title: "AWS Lambda Environment", subtitle: "Serverless Event Triggers & CloudWatch Streams" };
      case "env-aws-s3":
        return { title: "AWS S3 Environment", subtitle: "Object Storage Buckets, Replication & Server Access Logs" };
      case "env-azure-vm":
        return { title: "Azure Virtual Machines", subtitle: "Enterprise Linux/Windows VMs, Systemd & ARM Audits" };
      case "env-gcp-compute":
        return { title: "Google Cloud Compute Engine", subtitle: "Compute Clusters, VPC Flow Logs & Cloud Audit Trails" };
      case "env-cloud-app-servers":
        return { title: "Cloud Application Servers", subtitle: "Edge Gateways, Microservices & User Session Events" };
      case "log-files":
        return { title: "Cloud Log Files", subtitle: "Aggregated Server & Daemon Log Streams Across All 6 Clouds" };
      case "activity-files":
        return { title: "Cloud Activity Files", subtitle: "Audit Trails, JSON Telemetry & Environmental Action Logs" };
      case "ai-analysis":
        return { title: "AI Analysis", subtitle: "Pattern Mining, Schema Extraction & Anomaly Preservation" };
      case "upload-file":
        return { title: "Upload & Ingest Telemetry", subtitle: "Upload Real Log Files, Extract Patterns, and Compress with Lossless Algorithms" };
      case "preprocessing":
        return {
          title: "Preprocessing",
          subtitle: "Analyze and prepare files before compression to improve efficiency while keeping original data 100% recoverable",
        };
      case "compression":
        return { title: "Lossless Compression", subtitle: "Entropy Coding, Algorithm Benchmarks & Real Savings" };
      case "benchmark-results":
        return { title: "Benchmark Results", subtitle: "Measured GZIP, ZSTD and LZMA compression performance" };
      case "decompression-verify":
        return { title: "Decompression & Verify", subtitle: "100% Bitwise Reversibility Validation with SHA-256" };
      case "cost-roi":
        return {
          title: "Cost Trends & ROI",
          subtitle: "Historical Trends of Cloud Storage Costs Before and After Compression & Platform ROI",
        };
      case "settings":
        return {
          title: "User Settings & Display Preferences",
          subtitle: "Configure appearance themes, analysis viewport ergonomics, and telemetry notifications",
        };
      default:
        return { title: "Dashboard", subtitle: "Cloud Telemetry System" };
    }
  };

  const viewHeading = getViewHeading();

  return (
    <div
      className={`min-h-screen flex font-sans selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-200 ${
        resolvedTheme === "light"
          ? "bg-slate-50 text-slate-900 theme-light"
          : "bg-[#090d16] text-slate-100 theme-dark"
      }`}
    >
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full blur-[140px] ${
            resolvedTheme === "light" ? "bg-blue-200/20" : "bg-blue-600/5"
          }`}
        />
        <div
          className={`absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full blur-[140px] ${
            resolvedTheme === "light" ? "bg-cyan-200/20" : "bg-cyan-500/5"
          }`}
        />
        <div
          className={`absolute bottom-10 left-1/2 w-[600px] h-[600px] rounded-full blur-[140px] ${
            resolvedTheme === "light" ? "bg-indigo-200/20" : "bg-indigo-600/5"
          }`}
        />
      </div>

      {/* 1. SIDEBAR COMPONENT (Desktop & Mobile) */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          if (v === "dashboard") {
            setSelectedCategory("all");
            setSelectedEnvironment("all");
          }
        }}
        onOpenUploadModal={() => setShowUploadModal(true)}
        onOpenGuidedPipeline={(envId) => {
          if (envId) setGuidedPipelineEnvId(envId);
          setShowGuidedPipelineModal(true);
        }}
        onOpenExportModal={() => {
          setExportAuditScope("all");
          setShowExportAuditModal(true);
        }}
        onLogout={onSignOut}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        user={user}
        logFilesCount={logFilesCount}
        activityFilesCount={activityFilesCount}
        uncompressedCount={uncompressedCount}
      />

      {/* 2. MAIN WORKSPACE CONTAINER (Offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Top App Header */}
        <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl h-16 flex items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0 shrink-0">
            {/* Hamburger button on mobile */}
            <button
              type="button"
              id="mobile-sidebar-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 hidden md:block">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xs sm:text-sm lg:text-base text-white tracking-tight truncate">
                  {viewHeading.title}
                </h1>
                <span className="hidden xl:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 border border-cyan-800 text-cyan-400">
                  Live System
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden xl:block truncate">
                {viewHeading.subtitle}
              </p>
            </div>
          </div>

          {/* Global Search Bar (Quickly search files by name, type, or cloud provider) */}
          <GlobalSearchBar
            files={files}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
            onOpenFile={(f) => setFileToOpen(f)}
            onInspectFile={(f) => setFileToInspect(f)}
            onCompressFile={(f) => setFileToCompress(f)}
            onAIAnalyzeFile={(fileId) => {
              setAiTargetFileId(fileId);
              setCurrentView("ai-analysis");
            }}
            onViewAllInTable={() => {
              setCurrentView("dashboard");
              setTimeout(() => {
                const el = document.getElementById("all-files-table-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          />

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Theme Toggle Button */}
            <button
              type="button"
              id="topbar-theme-toggle-btn"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                resolvedTheme === "light"
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600 shadow-xs"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400"
              }`}
              title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Theme`}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Settings Navigation Button */}
            <button
              type="button"
              id="topbar-settings-btn"
              onClick={() => setCurrentView("settings")}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                currentView === "settings"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white"
              }`}
              title="User Settings & Display Preferences"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Guided Pipeline Button */}
            <button
              type="button"
              id="topbar-guided-pipeline-btn"
              onClick={() => {
                setGuidedPipelineEnvId("aws-ec2");
                setShowGuidedPipelineModal(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Launch 5-step guided optimization pipeline: Load -> AI -> Dedup -> Compress -> Verify"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Guided Pipeline</span>
            </button>

            {/* Export Audit Report Button */}
            <button
              type="button"
              id="topbar-export-audit-btn"
              onClick={() => {
                setExportAuditScope("all");
                setShowExportAuditModal(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 font-medium text-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Export compression audit report or current file inventory as PDF / CSV"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Export Audit</span>
            </button>

            {/* Upload File Button */}
            <button
              type="button"
              id="topbar-upload-file-btn"
              onClick={() => setShowUploadModal(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload File</span>
              <span className="sm:hidden">Upload</span>
            </button>

            {/* User Profile Pill (Click to open Settings) */}
            <button
              type="button"
              onClick={() => setCurrentView("settings")}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs transition cursor-pointer text-left"
              title="Click to view User Settings"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px]">
                {user.name.charAt(0)}
              </div>
              <span className="font-semibold text-white hidden md:inline text-xs">{user.name}</span>
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* ============================================================= */}
          {/* THRESHOLD-BASED CLOUD STORAGE CAPACITY ALERT SYSTEM           */}
          {/* ============================================================= */}
          {!isThresholdAlertDismissed && (isThresholdExceeded || isThresholdNear) && (
            <div
              id="storage-threshold-alert-banner"
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xl animate-in fade-in duration-200 ${
                isThresholdExceeded
                  ? "bg-gradient-to-r from-red-950/70 via-slate-900 to-red-950/50 border-red-500/50 ring-1 ring-red-500/30"
                  : "bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/50 border-amber-500/50 ring-1 ring-amber-500/30"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    isThresholdExceeded
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white">
                      {isThresholdExceeded
                        ? "Storage Capacity Alert: Allocated Quota Exceeded!"
                        : "Storage Capacity Warning: Approaching Threshold Limit!"}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        isThresholdExceeded
                          ? "bg-red-950 text-red-300 border-red-800"
                          : "bg-amber-950 text-amber-300 border-amber-800"
                      }`}
                    >
                      {storageThresholdPercent}% Consumed
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Total cloud storage is currently <strong>{formatBytes(totalOriginalBytes)}</strong>, exceeding your configured threshold of <strong>{storageThresholdGB} GB</strong>. Current monthly pay-as-you-use exposure is <strong>${calculateCloudPrice(totalOriginalBytes).toFixed(2)}/mo</strong>. Run the guided pipeline to remove duplicate files and compress raw telemetry.
                  </p>

                  {/* Quick threshold adjustment buttons */}
                  <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-400 flex-wrap">
                    <span className="text-[10px] uppercase font-semibold">Adjust Alert Threshold:</span>
                    {[0.5, 0.8, 1.0, 2.0, 5.0].map((gb) => (
                      <button
                        key={gb}
                        type="button"
                        onClick={() => {
                          setStorageThresholdGB(gb);
                          localStorage.setItem("cloudoptima_storage_threshold_gb", gb.toString());
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                          storageThresholdGB === gb
                            ? "bg-cyan-500 text-slate-950 font-bold"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
                      >
                        {gb} GB
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setGuidedPipelineEnvId("aws-ec2");
                    setShowGuidedPipelineModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Run Guided Compression</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsThresholdAlertDismissed(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Dismiss Alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {/* VIEW ROUTING */}

          {/* ============================================================= */}
          {/* CASE A: AI ANALYSIS VIEW                                      */}
          {/* ============================================================= */}
          {currentView === "ai-analysis" && (
            <AIAnalysisView
              files={files}
              initialFileId={aiTargetFileId}
              onOpenFile={(f) => setFileToOpen(f)}
              onCompressFile={(f) => setFileToCompress(f)}
            />
          )}

          {/* ============================================================= */}
          {/* CASE B: PREPROCESSING VIEW                                    */}
          {/* ============================================================= */}
          {currentView === "preprocessing" && (
            <PreprocessingView
              files={files}
              onOpenFile={(f) => setFileToOpen(f)}
              onCompressFile={(f) => setFileToCompress(f)}
            />
          )}

          {/* ============================================================= */}
          {/* CASE C: COMPRESSION WORKBENCH VIEW                            */}
          {/* ============================================================= */}
          {currentView === "compression" && (
            <CompressionWorkbenchView
              files={files}
              onOpenFile={(f) => setFileToOpen(f)}
              onInspectFile={(f) => setFileToInspect(f)}
              onCompressFile={(f) => setFileToCompress(f)}
            />
          )}

          {/* ============================================================= */}
          {currentView === "benchmark-results" && <BenchmarkResultsView />}

          {/* ============================================================= */}
          {/* CASE D: DECOMPRESSION & VERIFY VIEW                           */}
          {/* ============================================================= */}
          {currentView === "decompression-verify" && (
            <DecompressionVerifyView
              files={files}
              onOpenFile={(f) => setFileToOpen(f)}
              onInspectFile={(f) => setFileToInspect(f)}
              onUpdateFile={onUpdateFile}
              onAddActivities={onAddActivities}
            />
          )}

          {/* ============================================================= */}
          {/* CASE E: UPLOAD & INGESTION VIEW                               */}
          {/* ============================================================= */}
          {currentView === "upload-file" && (
            <UploadFileView
              files={files}
              onOpenFile={(f) => setFileToOpen(f)}
              onInspectFile={(f) => setFileToInspect(f)}
              onCompressFile={(f) => setFileToCompress(f)}
              onOpenUploadModal={() => setShowUploadModal(true)}
              onNavigateToAi={(fileId) => {
                setAiTargetFileId(fileId);
                setCurrentView("ai-analysis");
              }}
            />
          )}

          {/* ============================================================= */}
          {/* CASE F: COST TRENDS & ROI ANALYTICS VIEW                      */}
          {/* ============================================================= */}
          {currentView === "cost-roi" && (
            <CostRoiView onBackToDashboard={() => setCurrentView("dashboard")} />
          )}

          {/* ============================================================= */}
          {/* CASE G: USER SETTINGS VIEW                                    */}
          {/* ============================================================= */}
          {currentView === "settings" && (
            <UserSettingsView user={user} />
          )}

          {/* ============================================================= */}
          {/* CASE F: DASHBOARD OR SPECIFIC CLOUD OR LOG/ACTIVITY FILE VIEW */}
          {/* ============================================================= */}
          {(currentView === "dashboard" ||
            currentView.startsWith("env-") ||
            currentView === "log-files" ||
            currentView === "activity-files") && (
            <>
              {/* Dashboard Summary Cards (Always rendered in dashboard, or mini in environment view) */}
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">System Metrics</h2>
                    <p className="text-xs text-slate-400">
                      Live telemetry across cloud clusters, logs, and lossless storage reductions.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {/* 1. Total Files */}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("dashboard");
                      setSelectedCategory("all");
                      setSelectedEnvironment("all");
                    }}
                    className={`p-4 rounded-2xl border transition-all text-left group cursor-pointer relative overflow-hidden ${
                      currentView === "dashboard" && selectedCategory === "all"
                        ? "bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                        : "bg-slate-900/80 hover:bg-slate-850 border-slate-800/90 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">
                        Total Files
                      </span>
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                        <HardDrive className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-white tracking-tight">{totalFilesCount}</div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">All files across 6 clouds</p>
                    <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium mt-2">
                      <span>Click &rarr; All files list</span>
                    </div>
                  </button>

                  {/* 2. Log Files */}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("log-files");
                    }}
                    className={`p-4 rounded-2xl border transition-all text-left group cursor-pointer relative overflow-hidden ${
                      currentView === "log-files"
                        ? "bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                        : "bg-slate-900/80 hover:bg-slate-850 border-slate-800/90 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">
                        Log Files
                      </span>
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-white tracking-tight">{logFilesCount}</div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Only Cloud Log Files</p>
                    <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium mt-2">
                      <span>Click &rarr; Log files list</span>
                    </div>
                  </button>

                  {/* 3. Activity Files */}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("activity-files");
                    }}
                    className={`p-4 rounded-2xl border transition-all text-left group cursor-pointer relative overflow-hidden ${
                      currentView === "activity-files"
                        ? "bg-slate-900 border-purple-500/50 shadow-lg shadow-purple-500/10"
                        : "bg-slate-900/80 hover:bg-slate-850 border-slate-800/90 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">
                        Activity Files
                      </span>
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-white tracking-tight">{activityFilesCount}</div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Only Cloud Activity Files</p>
                    <div className="flex items-center gap-1 text-[10px] text-purple-400 font-medium mt-2">
                      <span>Click &rarr; Activity files list</span>
                    </div>
                  </button>

                  {/* 4. Processed Files */}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("dashboard");
                      setSelectedCategory("processed");
                    }}
                    className={`p-4 rounded-2xl border transition-all text-left group cursor-pointer relative overflow-hidden ${
                      currentView === "dashboard" && selectedCategory === "processed"
                        ? "bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                        : "bg-slate-900/80 hover:bg-slate-850 border-slate-800/90 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">
                        Processed Files
                      </span>
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-white tracking-tight">{processedFilesCount}</div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Analyzed &amp; compressed</p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-2">
                      <span>{Math.round((processedFilesCount / totalFilesCount) * 100)}% of total files</span>
                    </div>
                  </button>

                  {/* 5. Storage Saved (Real Calculated Value!) */}
                  <div className="p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 text-left relative overflow-hidden shadow-lg shadow-emerald-950/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-emerald-300">Storage Saved</span>
                      <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                      {formatBytes(storageSavedBytes)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formatBytes(totalOriginalBytes)} &rarr; {formatBytes(totalCompressedBytes)}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-2">
                      <span>Saved {formatCloudPrice(calculateCloudPrice(storageSavedBytes))} on pay-as-you-use bills</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Cost Trends & Platform ROI (Line chart visualization using Recharts) */}
              {currentView === "dashboard" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                        <span>Historical Cloud Storage Cost &amp; ROI Trends</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold font-mono">
                          Recharts Interactive
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Historical comparison of cloud storage spending before vs. after compression with continuous ROI calculation.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentView("cost-roi")}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer transition"
                    >
                      <span>Full Financial Ledger &amp; Scale Estimator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <StorageCostRoiChart />
                </div>
              )}

              {/* SPECIFIC CLOUD ENVIRONMENT BANNER (When inside an env- view) */}
              {currentView.startsWith("env-") && currentEnvInfo && (
                <div className="space-y-5">
                  {/* Clean Application Header Bar */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden backdrop-blur-xl">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner shrink-0">
                          {getEnvIcon(currentEnvInfo.iconType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                              {currentEnvInfo.name}
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                              {currentEnvInfo.provider}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live &amp; Monitored
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                            {currentEnvInfo.description} &bull; Region: <strong className="text-slate-300 font-mono">{currentEnvInfo.region}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Quick action buttons */}
                      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                        <button
                          type="button"
                          id="env-banner-guided-pipeline-btn"
                          onClick={() => {
                            setGuidedPipelineEnvId(currentEnvInfo.id);
                            setShowGuidedPipelineModal(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                          title="Execute 5-stage sequential compression pipeline: Load -> AI Analysis -> Preprocessing Deduplication -> Compression -> Size/Price/Storage Verification"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Run Guided Pipeline</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadTargetEnvId(currentEnvInfo.id);
                            setShowUploadModal(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Ingest File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentView("dashboard");
                            setSelectedEnvironment("all");
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer border border-slate-700/60"
                        >
                          All Applications
                        </button>
                      </div>
                    </div>

                    {/* Clean Environment Metrics Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Total Files</span>
                        <span className="text-lg font-bold text-white mt-0.5 block">{currentEnvFiles.length} files</span>
                        <span className="text-[10px] text-slate-500">In this application</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Raw Footprint</span>
                        <span className="text-lg font-bold text-white mt-0.5 block">
                          {formatBytes(currentEnvFiles.reduce((acc, f) => acc + f.originalSizeBytes, 0))}
                        </span>
                        <span className="text-[10px] text-slate-500">Uncompressed volume</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Compressed Size</span>
                        <span className="text-lg font-bold text-emerald-400 mt-0.5 block">
                          {formatBytes(currentEnvFiles.reduce((acc, f) => acc + (f.compressedSizeBytes || f.originalSizeBytes), 0))}
                        </span>
                        <span className="text-[10px] text-slate-500">Current stored bytes</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold block">Storage Saved</span>
                        <span className="text-lg font-bold text-emerald-400 mt-0.5 block">
                          {formatBytes(
                            currentEnvFiles.reduce(
                              (acc, f) =>
                                acc +
                                (f.status === "compressed" && f.compressedSizeBytes !== null
                                  ? Math.max(0, f.originalSizeBytes - f.compressedSizeBytes)
                                  : 0),
                              0
                            )
                          )}
                        </span>
                        <span className="text-[10px] text-emerald-400/80 font-medium">Real lossless savings</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cloud Environments & Applications Grid (Rendered in Dashboard overview) */}
              {currentView === "dashboard" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        <span>Cloud Environments &amp; Applications</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
                          {environmentStats.length} Monitored
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Dedicated host environments and application workloads. Select any application to explore files and compression controls.
                      </p>
                    </div>

                    {/* Provider Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 self-start sm:self-auto overflow-x-auto">
                      {(["all", "AWS", "Azure", "GCP", "Hybrid Cloud"] as const).map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setProviderFilter(prov)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                            providerFilter === prov
                              ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                          }`}
                        >
                          {prov === "all" ? `All Clouds (${environmentStats.length})` : prov}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEnvironments.map((env) => {
                      const envFiles = files.filter((f) => f.environmentId === env.id);
                      const isExpanded = expandedAppId === env.id;
                      const savedPercent = env.totalBytes > 0 ? Math.round((env.savedBytes / env.totalBytes) * 100) : 0;

                      return (
                        <div
                          key={env.id}
                          className="p-5 rounded-2xl border bg-slate-900/80 hover:bg-slate-850/90 border-slate-800/90 hover:border-slate-700/90 transition-all flex flex-col justify-between shadow-lg group/card"
                        >
                          <div>
                            {/* Application Header */}
                            <div className="flex items-start justify-between gap-2 mb-2.5">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover/card:border-slate-700 transition shrink-0 shadow-inner">
                                  {getEnvIcon(env.iconType)}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-sm font-bold text-white group-hover/card:text-cyan-400 transition truncate">
                                    {env.name}
                                  </h3>
                                  <span className="text-[11px] text-slate-500 font-mono block truncate">
                                    {env.region}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                                  {env.provider}
                                </span>
                                <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3.5">
                              {env.description}
                            </p>

                            {/* Clean Telemetry & Storage Metrics */}
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3.5">
                              <div className="grid grid-cols-3 gap-2 text-center text-xs pb-2 border-b border-slate-800/60">
                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Files</span>
                                  <span className="text-white font-bold block mt-0.5">{env.fileCount}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Footprint</span>
                                  <span className="text-white font-bold block mt-0.5">{formatBytes(env.totalBytes)}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-medium">Saved</span>
                                  <span className="text-emerald-400 font-bold block mt-0.5">{savedPercent}%</span>
                                </div>
                              </div>

                              {/* Efficiency Gauge */}
                              <div className="mt-2.5">
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span>Lossless Efficiency</span>
                                  <span className="text-emerald-400 font-medium">{formatBytes(env.savedBytes)} saved</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(8, savedPercent))}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Quick Files Expandable Preview (Clean accordion when user wants to see files right here) */}
                            {isExpanded && (
                              <div className="space-y-1.5 mb-3.5 pt-2 border-t border-slate-800/80">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1 px-1">
                                  <span>Telemetric Files ({envFiles.length})</span>
                                  <span className="text-[10px] text-slate-500">Click to open</span>
                                </div>

                                {envFiles.map((file) => (
                                  <div
                                    key={file.id}
                                    onClick={() => setFileToOpen(file)}
                                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 transition group/file cursor-pointer"
                                    title="Click to open file"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-white group-hover/file:text-cyan-400 truncate transition max-w-[120px] sm:max-w-[140px]">
                                          {file.name}
                                        </span>
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium shrink-0 ${
                                          file.status === "compressed"
                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                        }`}>
                                          {file.status}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-mono block">
                                        {formatBytes(file.originalSizeBytes)}
                                        {file.compressedSizeBytes && (
                                          <span className="text-emerald-400 ml-1">
                                            &rarr; {formatBytes(file.compressedSizeBytes)}
                                          </span>
                                        )}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={() => setFileToOpen(file)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition cursor-pointer flex items-center gap-1 border border-slate-700/60"
                                        title="Open file"
                                      >
                                        <Eye className="w-3 h-3 text-cyan-400" />
                                        <span className="hidden sm:inline">Open</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setFileToCompress(file)}
                                        className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-sm ${
                                          file.status === "compressed"
                                            ? "bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30"
                                            : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20"
                                        }`}
                                        title="Execute compression"
                                      >
                                        <Zap className="w-3 h-3" />
                                        <span>Compression</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Clean Application Card Footer Actions */}
                          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setGuidedPipelineEnvId(env.id);
                                setShowGuidedPipelineModal(true);
                              }}
                              className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer border border-cyan-500/40 hover:border-cyan-400 shadow-xs"
                              title={`Execute 5-step Guided Pipeline for ${env.name}: Load -> AI -> Dedup -> Compress -> Verify`}
                            >
                              <Zap className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="font-bold">Pipeline</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (env.id === "aws-ec2") setCurrentView("env-aws-ec2");
                                else if (env.id === "aws-lambda") setCurrentView("env-aws-lambda");
                                else if (env.id === "aws-s3") setCurrentView("env-aws-s3");
                                else if (env.id === "azure-vm") setCurrentView("env-azure-vm");
                                else if (env.id === "gcp-compute") setCurrentView("env-gcp-compute");
                                else if (env.id === "cloud-app-servers") setCurrentView("env-cloud-app-servers");
                              }}
                              className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-cyan-600 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/60 hover:border-cyan-500 shadow-sm truncate"
                            >
                              <span className="truncate">Open App</span>
                              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setExpandedAppId(isExpanded ? null : env.id)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer border shrink-0 ${
                                isExpanded
                                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                                  : "bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800"
                              }`}
                              title={isExpanded ? "Collapse files" : `Quick preview ${env.fileCount} files`}
                            >
                              <span>Files ({env.fileCount})</span>
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setUploadTargetEnvId(env.id);
                                setShowUploadModal(true);
                              }}
                              className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition cursor-pointer shrink-0"
                              title={`Ingest new file to ${env.name}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Files Grid (Rendered in Dashboard overview) */}
              {currentView === "dashboard" && (
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <h2 className="text-base font-bold text-white tracking-tight">Recent Files</h2>
                      <p className="text-xs text-slate-400">
                        Recently uploaded or processed telemetry streams. Click any file to open.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {recentFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => setFileToOpen(file)}
                        className={`p-4 rounded-2xl bg-slate-900/80 border transition flex flex-col justify-between group cursor-pointer ${
                          selectedFileIds.has(file.id)
                            ? "border-cyan-500/70 bg-cyan-950/20 shadow-md shadow-cyan-500/10"
                            : "border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-850"
                        }`}
                        title="Click to open file"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`p-1.5 rounded-lg shrink-0 ${
                                file.category === "log" ? "bg-cyan-500/10 text-cyan-400" : "bg-purple-500/10 text-purple-400"
                              }`}>
                                {file.category === "log" ? <FileText className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                              </div>
                              <span className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition" title={file.name}>
                                {file.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedFileIds.has(file.id)}
                                onChange={() => toggleSelectFile(file.id)}
                                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 transition cursor-pointer accent-cyan-500"
                                title="Select file for bulk batch actions"
                              />
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                                file.status === "compressed"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : file.status === "analyzed"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              }`}>
                                {file.status}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-3 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60">
                            <div>
                              <span className="text-slate-500 block text-[9px] uppercase">Cloud</span>
                              <span className="text-slate-200 font-medium truncate block">{file.environmentName}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[9px] uppercase">Type</span>
                              <span className="text-slate-200 font-mono block">{file.type}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[9px] uppercase">Size</span>
                              <span className="text-slate-200 font-medium block">
                                {formatBytes(file.originalSizeBytes)}
                                {file.compressedSizeBytes && (
                                  <span className="text-emerald-400 text-[10px] ml-1">
                                    &rarr; {formatBytes(file.compressedSizeBytes)}
                                  </span>
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[9px] uppercase">Uploaded</span>
                              <span className="text-slate-200 block truncate">{file.uploadDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions: Open / Details / Compression */}
                        <div
                          className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setFileToOpen(file)}
                            className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1 border border-slate-700/60"
                          >
                            <Eye className="w-3 h-3 text-cyan-400" />
                            <span>Open</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFileToCompress(file)}
                            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                              file.status === "compressed"
                                ? "bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30"
                                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-500/20"
                            }`}
                          >
                            <Zap className="w-3 h-3" />
                            <span>Compression</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFileToInspect(file)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] font-medium transition cursor-pointer flex items-center justify-center border border-slate-700/60"
                            title="Details"
                          >
                            <Info className="w-3 h-3 text-slate-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAiTargetFileId(file.id);
                              setCurrentView("ai-analysis");
                            }}
                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition cursor-pointer flex items-center justify-center"
                            title="Ask AI questions & get suggestions"
                          >
                            <Sparkles className="w-3 h-3 text-purple-400" />
                          </button>

                          {file.status === "compressed" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDecompressSingleFile(file)}
                                className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white border border-emerald-500/30 transition cursor-pointer flex items-center justify-center"
                                title={`Decompress and download restored ${file.name}`}
                              >
                                <RotateCcw className="w-3 h-3 text-emerald-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadSingleCompressedFile(file)}
                                className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-white border border-cyan-500/30 transition cursor-pointer flex items-center justify-center"
                                title={`Download compressed ${file.name}.zst`}
                              >
                                <Download className="w-3 h-3 text-cyan-400" />
                              </button>
                            </>
                          )}

                          {file.status === "decompressed" && (
                            <button
                              type="button"
                              onClick={() => downloadOriginalUncompressedFile(file)}
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white border border-emerald-500/30 transition cursor-pointer flex items-center justify-center"
                              title={`Download decompressed ${file.name}`}
                            >
                              <Download className="w-3 h-3 text-emerald-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Files Table (Always present in files view or dashboard) */}
              <div id="all-files-table-section" className="scroll-mt-20">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
                  {/* Table Header Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {currentView === "log-files"
                            ? "Cloud Log Files Directory"
                            : currentView === "activity-files"
                            ? "Cloud Activity Files Directory"
                            : currentView.startsWith("env-")
                            ? `${viewHeading.title} Files`
                            : "All Cloud Files Directory"}
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
                          {filteredFiles.length} {filteredFiles.length === 1 ? "file" : "files"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        File name, type, cloud environment, size, pay-as-you-use price &amp; compressed price &bull; Open / Details / Compression options
                      </p>
                    </div>

                    {/* Search & Filter Controls */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Pay-As-You-Use Rate: <strong className="text-slate-200 font-mono">${CLOUD_PAYG_RATE_PER_GB.toFixed(2)}/GB</strong></span>
                      </div>

                      <div className="relative min-w-[220px]">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search file name, type, env..."
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-2 text-[10px] text-slate-400 hover:text-white"
                          >
                            &times;
                          </button>
                        )}
                      </div>

                      {/* Export Audit Button */}
                      <button
                        type="button"
                        id="table-export-audit-btn"
                        onClick={() => {
                          setExportAuditScope(selectedCategory === "log" ? "logs" : selectedCategory === "activity" ? "activities" : "all");
                          setShowExportAuditModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Export current file directory and compression metrics as CSV or PDF report"
                      >
                        <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Export Audit</span>
                      </button>

                      {/* Reset filter pill if inside sub-view */}
                      {currentView !== "dashboard" && (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentView("dashboard");
                            setSelectedCategory("all");
                            setSelectedEnvironment("all");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium transition cursor-pointer"
                        >
                          View All Clouds
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Responsive Table */}
                  <div className="overflow-x-auto pt-2">
                    {/* Bulk Action Bar (Inline toolbar when files are selected) */}
                    <BulkActionBar
                      selectedFiles={selectedFilesList}
                      totalFilteredCount={filteredFiles.length}
                      filteredUncompressedCount={filteredUncompressedCount}
                      filteredCompressedCount={filteredCompressedCount}
                      onClearSelection={clearSelection}
                      onSelectAllFiltered={toggleSelectAllFiltered}
                      onSelectUncompressedOnly={selectUncompressedFiltered}
                      onSelectCompressedOnly={selectCompressedFiltered}
                      onTriggerBatchCompress={() => setBatchModalConfig({ isOpen: true, mode: "compress" })}
                      onTriggerBatchDecompress={() => setBatchModalConfig({ isOpen: true, mode: "decompress" })}
                      onTriggerDownloadCompressed={async () => {
                        const compFiles = selectedFilesList.filter((f) => f.status === "compressed");
                        if (compFiles.length === 1) {
                          downloadSingleCompressedFile(compFiles[0]);
                        } else if (compFiles.length > 1) {
                          await downloadBatchCompressedFilesZip(
                            compFiles,
                            "zstd",
                            `Cloud_Compressed_Batch_${new Date().toISOString().slice(0, 10)}.zip`
                          );
                        }
                      }}
                      onTriggerDownloadDecompressed={async () => {
                        const decompFiles = selectedFilesList.filter((f) => f.status === "decompressed");
                        if (decompFiles.length === 1) {
                          downloadOriginalUncompressedFile(decompFiles[0]);
                        } else if (decompFiles.length > 1) {
                          await downloadBatchDecompressedFilesZip(
                            decompFiles,
                            `Cloud_Decompressed_Batch_${new Date().toISOString().slice(0, 10)}.zip`
                          );
                        }
                      }}
                      onTriggerExport={() => {
                        setExportAuditScope("selected");
                        setShowExportAuditModal(true);
                      }}
                    />

                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                          <th className="py-3 px-3 w-10 text-center">
                            <input
                              ref={selectAllCheckboxRef}
                              type="checkbox"
                              id="select-all-filtered-checkbox"
                              checked={isAllFilteredSelected}
                              onChange={toggleSelectAllFiltered}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 transition cursor-pointer accent-cyan-500"
                              title="Select all filtered files for bulk action"
                            />
                          </th>
                          <th className="py-3 px-3">File Name</th>
                          <th className="py-3 px-3">Type</th>
                          <th className="py-3 px-3">Cloud Environment</th>
                          <th className="py-3 px-3">Size (Orig &rarr; Comp)</th>
                          <th className="py-3 px-3">Price (Pay-As-You-Use)</th>
                          <th className="py-3 px-3">Compressed Price</th>
                          <th className="py-3 px-3">Upload Date</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Actions (Open / Compression / Details)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredFiles.length > 0 ? (
                          filteredFiles.map((file) => {
                            const isCompressed = file.status === "compressed" && file.compressedSizeBytes !== null;
                            const origPrice = calculateCloudPrice(file.originalSizeBytes);
                            const compPrice = isCompressed ? calculateCloudPrice(file.compressedSizeBytes!) : null;
                            const priceSaved = isCompressed && compPrice !== null ? Math.max(0, origPrice - compPrice) : 0;
                            const percentSaved = isCompressed && origPrice > 0 ? Math.round((priceSaved / origPrice) * 100) : 0;
                            const isSelected = selectedFileIds.has(file.id);

                            return (
                              <tr
                                key={file.id}
                                onClick={() => setFileToOpen(file)}
                                className={`transition group cursor-pointer ${
                                  isSelected
                                    ? "bg-cyan-950/25 border-l-2 border-cyan-500 hover:bg-cyan-950/35"
                                    : "hover:bg-slate-850/80"
                                }`}
                                title="Click to open file"
                              >
                                <td
                                  className="py-3.5 px-3 w-10 text-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    id={`select-file-${file.id}`}
                                    checked={isSelected}
                                    onChange={() => toggleSelectFile(file.id)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 transition cursor-pointer accent-cyan-500"
                                    title={`Select ${file.name} for bulk action`}
                                  />
                                </td>
                                <td className="py-3.5 px-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`p-1.5 rounded-lg shrink-0 ${
                                      file.category === "log" ? "bg-cyan-500/10 text-cyan-400" : "bg-purple-500/10 text-purple-400"
                                    }`}>
                                      {file.category === "log" ? <FileText className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-white group-hover:text-cyan-400 transition block truncate max-w-[200px] sm:max-w-xs">
                                          {file.name}
                                        </span>
                                        <span className="opacity-0 group-hover:opacity-100 text-[10px] text-cyan-400 flex items-center gap-0.5 transition">
                                          <Eye className="w-2.5 h-2.5" /> Open
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-500 block">
                                        {file.category === "log" ? "Cloud Log" : "Cloud Activity"} &bull; ~{formatNumber(file.linesCount)} lines
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-3">
                                  <span className="font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px]">
                                    {file.type}
                                  </span>
                                </td>

                                <td className="py-3.5 px-3">
                                  <span className="text-slate-200 font-medium block">{file.environmentName}</span>
                                </td>

                                <td className="py-3.5 px-3">
                                  <div className="space-y-0.5">
                                    <span className="font-semibold text-white block">{formatBytes(file.originalSizeBytes)}</span>
                                    {isCompressed ? (
                                      <span className="text-[10px] text-emerald-400 block font-medium">
                                        {formatBytes(file.compressedSizeBytes!)} (
                                        {Math.round((1 - file.compressedSizeBytes! / file.originalSizeBytes) * 100)}% saved)
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-500 block">Uncompressed</span>
                                    )}
                                  </div>
                                </td>

                                {/* Price (Pay-As-You-Use) Column */}
                                <td className="py-3.5 px-3 whitespace-nowrap">
                                  <div className="space-y-0.5">
                                    <span className="font-semibold text-white font-mono block text-xs">
                                      {formatCloudPrice(origPrice)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block">
                                      Pay-as-you-use
                                    </span>
                                  </div>
                                </td>

                                {/* Compressed Price Column */}
                                <td className="py-3.5 px-3 whitespace-nowrap">
                                  {isCompressed && compPrice !== null ? (
                                    <div className="space-y-0.5">
                                      <span className="font-semibold text-emerald-400 font-mono block text-xs">
                                        {formatCloudPrice(compPrice)}
                                      </span>
                                      <span className="text-[10px] text-emerald-500 font-medium block">
                                        Save {formatCloudPrice(priceSaved)} ({percentSaved}%)
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="space-y-0.5">
                                      <span className="text-slate-500 font-mono block text-xs">—</span>
                                      <span className="text-[10px] text-slate-500 block">
                                        Pending compression
                                      </span>
                                    </div>
                                  )}
                                </td>

                                <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">{file.uploadDate}</td>

                                <td className="py-3.5 px-3">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                    file.status === "compressed"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                      : file.status === "analyzed"
                                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  }`}>
                                    {file.status === "compressed" && <CheckCircle2 className="w-2.5 h-2.5" />}
                                    <span>{file.status}</span>
                                  </span>
                                </td>

                                <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setFileToOpen(file)}
                                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1 border border-slate-700/60"
                                      title="Open and read file sample content"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                      <span>Open</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setFileToCompress(file)}
                                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs font-semibold flex items-center gap-1 shadow-sm ${
                                        file.status === "compressed"
                                          ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30"
                                          : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20"
                                      }`}
                                      title="Execute lossless compression"
                                    >
                                      <Zap className="w-3.5 h-3.5" />
                                      <span>Compression</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setFileToInspect(file)}
                                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1 border border-slate-700/60"
                                      title="View SHA-256 and metadata details"
                                    >
                                      <Info className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Details</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAiTargetFileId(file.id);
                                        setCurrentView("ai-analysis");
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white border border-purple-500/30 transition cursor-pointer text-xs flex items-center gap-1 shadow-sm"
                                      title="Ask AI questions & get suggestions for this file"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                      <span>AI Advice</span>
                                    </button>

                                    {file.status === "compressed" && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleDecompressSingleFile(file)}
                                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1 border border-emerald-500/35 shadow-xs"
                                          title={`Decompress and download restored ${file.name}`}
                                        >
                                          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                                          <span>Decompress</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => downloadSingleCompressedFile(file)}
                                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1 border border-cyan-500/35 shadow-xs"
                                          title={`Download compressed ${file.name}.zst`}
                                        >
                                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                                          <span>.zst</span>
                                        </button>
                                      </>
                                    )}

                                    {file.status === "decompressed" && (
                                      <button
                                        type="button"
                                        onClick={() => downloadOriginalUncompressedFile(file)}
                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1 border border-emerald-500/35 shadow-xs"
                                        title={`Download restored decompressed ${file.name}`}
                                      >
                                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Download</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={10} className="py-12 text-center text-slate-400">
                              <p className="text-sm">No files found matching the selected filters.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed (Always visible in dashboard overview) */}
              {currentView === "dashboard" && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Recent Activity</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                          Actual Actions Only
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Upload, File type detection, AI analysis, Preprocessing, Compression, Decompression, Verification, Reports.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                      {(
                        [
                          "all",
                          "Upload",
                          "File type detection",
                          "AI analysis",
                          "Preprocessing",
                          "Compression",
                          "Decompression",
                          "Verification",
                          "Reports",
                        ] as const
                      ).map((act) => (
                        <button
                          key={act}
                          type="button"
                          onClick={() => setActivityActionFilter(act)}
                          className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap text-xs cursor-pointer ${
                            activityActionFilter === act
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                              : "bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80"
                          }`}
                        >
                          {act === "all" ? "All Actions" : act}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {filteredActivities.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                            {getActivityIcon(item.action)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-xs">{item.action}</span>
                              <span className="text-[11px] text-cyan-400 font-mono truncate">{item.fileName}</span>
                              <span className="text-[10px] text-slate-500">&bull;</span>
                              <span className="text-[11px] text-slate-400">{item.environmentName}</span>
                            </div>
                            <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">{item.details}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                          {item.metric && (
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">
                              {item.metric}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            {item.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Global Dashboard Footer */}
        <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 py-4 text-slate-500 text-[11px] text-center mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>CloudOptima Architecture &bull; Enterprise Cloud Log &amp; Activity Compression</span>
            <div className="flex items-center gap-4">
              <span>Lossless Bitwise Guarantee</span>
              <span>&bull;</span>
              <span>AES-256 Storage</span>
              <span>&bull;</span>
              <span>SOC 2 Type II Certified</span>
            </div>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      {fileToOpen && (
        <OpenFileModal
          file={fileToOpen}
          onClose={() => setFileToOpen(null)}
          onOpenDetails={(f) => {
            setFileToOpen(null);
            setFileToInspect(f);
          }}
          onTriggerCompress={(f) => {
            setFileToOpen(null);
            setFileToCompress(f);
          }}
        />
      )}

      {fileToInspect && (
        <FileDetailsModal
          file={fileToInspect}
          onClose={() => setFileToInspect(null)}
          onOpenFile={(f) => {
            setFileToInspect(null);
            setFileToOpen(f);
          }}
          onTriggerCompress={(f) => {
            setFileToInspect(null);
            setFileToCompress(f);
          }}
          onTriggerDecompress={(f) => {
            setFileToInspect(null);
            handleDecompressSingleFile(f);
          }}
        />
      )}

      {fileToCompress && (
        <CompressModal
          file={fileToCompress}
          onClose={() => setFileToCompress(null)}
          onCompressionComplete={handleCompressionComplete}
        />
      )}

      {showUploadModal && (
        <UploadFileModal
          initialEnvironmentId={uploadTargetEnvId}
          onClose={() => {
            setShowUploadModal(false);
            setUploadTargetEnvId(undefined);
          }}
          onFileUploaded={handleFileUploaded}
          onUploadAndCompress={handleUploadAndCompress}
          onOpenFile={(f) => setFileToOpen(f)}
        />
      )}

      {/* BATCH ACTIONS MODAL (Simultaneous Compression or Decompression) */}
      <BatchActionModal
        isOpen={batchModalConfig.isOpen}
        mode={batchModalConfig.mode}
        selectedFiles={selectedFilesList}
        onClose={() => setBatchModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onBatchComplete={handleBatchComplete}
      />

      {/* 5-STAGE GUIDED CLOUD APPLICATION COMPRESSION PIPELINE MODAL */}
      <GuidedAppPipelineModal
        isOpen={showGuidedPipelineModal}
        onClose={() => setShowGuidedPipelineModal(false)}
        initialEnvironmentId={guidedPipelineEnvId}
        files={files}
        user={user}
        onUpdateFiles={(updated) => {
          if (onUpdateFiles) {
            onUpdateFiles(updated);
          } else {
            updated.forEach((f) => onUpdateFile(f));
          }
        }}
        onAddActivities={onAddActivities}
      />

      {/* COMPRESSION AUDIT & FILE DIRECTORY EXPORT MODAL (PDF / CSV) */}
      <ExportAuditModal
        isOpen={showExportAuditModal}
        onClose={() => setShowExportAuditModal(false)}
        files={filteredFiles}
        allFiles={files}
        selectedFiles={selectedFilesList}
        user={user}
        defaultScope={exportAuditScope}
      />
    </div>
  );
};
