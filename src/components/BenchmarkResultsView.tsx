import React, { useMemo, useState } from "react";
import { Activity, BarChart3, CheckCircle2, Download, FileUp, Play, ShieldAlert } from "lucide-react";

type Result = { file: string; algorithm?: string; status: string; error?: string; originalSizeBytes?: number; compressedSizeBytes?: number; compressionRatio?: number; spaceSavedBytes?: number; spaceSavedPercent?: number; compressionTimeSecondsMedian?: number; compressionTimesSeconds?: number[]; decompressionTimeSeconds?: number; compressionThroughputMBps?: number; decompressionThroughputMBps?: number; integrityVerified?: boolean; repetitions?: number; warmupRuns?: number; timingScope?: string };
const bytes = (n?: number) => n == null ? "—" : n.toLocaleString() + " B";
const num = (n?: number, digits = 3) => n == null ? "—" : n.toFixed(digits);
export const BenchmarkResultsView: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [generatedAt, setGeneratedAt] = useState("");
  const run = async () => {
    if (!files.length) { setError("Choose one or more real files first."); return; }
    setRunning(true); setError(""); setResults([]);
    try {
      const encoded = await Promise.all(files.map(async f => ({ name: f.name, base64: await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result).split(",")[1] || ""); r.onerror = reject; r.readAsDataURL(f); }) })));
      const response = await fetch("/api/benchmark", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ files: encoded }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Benchmark request failed.");
      setResults(data.results || []); setGeneratedAt(data.generatedAt || "");
    } catch (e: any) { setError(e?.message || "Could not run benchmark. Make sure the backend is running."); }
    finally { setRunning(false); }
  };
  const downloadCsv = () => {
    const columns = ["file","algorithm","status","originalSizeBytes","compressedSizeBytes","compressionRatio","spaceSavedBytes","spaceSavedPercent","compressionTimeSecondsMedian","decompressionTimeSeconds","compressionThroughputMBps","decompressionThroughputMBps","integrityVerified","error"] as const;
    const csv = [columns.join(","), ...results.map(r => columns.map(c => JSON.stringify((r as any)[c] ?? "")).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "compression-benchmark-results.csv"; a.click(); URL.revokeObjectURL(url);
  };
  const success = results.filter(r => r.algorithm && r.status === "success");
  return <div className="space-y-6 text-slate-100">
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-violet-500/15 p-3 text-violet-300"><BarChart3 /></div><div><h2 className="text-xl font-bold">Real Compression Benchmark</h2><p className="text-sm text-slate-400">Runs GZIP, ZSTD and LZMA on the files you select. No placeholder metrics are used.</p></div></div>
      <div className="mt-5 rounded-xl border border-slate-700 border-dashed p-5"><label className="flex cursor-pointer flex-col items-center gap-2 text-center"><FileUp className="h-8 w-8 text-violet-300"/><span className="font-semibold">Choose log, CSV, JSON, or other files</span><span className="text-xs text-slate-400">Up to 20 files; each file must be 10 MiB or smaller.</span><input className="mt-2 block max-w-full text-sm" type="file" multiple onChange={e => setFiles(Array.from(e.target.files || []))}/></label>{files.length > 0 && <p className="mt-3 text-sm text-emerald-300">Selected: {files.map(f => f.name).join(", ")}</p>}</div>
      <button onClick={run} disabled={running || !files.length} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"><Play className="h-4 w-4"/>{running ? "Running real codec tests…" : "Run Benchmark"}</button>
      {error && <p className="mt-3 rounded-lg bg-red-950/50 p-3 text-sm text-red-300">{error}</p>}
    </section>
    {results.length > 0 && <><section className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-slate-700 bg-slate-900 p-4"><p className="text-sm text-slate-400">Successful codec runs</p><p className="mt-1 text-2xl font-bold">{success.length}</p></div><div className="rounded-xl border border-slate-700 bg-slate-900 p-4"><p className="text-sm text-slate-400">Verified round trips</p><p className="mt-1 text-2xl font-bold">{success.filter(r => r.integrityVerified).length}/{success.length}</p></div><div className="rounded-xl border border-slate-700 bg-slate-900 p-4"><p className="text-sm text-slate-400">Generated at</p><p className="mt-1 text-sm font-semibold">{new Date(generatedAt).toLocaleString()}</p></div></section>
      <section className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900 p-4"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-bold">Measured results</h3><button onClick={downloadCsv} className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"><Download className="h-4 w-4"/>Export CSV</button></div><table className="w-full min-w-[1100px] text-left text-xs"><thead className="text-slate-400"><tr>{["File","Algorithm","Original","Compressed","Ratio","Saved %","Compress s (median)","Decompress s","Compress MB/s","Decompress MB/s","Integrity / status"].map(h => <th key={h} className="border-b border-slate-700 p-2">{h}</th>)}</tr></thead><tbody>{results.map((r,i)=><tr key={i} className="border-b border-slate-800"><td className="p-2">{r.file}</td><td className="p-2">{r.algorithm || "—"}</td><td className="p-2">{bytes(r.originalSizeBytes)}</td><td className="p-2">{bytes(r.compressedSizeBytes)}</td><td className="p-2">{num(r.compressionRatio)}:1</td><td className="p-2">{num(r.spaceSavedPercent,2)}%</td><td className="p-2">{num(r.compressionTimeSecondsMedian,6)}</td><td className="p-2">{num(r.decompressionTimeSeconds,6)}</td><td className="p-2">{num(r.compressionThroughputMBps)}</td><td className="p-2">{num(r.decompressionThroughputMBps)}</td><td className="p-2">{r.integrityVerified ? <span className="inline-flex items-center gap-1 text-emerald-300"><CheckCircle2 className="h-3 w-3"/>PASS</span> : <span className="inline-flex items-center gap-1 text-amber-300"><ShieldAlert className="h-3 w-3"/>{r.error || r.status}</span>}</td></tr>)}</tbody></table></section>
      <section className="rounded-xl border border-amber-700/50 bg-amber-950/20 p-4 text-sm text-amber-100"><p className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4"/>Benchmark notes</p><p className="mt-2">The timings include codec process startup and exclude upload/UI time. One warm-up and five timed compression runs are used. Integrity is checked against the original bytes. These measurements describe this server and selected files, not automatically your production cloud deployment. Failed/missing codecs are shown explicitly.</p></section></>}
  </div>;
};
