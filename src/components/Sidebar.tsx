import React, { useState } from "react";
import {
  LayoutDashboard,
  Cloud,
  ChevronDown,
  ChevronRight,
  Cpu,
  Zap,
  Database,
  Server,
  HardDrive,
  Layers,
  FileText,
  Activity,
  Sparkles,
  UploadCloud,
  Sliders,
  TrendingDown,
  ShieldCheck,
  LogOut,
  X,
  CheckCircle2,
  BarChart3,
  Settings,
  Sun,
  Moon,
  FileDown,
} from "lucide-react";
import { UserProfile, CloudEnvironmentId } from "../types";
import { useTheme } from "../context/ThemeContext";

export type ActiveSidebarView =
  | "dashboard"
  | "cost-roi"
  | "env-aws-ec2"
  | "env-aws-lambda"
  | "env-aws-s3"
  | "env-azure-vm"
  | "env-gcp-compute"
  | "env-cloud-app-servers"
  | "log-files"
  | "activity-files"
  | "ai-analysis"
  | "upload-file"
  | "preprocessing"
  | "compression"
  | "benchmark-results"
  | "decompression-verify"
  | "settings";

interface SidebarProps {
  currentView: ActiveSidebarView;
  onSelectView: (view: ActiveSidebarView) => void;
  onOpenUploadModal: () => void;
  onOpenGuidedPipeline?: (envId?: CloudEnvironmentId) => void;
  onOpenExportModal?: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  user: UserProfile;
  logFilesCount: number;
  activityFilesCount: number;
  uncompressedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenUploadModal,
  onOpenGuidedPipeline,
  onOpenExportModal,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  user,
  logFilesCount,
  activityFilesCount,
  uncompressedCount,
}) => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  // State for Cloud Environments dropdown accordion (default open)
  const [isCloudEnvOpen, setIsCloudEnvOpen] = useState(true);

  const isEnvActive = currentView.startsWith("env-");

  const handleNavClick = (view: ActiveSidebarView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const handleUploadClick = () => {
    onSelectView("upload-file");
    onOpenUploadModal();
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950/95 border-r border-slate-800/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Logo & App Title */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cloud className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight">CloudOptima</span>
                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  AI-V2
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                Cloud Compression System
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs">
          {/* 1. Dashboard */}
          <button
            type="button"
            id="sidebar-dashboard-btn"
            onClick={() => handleNavClick("dashboard")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              currentView === "dashboard"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${currentView === "dashboard" ? "text-cyan-400" : "text-slate-400"}`} />
              <span>Dashboard</span>
            </div>
          </button>

          {/* Cost Trends & ROI (Recharts Line Chart) */}
          <button
            type="button"
            id="sidebar-cost-roi-btn"
            onClick={() => handleNavClick("cost-roi")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              currentView === "cost-roi"
                ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/10 text-purple-300 border border-purple-500/40 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className={`w-4 h-4 ${currentView === "cost-roi" ? "text-purple-400" : "text-slate-400"}`} />
              <span>Cost Trends &amp; ROI</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
              36.4x ROI
            </span>
          </button>

          {/* 2. Cloud Environments ▾ (Dropdown Menu) */}
          <div>
            <button
              type="button"
              id="sidebar-cloud-environments-toggle"
              onClick={() => setIsCloudEnvOpen(!isCloudEnvOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
                isEnvActive
                  ? "text-cyan-300 font-semibold bg-slate-900/60"
                  : "text-slate-300 hover:text-white hover:bg-slate-900/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Cloud className={`w-4 h-4 ${isEnvActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>Cloud Environments</span>
              </div>
              {isCloudEnvOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Sub-items for the 6 Cloud Environments */}
            {isCloudEnvOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l-2 border-slate-800/80 ml-4 py-1">
                {/* AWS EC2 */}
                <button
                  type="button"
                  id="sidebar-env-aws-ec2"
                  onClick={() => handleNavClick("env-aws-ec2")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    currentView === "env-aws-ec2"
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">AWS EC2</span>
                  </div>
                </button>

                {/* AWS Lambda */}
                <button
                  type="button"
                  id="sidebar-env-aws-lambda"
                  onClick={() => handleNavClick("env-aws-lambda")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    currentView === "env-aws-lambda"
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span className="truncate">AWS Lambda</span>
                  </div>
                </button>

                {/* AWS S3 */}
                <button
                  type="button"
                  id="sidebar-env-aws-s3"
                  onClick={() => handleNavClick("env-aws-s3")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    currentView === "env-aws-s3"
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">AWS S3</span>
                  </div>
                </button>

                {/* Azure Virtual Machines */}
                <button
                  type="button"
                  id="sidebar-env-azure-vm"
                  onClick={() => handleNavClick("env-azure-vm")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    currentView === "env-azure-vm"
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Server className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">Azure Virtual Machines</span>
                  </div>
                </button>

                {/* Google Cloud Compute Engine */}
                <button
                  type="button"
                  id="sidebar-env-gcp-compute"
                  onClick={() => handleNavClick("env-gcp-compute")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    currentView === "env-gcp-compute"
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <HardDrive className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="truncate">Google Cloud Compute Engine</span>
                  </div>
                </button>

                {/* Cloud Application Servers */}
                <button
                  type="button"
                  id="sidebar-env-cloud-app-servers"
                  onClick={() => handleNavClick("env-cloud-app-servers")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    currentView === "env-cloud-app-servers"
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">Cloud Application Servers</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 3. Log Files */}
          <button
            type="button"
            id="sidebar-log-files-btn"
            onClick={() => handleNavClick("log-files")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              currentView === "log-files"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className={`w-4 h-4 ${currentView === "log-files" ? "text-cyan-400" : "text-slate-400"}`} />
              <span>Log Files</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
              {logFilesCount}
            </span>
          </button>

          {/* 4. Activity Files */}
          <button
            type="button"
            id="sidebar-activity-files-btn"
            onClick={() => handleNavClick("activity-files")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              currentView === "activity-files"
                ? "bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-purple-300 border border-purple-500/40 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className={`w-4 h-4 ${currentView === "activity-files" ? "text-purple-400" : "text-slate-400"}`} />
              <span>Activity Files</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950 text-purple-400 border border-purple-800">
              {activityFilesCount}
            </span>
          </button>

          {/* Divider */}
          <div className="pt-2 pb-1">
            <div className="h-px bg-slate-800/80" />
            <div className="flex items-center justify-between px-3 mt-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Compression Pipeline
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                5-Stage Flow
              </span>
            </div>
          </div>

          {/* Guided App Pipeline (5-Step Sequential Workflow) */}
          {onOpenGuidedPipeline && (
            <button
              type="button"
              id="sidebar-guided-pipeline-btn"
              onClick={() => {
                onOpenGuidedPipeline();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 hover:text-white shadow-sm"
              title="Launch 5-step guided pipeline: Load -> AI Analysis -> Preprocess -> Compress -> Verify"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-bold">
                  <Zap className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block leading-tight">Guided Pipeline</span>
                  <span className="text-[9px] text-cyan-400/80 block">Load &bull; AI &bull; Dedup &bull; Verify</span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}

          {/* 5. AI Analysis */}
          <button
            type="button"
            id="sidebar-ai-analysis-btn"
            onClick={() => handleNavClick("ai-analysis")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              currentView === "ai-analysis"
                ? "bg-gradient-to-r from-purple-500/20 to-blue-500/10 text-purple-300 border border-purple-500/40 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className={`w-4 h-4 ${currentView === "ai-analysis" ? "text-purple-400" : "text-slate-400"}`} />
              <span>AI Analysis</span>
            </div>
            <span className="text-[10px] font-mono text-purple-400">NLP</span>
          </button>

          {/* 6. Upload File */}
          <button
            type="button"
            id="sidebar-upload-file-btn"
            onClick={handleUploadClick}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              currentView === "upload-file"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UploadCloud className={`w-4 h-4 ${currentView === "upload-file" ? "text-cyan-400" : "text-slate-400"}`} />
              <span>Upload File</span>
            </div>
            <span className="text-[10px] text-cyan-400">+ Ingest</span>
          </button>

          {/* 7. Preprocessing */}
          <button
            type="button"
            id="sidebar-preprocessing-btn"
            onClick={() => handleNavClick("preprocessing")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              currentView === "preprocessing"
                ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-blue-300 border border-blue-500/40 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders className={`w-4 h-4 ${currentView === "preprocessing" ? "text-blue-400" : "text-slate-400"}`} />
              <span>Preprocessing</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Prep &amp; Recover</span>
          </button>

          {/* 8. Compression */}
          <button
            type="button"
            id="sidebar-compression-btn"
            onClick={() => handleNavClick("compression")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              currentView === "compression"
                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/40 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <TrendingDown className={`w-4 h-4 ${currentView === "compression" ? "text-emerald-400" : "text-slate-400"}`} />
              <span>Compression</span>
            </div>
            {uncompressedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                {uncompressedCount} pending
              </span>
            )}
          </button>

          {/* Experimental benchmark results */}
          <button type="button" id="sidebar-benchmark-results-btn" onClick={() => handleNavClick("benchmark-results")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${currentView === "benchmark-results" ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 text-violet-300 border border-violet-500/40 font-semibold" : "text-slate-300 hover:text-white hover:bg-slate-900/80"}`}>
            <div className="flex items-center gap-2.5"><BarChart3 className={`w-4 h-4 ${currentView === "benchmark-results" ? "text-violet-400" : "text-slate-400"}`} /><span>Benchmark Results</span></div>
            <span className="text-[10px] text-violet-300">Real tests</span>
          </button>

          {/* 9. Decompression & Verify */}
          <button
            type="button"
            id="sidebar-decompression-verify-btn"
            onClick={() => handleNavClick("decompression-verify")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              currentView === "decompression-verify"
                ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/10 text-teal-300 border border-teal-500/40 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className={`w-4 h-4 ${currentView === "decompression-verify" ? "text-teal-400" : "text-slate-400"}`} />
              <span>Decompression &amp; Verify</span>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* Audit Export (PDF / CSV) */}
          {onOpenExportModal && (
            <button
              type="button"
              id="sidebar-export-audit-btn"
              onClick={() => {
                onOpenExportModal();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition cursor-pointer text-slate-300 hover:text-white hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700"
              title="Export complete file directory or compression audit report as CSV or PDF"
            >
              <div className="flex items-center gap-2.5">
                <FileDown className="w-4 h-4 text-emerald-400" />
                <span>Export Audit (PDF/CSV)</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Audit
              </span>
            </button>
          )}

          {/* 10. User Settings */}
          <button
            type="button"
            id="sidebar-user-settings-btn"
            onClick={() => handleNavClick("settings")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              currentView === "settings"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className={`w-4 h-4 ${currentView === "settings" ? "text-cyan-400" : "text-slate-400"}`} />
              <span>User Settings</span>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 capitalize">
              {resolvedTheme}
            </span>
          </button>
        </div>

        {/* Bottom User Profile, Quick Theme Switcher & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/70 space-y-2">
          {/* Quick Theme Toggle Button */}
          <button
            type="button"
            id="sidebar-theme-toggle-btn"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer"
            title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
          >
            <div className="flex items-center gap-2">
              {resolvedTheme === "dark" ? (
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="text-[11px] font-medium">
                {resolvedTheme === "dark" ? "Dark Theme" : "Light Theme"}
              </span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
              Switch
            </span>
          </button>

          <div
            onClick={() => handleNavClick("settings")}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition"
            title="Click to view User Settings"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
              <div className="w-full h-full bg-slate-950 text-cyan-400 rounded-[10px] flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-400" />
          </div>

          {/* Logout */}
          <button
            type="button"
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
