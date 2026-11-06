import React, { useState } from "react";
import {
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sliders,
  Bell,
  Eye,
  Sparkles,
  User,
  RotateCcw,
  Check,
  FileText,
  Clock,
  AlertTriangle,
  HardDrive,
  DollarSign,
  Activity,
} from "lucide-react";
import { UserProfile, ThemeMode, UserSettings } from "../types";
import { useTheme } from "../context/ThemeContext";

interface UserSettingsViewProps {
  user: UserProfile;
}

export const UserSettingsView: React.FC<UserSettingsViewProps> = ({ user }) => {
  const { theme, resolvedTheme, setTheme, settings, updateSettings } = useTheme();
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [storageThresholdGB, setStorageThresholdGB] = useState<number>(() => {
    const saved = localStorage.getItem("cloudoptima_storage_threshold_gb");
    return saved ? parseFloat(saved) : 0.8;
  });

  const triggerSaveNotification = () => {
    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
    }, 2400);
  };

  const handleUpdateThreshold = (val: number) => {
    setStorageThresholdGB(val);
    localStorage.setItem("cloudoptima_storage_threshold_gb", val.toString());
    triggerSaveNotification();
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    triggerSaveNotification();
  };

  const handleDensityChange = (density: "compact" | "standard" | "comfortable") => {
    updateSettings({ fontDensity: density });
    triggerSaveNotification();
  };

  const handleRefreshRateChange = (rate: "5s" | "30s" | "manual") => {
    updateSettings({ telemetryRefreshRate: rate });
    triggerSaveNotification();
  };

  const handleToggleSetting = (key: keyof UserSettings) => {
    if (typeof settings[key] === "boolean") {
      updateSettings({ [key]: !settings[key] });
      triggerSaveNotification();
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  User Settings &amp; Display Preferences
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase">
                  {resolvedTheme === "light" ? "Light Mode Active" : "Dark Mode Active"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Customize themes, adjust analysis viewport legibility, and tune telemetry refresh intervals for long analysis sessions.
              </p>
            </div>
          </div>

          {showSavedNotification && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in slide-in-from-right-2">
              <Check className="w-3.5 h-3.5" />
              <span>Preferences Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 1: THEME & DISPLAY APPEARANCE (PRIMARY USER REQUEST)      */}
      {/* ----------------------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Color Theme &amp; Analysis Session Readability</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Switch themes to reduce eye strain during daylight analysis or prolonged nighttime log auditing.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Currently using:</span>
            <span className="text-cyan-400 font-bold capitalize">{theme}</span>
          </div>
        </div>

        {/* 3 Theme Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Dark Theme Card */}
          <div
            onClick={() => handleThemeChange("dark")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
              theme === "dark"
                ? "bg-slate-950/90 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10"
                : "bg-slate-950/40 border-slate-800/80 hover:border-slate-750 hover:bg-slate-950/60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                  <Moon className="w-5 h-5" />
                </div>
                {theme === "dark" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-white">Dark Theme (Space Slate)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Deep slate-950 canvas with glowing cyan and emerald accents. Optimized for low-light environments and reducing screen glare.
              </p>
            </div>

            {/* Visual Mini Mockup */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 pointer-events-none">
              <div className="flex items-center justify-between text-[9px] text-slate-500">
                <span className="w-12 h-1.5 bg-slate-750 rounded-full" />
                <span className="w-6 h-1.5 bg-cyan-500/40 rounded-full" />
              </div>
              <div className="h-4 rounded bg-slate-900 border border-slate-800 flex items-center px-1.5 gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <div className="w-16 h-1 bg-slate-600 rounded-full" />
              </div>
            </div>
          </div>

          {/* 2. Light Theme Card */}
          <div
            onClick={() => handleThemeChange("light")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
              theme === "light"
                ? "bg-slate-950/90 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10"
                : "bg-slate-950/40 border-slate-800/80 hover:border-slate-750 hover:bg-slate-950/60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Sun className="w-5 h-5" />
                </div>
                {theme === "light" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-white">Light Theme (Enterprise Crisp)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Refined slate-50 canvas with pure white cards and deep contrast typography. Enhances legibility during long daylight analysis sessions.
              </p>
            </div>

            {/* Visual Mini Mockup */}
            <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-300/80 space-y-1.5 pointer-events-none">
              <div className="flex items-center justify-between text-[9px] text-slate-400">
                <span className="w-12 h-1.5 bg-slate-300 rounded-full" />
                <span className="w-6 h-1.5 bg-blue-500/40 rounded-full" />
              </div>
              <div className="h-4 rounded bg-white border border-slate-200 flex items-center px-1.5 gap-1 shadow-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="w-16 h-1 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>

          {/* 3. System Theme Card */}
          <div
            onClick={() => handleThemeChange("system")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
              theme === "system"
                ? "bg-slate-950/90 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10"
                : "bg-slate-950/40 border-slate-800/80 hover:border-slate-750 hover:bg-slate-950/60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Laptop className="w-5 h-5" />
                </div>
                {theme === "system" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active ({resolvedTheme})
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-white">System Auto-Sync</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Automatically switches between light and dark themes to match your operating system schedule or ambient light sensor.
              </p>
            </div>

            {/* Visual Mini Mockup */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 pointer-events-none">
              <span className="flex items-center gap-1">
                <Laptop className="w-3 h-3 text-purple-400" /> OS Synced
              </span>
              <span className="font-mono text-cyan-400">{resolvedTheme}</span>
            </div>
          </div>
        </div>

        {/* Live Theme Preview Box */}
        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Live Viewport Preview ({resolvedTheme === "light" ? "Light Mode Active" : "Dark Mode Active"})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Lossless Telemetry Block</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-[10px] font-bold">
                  AWS-EC2 &bull; SYSLOG
                </span>
                <span className="font-bold text-white">production_kernel_audit.log</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                Saved 74.2% &bull; Lossless SHA-256 Verified
              </span>
            </div>
            <p className="text-slate-400 text-[11px] font-mono leading-relaxed">
              [2026-09-06T08:35:22Z] entropy_codec::lz4_zstd state=COMPRESSED orig=2.4GB comp=620MB verified=TRUE
            </p>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2: VIEWPORT READABILITY & ANALYSIS SESSION COMFORT        */}
      {/* ----------------------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Analysis Session Ergonomics &amp; Telemetry Density</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Fine-tune information density and telemetry font settings for multi-hour log exploration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Font & Data Density */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Data Table &amp; List Density
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "compact", label: "Compact", desc: "For 4K displays" },
                  { id: "standard", label: "Standard", desc: "Balanced layout" },
                  { id: "comfortable", label: "Comfortable", desc: "Spacious padding" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleDensityChange(item.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    settings.fontDensity === item.id
                      ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                      : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold block">{item.label}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Refresh Rate */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Live Telemetry Refresh Interval
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "5s", label: "5 Seconds", desc: "High frequency" },
                  { id: "30s", label: "30 Seconds", desc: "Recommended" },
                  { id: "manual", label: "Manual Only", desc: "No auto-refresh" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRefreshRateChange(item.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    settings.telemetryRefreshRate === item.id
                      ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                      : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold block">{item.label}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Boolean Notification Toggles */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Automated Audit &amp; Event Notifications
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => handleToggleSetting("notifyOnCompressionComplete")}
              className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between gap-3 cursor-pointer hover:border-slate-750 transition"
            >
              <div>
                <span className="text-xs font-semibold text-white block">
                  Batch Compression Receipts
                </span>
                <span className="text-[10px] text-slate-400">
                  Notify when multi-file batch operations finish and log ROI.
                </span>
              </div>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  settings.notifyOnCompressionComplete ? "bg-cyan-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.notifyOnCompressionComplete ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            <div
              onClick={() => handleToggleSetting("notifyOnLosslessVerified")}
              className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between gap-3 cursor-pointer hover:border-slate-750 transition"
            >
              <div>
                <span className="text-xs font-semibold text-white block">
                  Lossless SHA-256 Parity Audits
                </span>
                <span className="text-[10px] text-slate-400">
                  Flag cryptographic pass tokens in the Recent Activity ledger.
                </span>
              </div>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  settings.notifyOnLosslessVerified ? "bg-cyan-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.notifyOnLosslessVerified ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 3: STORAGE CAPACITY THRESHOLD & FINOPS ALERTS (REQUEST #5) */}
      {/* ----------------------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Cloud Storage Capacity Alert Thresholds
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              Threshold System
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure threshold limits to notify you before uncompressed telemetry or log files exceed capacity and generate unexpected cloud bills.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Current Warning Threshold
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[0.5, 0.8, 1.0, 2.0, 5.0].map((gb) => (
                <button
                  key={gb}
                  type="button"
                  onClick={() => handleUpdateThreshold(gb)}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    storageThresholdGB === gb
                      ? "bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold shadow-xs"
                      : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-sm block">{gb} GB</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">
                    ~${(gb * 0.12).toFixed(2)}/mo
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When stored files cross <strong>{storageThresholdGB} GB</strong> (or reach 75% capacity), an alert banner immediately surfaces on the dashboard with a 1-click Guided Compression workflow.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Policy Rules</span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active Monitor
                </span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li>Alert triggers when total original file volume meets threshold.</li>
                <li>Displays real-time Pay-As-You-Use financial exposure ($0.12/GB).</li>
                <li>Provides quick 5-stage sequential compression to eliminate duplicate files.</li>
              </ul>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Setting:</span>
              <span className="font-mono font-bold text-cyan-400">{storageThresholdGB} GB ({Math.round(storageThresholdGB * 1024)} MB)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 4: API QUOTAS, RATE LIMITS & RESET SCHEDULE ("HOURS LIMIT")*/}
      {/* ----------------------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Cloud &amp; AI Rate Limit Reset Cycle
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-mono">
              Limit Lifecycle
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent breakdown of when rate limits reset to normal across AI models, compression engine threads, and cloud telemetry APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Gemini API Free Tier</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                24 Hours
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Daily quota resets automatically at <strong>00:00 UTC</strong> (every 24 hours). Per-minute request limits (15 RPM) refill in <strong>60 seconds</strong>.
            </p>
            <div className="text-[10px] text-cyan-400 font-mono pt-1">
              Reset Interval: 24h cycle / 1m burst
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Enterprise Tier</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Continuous
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paid tier token bucket limits refill continuously on a rolling <strong>1-hour window</strong> with 1,000+ RPM capacity.
            </p>
            <div className="text-[10px] text-emerald-400 font-mono pt-1">
              Reset Interval: Rolling 60 minutes
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Session Leases</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                8 Hours
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Temporary authentication session tokens and client throttling limits automatically reset after <strong>8 hours</strong> of session validity.
            </p>
            <div className="text-[10px] text-purple-400 font-mono pt-1">
              Session TTL: 8 hours renewal
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 5: USER PROFILE & CLOUD ARCHITECT CREDENTIALS             */}
      {/* ----------------------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Active Cloud Architect Session</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Security context and tenant credentials under the current active session.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Architect</span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate">{user.name}</span>
            <span className="text-[10px] text-slate-400 truncate block">{user.email}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Role</span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate">{user.role}</span>
            <span className="text-[10px] text-cyan-400 font-mono block">RBAC Full Access</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Organization</span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate">{user.company}</span>
            <span className="text-[10px] text-slate-400 block">{user.cloudTenants} Cloud Tenants Connected</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Authentication</span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate">{user.provider}</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active Session
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
