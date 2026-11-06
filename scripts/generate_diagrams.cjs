const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'docs', 'images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// -------------------------------------------------------------
// Helper styling
// -------------------------------------------------------------
const fontStack = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// -------------------------------------------------------------
// Fig 1: System Architecture
// -------------------------------------------------------------
function generateFig1() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" width="100%" height="100%" style="background:#0d1117; font-family:${fontStack}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#161b22"/>
      <stop offset="100%" stop-color="#0d1117"/>
    </linearGradient>
    <linearGradient id="blueCard" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1f293d"/>
      <stop offset="100%" stop-color="#131d2e"/>
    </linearGradient>
    <linearGradient id="purpleCard" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a1f3d"/>
      <stop offset="100%" stop-color="#1d132e"/>
    </linearGradient>
    <linearGradient id="greenCard" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a2e26"/>
      <stop offset="100%" stop-color="#102019"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Title -->
  <text x="480" y="38" text-anchor="middle" fill="#58a6ff" font-size="20" font-weight="700" letter-spacing="0.5">Fig. 1: Layered Architecture of File-Compression Management System</text>
  <text x="480" y="60" text-anchor="middle" fill="#8b949e" font-size="12">Presentation, Processing, and Data / Metadata Layers with Codec Benchmark Engine</text>

  <!-- Layer 1: Presentation Layer -->
  <rect x="40" y="80" width="880" height="135" rx="10" fill="url(#blueCard)" stroke="#388bfd" stroke-width="1.5" filter="url(#shadow)"/>
  <rect x="55" y="92" width="280" height="24" rx="4" fill="#1f3b64"/>
  <text x="65" y="108" fill="#79c0ff" font-size="12" font-weight="700">I. PRESENTATION LAYER (React 19 + Vite 6 + Tailwind 4)</text>

  <!-- Sub-boxes in Layer 1 -->
  <g transform="translate(60, 126)">
    <!-- Box 1 -->
    <rect x="0" y="0" width="150" height="70" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="75" y="30" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="600">File Upload</text>
    <text x="75" y="48" text-anchor="middle" fill="#8b949e" font-size="10">Drag &amp; Drop / Picker</text>

    <!-- Box 2 -->
    <rect x="170" y="0" width="150" height="70" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="245" y="30" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="600">File Details</text>
    <text x="245" y="48" text-anchor="middle" fill="#8b949e" font-size="10">&amp; Recent Uploads</text>

    <!-- Box 3 -->
    <rect x="340" y="0" width="150" height="70" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="415" y="30" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="600">Compression UI</text>
    <text x="415" y="48" text-anchor="middle" fill="#8b949e" font-size="10">Guided Pipeline</text>

    <!-- Box 4 -->
    <rect x="510" y="0" width="160" height="70" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="590" y="30" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="600">Results Dashboard</text>
    <text x="590" y="48" text-anchor="middle" fill="#8b949e" font-size="10">Sizes, Savings &amp; ROI</text>

    <!-- Box 5 -->
    <rect x="690" y="0" width="150" height="70" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="765" y="30" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="600">Decompress</text>
    <text x="765" y="48" text-anchor="middle" fill="#8b949e" font-size="10">&amp; JSZip Export</text>
  </g>

  <!-- Layer 2: Processing Layer -->
  <rect x="40" y="235" width="880" height="235" rx="10" fill="url(#purpleCard)" stroke="#a371f7" stroke-width="1.5" filter="url(#shadow)"/>
  <rect x="55" y="247" width="370" height="24" rx="4" fill="#3b245e"/>
  <text x="65" y="263" fill="#d2a8ff" font-size="12" font-weight="700">II. APPLICATION / PROCESSING LAYER (Express 4 + Browser)</text>

  <!-- Processing Row 1 -->
  <g transform="translate(60, 282)">
    <rect x="0" y="0" width="150" height="65" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="75" y="28" text-anchor="middle" fill="#e6edf3" font-size="12" font-weight="600">Validation</text>
    <text x="75" y="46" text-anchor="middle" fill="#8b949e" font-size="10">Client-Side Format</text>

    <rect x="170" y="0" width="150" height="65" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="245" y="28" text-anchor="middle" fill="#e6edf3" font-size="12" font-weight="600">Type Detection</text>
    <text x="245" y="46" text-anchor="middle" fill="#8b949e" font-size="10">Extension + Sniffing</text>

    <rect x="340" y="0" width="150" height="65" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="415" y="28" text-anchor="middle" fill="#e6edf3" font-size="12" font-weight="600">Categorization</text>
    <text x="415" y="46" text-anchor="middle" fill="#8b949e" font-size="10">Cloud Log / Activity</text>

    <rect x="510" y="0" width="160" height="65" rx="6" fill="#161b22" stroke="#bc8cff" stroke-dasharray="4,4"/>
    <text x="590" y="28" text-anchor="middle" fill="#d2a8ff" font-size="12" font-weight="600">Preprocessing</text>
    <text x="590" y="46" text-anchor="middle" fill="#8b949e" font-size="10">5-Pillar Structural (Advisory)</text>

    <rect x="690" y="0" width="150" height="65" rx="6" fill="#161b22" stroke="#bc8cff" stroke-dasharray="4,4"/>
    <text x="765" y="28" text-anchor="middle" fill="#d2a8ff" font-size="12" font-weight="600">AI Analysis</text>
    <text x="765" y="46" text-anchor="middle" fill="#8b949e" font-size="10">Gemini 2.5 Flash / Lite</text>
  </g>

  <!-- Processing Row 2: Codec Benchmark Engine -->
  <g transform="translate(60, 365)">
    <rect x="0" y="0" width="195" height="85" rx="6" fill="#1f1833" stroke="#f0883e" stroke-width="1.5"/>
    <text x="97" y="26" text-anchor="middle" fill="#ffa657" font-size="12" font-weight="700">Codec Benchmark Engine</text>
    <text x="97" y="46" text-anchor="middle" fill="#e6edf3" font-size="11">gzip / zstd / xz CLI</text>
    <text x="97" y="65" text-anchor="middle" fill="#8b949e" font-size="9">Native Executables on Host</text>

    <rect x="215" y="0" width="195" height="85" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="312" y="26" text-anchor="middle" fill="#e6edf3" font-size="12" font-weight="600">Size &amp; Timing Measurement</text>
    <text x="312" y="46" text-anchor="middle" fill="#79c0ff" font-size="11">process.hrtime()</text>
    <text x="312" y="65" text-anchor="middle" fill="#8b949e" font-size="9">Excludes I/O &amp; UI Overhead</text>

    <rect x="430" y="0" width="195" height="85" rx="6" fill="#1a2e26" stroke="#3fb950" stroke-width="1.5"/>
    <text x="527" y="26" text-anchor="middle" fill="#56d364" font-size="12" font-weight="700">Round-Trip Check</text>
    <text x="527" y="46" text-anchor="middle" fill="#e6edf3" font-size="11">SHA-256 + Byte Exact</text>
    <text x="527" y="65" text-anchor="middle" fill="#3fb950" font-size="10" font-weight="600">216 / 216 Verified (100%)</text>

    <rect x="645" y="0" width="195" height="85" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="742" y="26" text-anchor="middle" fill="#e6edf3" font-size="12" font-weight="600">Storage-Cost Estimation</text>
    <text x="742" y="46" text-anchor="middle" fill="#e6edf3" font-size="11">$0.50 per GiB-month</text>
    <text x="742" y="65" text-anchor="middle" fill="#8b949e" font-size="9">PAYG Telemetry Assumption</text>
  </g>

  <!-- Layer 3: Data / Metadata Layer -->
  <rect x="40" y="490" width="880" height="120" rx="10" fill="url(#greenCard)" stroke="#238636" stroke-width="1.5" filter="url(#shadow)"/>
  <rect x="55" y="502" width="260" height="24" rx="4" fill="#1b4528"/>
  <text x="65" y="518" fill="#7ee787" font-size="12" font-weight="700">III. DATA / METADATA LAYER</text>

  <g transform="translate(60, 536)">
    <rect x="0" y="0" width="265" height="60" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="132" y="26" text-anchor="middle" fill="#e6edf3" font-size="12" font-weight="600">In-Memory Client State</text>
    <text x="132" y="44" text-anchor="middle" fill="#8b949e" font-size="10">Metadata + 20 sample lines (Stateless)</text>

    <rect x="285" y="0" width="270" height="60" rx="6" fill="#161b22" stroke="#30363d"/>
    <text x="420" y="26" text-anchor="middle" fill="#e6edf3" font-size="12" font-weight="600">Per-File Records</text>
    <text x="420" y="44" text-anchor="middle" fill="#8b949e" font-size="10">Sizes, Type, Category, SHA-256 Digest</text>

    <rect x="575" y="0" width="265" height="60" rx="6" fill="#161b22" stroke="#238636" stroke-dasharray="4,4"/>
    <text x="707" y="26" text-anchor="middle" fill="#7ee787" font-size="12" font-weight="600">Environment Labels (6 Groups)</text>
    <text x="707" y="44" text-anchor="middle" fill="#8b949e" font-size="10">EC2, Lambda, S3, Azure, GCE, App (Org Labels)</text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(outDir, 'fig1-architecture.svg'), svg);
  console.log('Saved fig1-architecture.svg');
}

// -------------------------------------------------------------
// Fig 2: Detailed Processing Flow
// -------------------------------------------------------------
function generateFig2() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" width="100%" height="100%" style="background:#0d1117; font-family:${fontStack}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#58a6ff"/>
    </marker>
    <marker id="arrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#3fb950"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="480" y="38" text-anchor="middle" fill="#58a6ff" font-size="20" font-weight="700">Fig. 2: Detailed End-to-End Processing Flow</text>
  <text x="480" y="60" text-anchor="middle" fill="#8b949e" font-size="13">Mathematical Formalization: F → V → T → K → Π → C → M → Dr → I</text>

  <!-- Row 1: Upload to Category -->
  <!-- Box 1: File Upload -->
  <rect x="50" y="100" width="130" height="60" rx="8" fill="#161b22" stroke="#388bfd" stroke-width="1.5"/>
  <text x="115" y="128" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="700">File Upload</text>
  <text x="115" y="146" text-anchor="middle" fill="#79c0ff" font-size="11">F (Raw File)</text>

  <!-- Arrow -->
  <line x1="180" y1="130" x2="225" y2="130" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Box 2: Validation -->
  <rect x="230" y="100" width="130" height="60" rx="8" fill="#161b22" stroke="#388bfd" stroke-width="1.5"/>
  <text x="295" y="128" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="700">Validation</text>
  <text x="295" y="146" text-anchor="middle" fill="#79c0ff" font-size="11">V (Format Check)</text>

  <!-- Arrow -->
  <line x1="360" y1="130" x2="405" y2="130" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Box 3: File-Type Detection -->
  <rect x="410" y="100" width="140" height="60" rx="8" fill="#161b22" stroke="#388bfd" stroke-width="1.5"/>
  <text x="480" y="128" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="700">Type Detection</text>
  <text x="480" y="146" text-anchor="middle" fill="#79c0ff" font-size="11">T (Ext + Sniffing)</text>

  <!-- Arrow -->
  <line x1="550" y1="130" x2="595" y2="130" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Box 4: Categorization -->
  <rect x="600" y="100" width="140" height="60" rx="8" fill="#161b22" stroke="#388bfd" stroke-width="1.5"/>
  <text x="670" y="128" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="700">Categorization</text>
  <text x="670" y="146" text-anchor="middle" fill="#79c0ff" font-size="11">K (Log / Activity)</text>

  <!-- Branch connector down to Preprocessing -->
  <path d="M 670 160 L 670 195 L 480 195 L 480 220" fill="none" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Row 2: Category Preprocessing -->
  <g transform="translate(100, 220)">
    <!-- Log Preprocessing -->
    <rect x="0" y="0" width="220" height="65" rx="8" fill="#1f1833" stroke="#a371f7" stroke-dasharray="4,4"/>
    <text x="110" y="26" text-anchor="middle" fill="#d2a8ff" font-size="12" font-weight="700">Cloud Log File (Π)</text>
    <text x="110" y="44" text-anchor="middle" fill="#8b949e" font-size="10">Textual Pattern Analysis</text>

    <!-- Activity Preprocessing -->
    <rect x="260" y="0" width="220" height="65" rx="8" fill="#1f1833" stroke="#a371f7" stroke-dasharray="4,4"/>
    <text x="370" y="26" text-anchor="middle" fill="#d2a8ff" font-size="12" font-weight="700">Cloud Activity File (Π)</text>
    <text x="370" y="44" text-anchor="middle" fill="#8b949e" font-size="10">Columnar / Schema Analysis</text>

    <!-- Other -->
    <rect x="520" y="0" width="220" height="65" rx="8" fill="#161b22" stroke="#8b949e" stroke-dasharray="4,4"/>
    <text x="630" y="26" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="700">Other Supported File (Π)</text>
    <text x="630" y="44" text-anchor="middle" fill="#8b949e" font-size="10">Identity (No category step)</text>
  </g>

  <!-- Path to Compression -->
  <path d="M 480 285 L 480 320" fill="none" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Row 3: Compression -> Measurement -> Dashboard -> Decompression -> Verification -->
  <g transform="translate(50, 325)">
    <!-- Box: Compression -->
    <rect x="0" y="0" width="150" height="65" rx="8" fill="#1c2518" stroke="#3fb950" stroke-width="1.5"/>
    <text x="75" y="28" text-anchor="middle" fill="#7ee787" font-size="13" font-weight="700">Compression (C)</text>
    <text x="75" y="46" text-anchor="middle" fill="#8b949e" font-size="10">gzip / zstd / xz Codecs</text>

    <line x1="150" y1="32" x2="185" y2="32" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow)"/>

    <!-- Box: Measurement -->
    <rect x="190" y="0" width="145" height="65" rx="8" fill="#161b22" stroke="#30363d"/>
    <text x="262" y="28" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="700">Measurement (M)</text>
    <text x="262" y="46" text-anchor="middle" fill="#8b949e" font-size="10">Sizes (Sc) &amp; Time (Tc)</text>

    <line x1="335" y1="32" x2="370" y2="32" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow)"/>

    <!-- Box: Dashboard -->
    <rect x="375" y="0" width="145" height="65" rx="8" fill="#161b22" stroke="#30363d"/>
    <text x="447" y="28" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="700">Results Dashboard</text>
    <text x="447" y="46" text-anchor="middle" fill="#8b949e" font-size="10">CR, SS &amp; Cost Savings</text>

    <line x1="520" y1="32" x2="555" y2="32" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow)"/>

    <!-- Box: Decompression -->
    <rect x="560" y="0" width="140" height="65" rx="8" fill="#161b22" stroke="#30363d"/>
    <text x="630" y="28" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="700">Decompress (Dr)</text>
    <text x="630" y="46" text-anchor="middle" fill="#8b949e" font-size="10">Reconstruct Original File</text>

    <line x1="700" y1="32" x2="735" y2="32" stroke="#3fb950" stroke-width="2" marker-end="url(#arrowGreen)"/>

    <!-- Box: Integrity Check -->
    <rect x="740" y="0" width="120" height="65" rx="8" fill="#1b4528" stroke="#3fb950" stroke-width="2"/>
    <text x="800" y="26" text-anchor="middle" fill="#7ee787" font-size="12" font-weight="700">Integrity Check (I)</text>
    <text x="800" y="42" text-anchor="middle" fill="#e6edf3" font-size="10">SHA-256 Digest</text>
    <text x="800" y="56" text-anchor="middle" fill="#3fb950" font-size="10" font-weight="700">V = 1 (100% Exact)</text>
  </g>

  <!-- Bottom note -->
  <text x="480" y="445" text-anchor="middle" fill="#8b949e" font-size="12">Category-specific preprocessing is applied conditionally; verification is byte-exact without data loss.</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, 'fig2-processing-flow.svg'), svg);
  console.log('Saved fig2-processing-flow.svg');
}

// -------------------------------------------------------------
// Fig 3: Experimental Protocol
// -------------------------------------------------------------
function generateFig3() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 280" width="100%" height="100%" style="background:#0d1117; font-family:${fontStack}">
  <defs>
    <marker id="arrow3" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#58a6ff"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="480" y="38" text-anchor="middle" fill="#58a6ff" font-size="18" font-weight="700">Fig. 3: Standalone Experimental Benchmarking Protocol</text>
  <text x="480" y="58" text-anchor="middle" fill="#8b949e" font-size="12">Repeated per-category evaluation of 9 codec-level combinations with round-trip verification</text>

  <!-- 6 Boxes across the row -->
  <g transform="translate(30, 95)">
    <!-- Box 1 -->
    <rect x="0" y="0" width="130" height="100" rx="8" fill="#161b22" stroke="#388bfd" stroke-width="1.5"/>
    <text x="65" y="32" text-anchor="middle" fill="#79c0ff" font-size="12" font-weight="700">Benchmark Corpus</text>
    <text x="65" y="52" text-anchor="middle" fill="#e6edf3" font-size="11">16 Loghub Logs</text>
    <text x="65" y="70" text-anchor="middle" fill="#e6edf3" font-size="11">+ 8 Activity Files</text>
    <text x="65" y="88" text-anchor="middle" fill="#8b949e" font-size="10">24 files (16.97 MB)</text>

    <line x1="130" y1="50" x2="155" y2="50" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow3)"/>

    <!-- Box 2 -->
    <rect x="160" y="0" width="125" height="100" rx="8" fill="#161b22" stroke="#30363d"/>
    <text x="222" y="35" text-anchor="middle" fill="#e6edf3" font-size="12" font-weight="700">Repeated Runs</text>
    <text x="222" y="58" text-anchor="middle" fill="#f0883e" font-size="12" font-weight="600">r = 10 Repetitions</text>
    <text x="222" y="78" text-anchor="middle" fill="#8b949e" font-size="10">(1 warm-up discarded)</text>

    <line x1="285" y1="50" x2="310" y2="50" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow3)"/>

    <!-- Box 3 -->
    <rect x="315" y="0" width="135" height="100" rx="8" fill="#1f1833" stroke="#a371f7"/>
    <text x="382" y="30" text-anchor="middle" fill="#d2a8ff" font-size="12" font-weight="700">Codec × Level Grid</text>
    <text x="382" y="50" text-anchor="middle" fill="#e6edf3" font-size="11">GZIP (1, 6, 9)</text>
    <text x="382" y="68" text-anchor="middle" fill="#e6edf3" font-size="11">ZSTD (3, 10, 19)</text>
    <text x="382" y="86" text-anchor="middle" fill="#e6edf3" font-size="11">LZMA (1, 6, 9)</text>

    <line x1="450" y1="50" x2="475" y2="50" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow3)"/>

    <!-- Box 4 -->
    <rect x="480" y="0" width="130" height="100" rx="8" fill="#161b22" stroke="#30363d"/>
    <text x="545" y="32" text-anchor="middle" fill="#e6edf3" font-size="12" font-weight="700">Metrics Recorded</text>
    <text x="545" y="54" text-anchor="middle" fill="#79c0ff" font-size="11">So, Sc (bytes)</text>
    <text x="545" y="72" text-anchor="middle" fill="#79c0ff" font-size="11">Tc, Td (seconds)</text>
    <text x="545" y="88" text-anchor="middle" fill="#8b949e" font-size="10">time.perf_counter()</text>

    <line x1="610" y1="50" x2="635" y2="50" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow3)"/>

    <!-- Box 5 -->
    <rect x="640" y="0" width="125" height="100" rx="8" fill="#1a2e26" stroke="#3fb950" stroke-width="1.5"/>
    <text x="702" y="32" text-anchor="middle" fill="#56d364" font-size="12" font-weight="700">Round-Trip Check</text>
    <text x="702" y="52" text-anchor="middle" fill="#e6edf3" font-size="11">SHA-256 Compare</text>
    <text x="702" y="72" text-anchor="middle" fill="#3fb950" font-size="12" font-weight="700">216 / 216</text>
    <text x="702" y="88" text-anchor="middle" fill="#3fb950" font-size="10">Zero Mismatches</text>

    <line x1="765" y1="50" x2="790" y2="50" stroke="#58a6ff" stroke-width="2" marker-end="url(#arrow3)"/>

    <!-- Box 6 -->
    <rect x="795" y="0" width="115" height="100" rx="8" fill="#161b22" stroke="#388bfd" stroke-width="1.5"/>
    <text x="852" y="32" text-anchor="middle" fill="#79c0ff" font-size="12" font-weight="700">Aggregation</text>
    <text x="852" y="52" text-anchor="middle" fill="#e6edf3" font-size="10">CR (agg) &amp; SS (%)</text>
    <text x="852" y="70" text-anchor="middle" fill="#e6edf3" font-size="10">Throughput (MB/s)</text>
    <text x="852" y="88" text-anchor="middle" fill="#8b949e" font-size="10">Wilcoxon &amp; t-test</text>
  </g>

  <!-- Note -->
  <text x="480" y="235" text-anchor="middle" fill="#8b949e" font-size="11">Executed on Ubuntu 22.04 LTS (1 vCPU, 3.9 GiB RAM) using Python 3.10.12 with standard system codec binaries.</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, 'fig3-experimental-protocol.svg'), svg);
  console.log('Saved fig3-experimental-protocol.svg');
}

// -------------------------------------------------------------
// Fig 4: Aggregate Compression Ratio & Speed
// -------------------------------------------------------------
function generateFig4() {
  const codecs = ['GZIP-1', 'GZIP-6', 'GZIP-9', 'ZSTD-3', 'ZSTD-10', 'ZSTD-19', 'LZMA-1', 'LZMA-6', 'LZMA-9'];
  const logCR = [7.63, 9.55, 9.99, 9.96, 11.96, 13.40, 11.70, 13.60, 13.60];
  const actCR = [4.94, 5.90, 6.08, 5.96, 6.65, 7.23, 5.85, 7.18, 7.18];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" width="100%" height="100%" style="background:#0d1117; font-family:${fontStack}">
  <!-- Title -->
  <text x="480" y="38" text-anchor="middle" fill="#58a6ff" font-size="20" font-weight="700">Fig. 4: Aggregate Compression Ratio Across Codec Settings</text>
  <text x="480" y="60" text-anchor="middle" fill="#8b949e" font-size="12">16 Public Loghub Logs (4.46 MB) vs. 8 Synthetic Activity Files (12.51 MB)</text>

  <!-- Legend -->
  <g transform="translate(680, 85)">
    <rect x="0" y="0" width="16" height="12" rx="2" fill="#58a6ff"/>
    <text x="24" y="11" fill="#c9d1d9" font-size="12">Cloud Logs</text>
    <rect x="110" y="0" width="16" height="12" rx="2" fill="#f0883e"/>
    <text x="134" y="11" fill="#c9d1d9" font-size="12">Activity Files</text>
  </g>

  <!-- Chart Area -->
  <!-- Y-Axis labels (0 to 16) -->
  <g transform="translate(70, 110)">
    <!-- Grid lines -->
    <line x1="0" y1="0" x2="820" y2="0" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-12" y="4" text-anchor="end" fill="#8b949e" font-size="11">16</text>

    <line x1="0" y1="70" x2="820" y2="70" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-12" y="74" text-anchor="end" fill="#8b949e" font-size="11">12</text>

    <line x1="0" y1="140" x2="820" y2="140" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-12" y="144" text-anchor="end" fill="#8b949e" font-size="11">8</text>

    <line x1="0" y1="210" x2="820" y2="210" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-12" y="214" text-anchor="end" fill="#8b949e" font-size="11">4</text>

    <line x1="0" y1="280" x2="820" y2="280" stroke="#8b949e" stroke-width="1.5"/>
    <text x="-12" y="284" text-anchor="end" fill="#8b949e" font-size="11">0</text>
    <text x="-40" y="140" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="600" transform="rotate(-90, -40, 140)">Aggregate Compression Ratio (CR)</text>

    <!-- Bars -->
    ${codecs.map((codec, i) => {
      const x = 30 + i * 86;
      const logH = (logCR[i] / 16) * 280;
      const actH = (actCR[i] / 16) * 280;
      return `
        <!-- ${codec} -->
        <rect x="${x}" y="${280 - logH}" width="30" height="${logH}" rx="3" fill="#388bfd" opacity="0.9"/>
        <text x="${x + 15}" y="${280 - logH - 6}" text-anchor="middle" fill="#79c0ff" font-size="10" font-weight="700">${logCR[i]}</text>
        <rect x="${x + 34}" y="${280 - actH}" width="30" height="${actH}" rx="3" fill="#d29922" opacity="0.9"/>
        <text x="${x + 49}" y="${280 - actH - 6}" text-anchor="middle" fill="#e3b341" font-size="10" font-weight="700">${actCR[i]}</text>
        <text x="${x + 32}" y="302" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="600">${codec}</text>
      `;
    }).join('')}
  </g>

  <!-- Subtitle note -->
  <text x="480" y="445" text-anchor="middle" fill="#8b949e" font-size="11">ZSTD-3 matches GZIP-9 in ratio (~9.96 vs ~9.99) while achieving 13.6× faster throughput (548 MB/s vs 40.4 MB/s).</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, 'fig4-compression-performance.svg'), svg);
  console.log('Saved fig4-compression-performance.svg');
}

// -------------------------------------------------------------
// Fig 5: Per-File Compression Ratio on 16 Loghub Samples
// -------------------------------------------------------------
function generateFig5() {
  const logs = ['Android', 'Apache', 'BGL', 'HDFS', 'HPC', 'Hadoop', 'HealthApp', 'Linux', 'Mac', 'OpenSSH', 'OpenStack', 'Proxifier', 'Spark', 'T-Bird', 'Windows', 'Zookeeper'];
  const gzip6 = [10.88, 17.14, 5.53, 5.22, 5.66, 20.07, 10.30, 12.76, 5.75, 13.72, 10.68, 10.35, 13.69, 8.87, 19.63, 12.96];
  const zstd19 = [16.99, 23.91, 7.27, 6.72, 7.75, 28.77, 14.04, 19.11, 8.80, 20.75, 14.62, 12.77, 19.82, 14.04, 31.27, 16.86];
  const lzma9 = [16.57, 23.66, 7.97, 6.73, 8.00, 29.28, 14.09, 18.53, 9.20, 19.02, 14.18, 13.19, 19.77, 15.74, 29.76, 15.99];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" width="100%" height="100%" style="background:#0d1117; font-family:${fontStack}">
  <!-- Title -->
  <text x="500" y="38" text-anchor="middle" fill="#58a6ff" font-size="20" font-weight="700">Fig. 5: Per-File Compression Ratio on 16 Public Loghub Samples</text>
  <text x="500" y="60" text-anchor="middle" fill="#8b949e" font-size="12">Comparison between GZIP-6 (balanced baseline), ZSTD-19 (deep compression), and LZMA-9 (maximum ratio)</text>

  <!-- Legend -->
  <g transform="translate(620, 85)">
    <rect x="0" y="0" width="16" height="12" rx="2" fill="#58a6ff"/>
    <text x="22" y="11" fill="#c9d1d9" font-size="12">GZIP-6</text>
    <rect x="90" y="0" width="16" height="12" rx="2" fill="#f0883e"/>
    <text x="112" y="11" fill="#c9d1d9" font-size="12">ZSTD-19</text>
    <rect x="190" y="0" width="16" height="12" rx="2" fill="#a371f7"/>
    <text x="212" y="11" fill="#c9d1d9" font-size="12">LZMA-9</text>
  </g>

  <!-- Chart Area -->
  <g transform="translate(60, 110)">
    <!-- Grid lines (0 to 35) -->
    <line x1="0" y1="0" x2="900" y2="0" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-10" y="4" text-anchor="end" fill="#8b949e" font-size="11">35</text>

    <line x1="0" y1="80" x2="900" y2="80" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-10" y="84" text-anchor="end" fill="#8b949e" font-size="11">25</text>

    <line x1="0" y1="160" x2="900" y2="160" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-10" y="164" text-anchor="end" fill="#8b949e" font-size="11">15</text>

    <line x1="0" y1="240" x2="900" y2="240" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-10" y="244" text-anchor="end" fill="#8b949e" font-size="11">5</text>

    <line x1="0" y1="280" x2="900" y2="280" stroke="#8b949e" stroke-width="1.5"/>
    <text x="-10" y="284" text-anchor="end" fill="#8b949e" font-size="11">0</text>
    <text x="-40" y="140" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="600" transform="rotate(-90, -40, 140)">Compression Ratio (CR = So / Sc)</text>

    <!-- 16 Bars grouped -->
    ${logs.map((log, i) => {
      const x = 12 + i * 55;
      const hG = (gzip6[i] / 35) * 280;
      const hZ = (zstd19[i] / 35) * 280;
      const hL = (lzma9[i] / 35) * 280;
      return `
        <!-- ${log} -->
        <rect x="${x}" y="${280 - hG}" width="14" height="${hG}" rx="2" fill="#388bfd" opacity="0.85"/>
        <rect x="${x + 16}" y="${280 - hZ}" width="14" height="${hZ}" rx="2" fill="#d29922" opacity="0.85"/>
        <rect x="${x + 32}" y="${280 - hL}" width="14" height="${hL}" rx="2" fill="#8957e5" opacity="0.85"/>
        <text x="${x + 23}" y="302" text-anchor="end" fill="#c9d1d9" font-size="10" transform="rotate(-45, ${x + 23}, 302)">${log}</text>
      `;
    }).join('')}
  </g>

  <!-- Note -->
  <text x="500" y="475" text-anchor="middle" fill="#8b949e" font-size="11">Peak compression reaches 31.27:1 (Windows logs under ZSTD-19) and 29.28:1 (Hadoop logs under LZMA-9).</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, 'fig5-per-file-compression-ratio.svg'), svg);
  console.log('Saved fig5-per-file-compression-ratio.svg');
}

// -------------------------------------------------------------
// Fig 6: Compression Speed & Size Comparison
// -------------------------------------------------------------
function generateFig6() {
  const codecs = ['GZIP-1', 'GZIP-6', 'GZIP-9', 'ZSTD-3', 'ZSTD-10', 'ZSTD-19', 'LZMA-1', 'LZMA-6', 'LZMA-9'];
  const logSpeed = [215.9, 83.1, 40.4, 548.0, 80.4, 2.0, 45.2, 6.0, 3.8];
  const actSpeed = [172.9, 80.7, 28.6, 452.0, 80.0, 1.9, 23.8, 4.6, 4.0];
  const decompLogs = [488, 569, 564, 1595, 1659, 1428, 187, 178, 171];
  const decompAct = [444, 458, 468, 1921, 1850, 1985, 123, 104, 95];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" width="100%" height="100%" style="background:#0d1117; font-family:${fontStack}">
  <text x="480" y="38" text-anchor="middle" fill="#58a6ff" font-size="20" font-weight="700">Fig. 6: Compression &amp; Decompression Throughput (MB/s)</text>
  <text x="480" y="60" text-anchor="middle" fill="#8b949e" font-size="12">Zstandard delivers industry-leading decompression throughput exceeding 1.98 GB/s (1,985 MB/s)</text>

  <!-- Legend -->
  <g transform="translate(560, 85)">
    <rect x="0" y="0" width="14" height="12" rx="2" fill="#388bfd"/>
    <text x="20" y="10" fill="#c9d1d9" font-size="11">Comp (Logs)</text>
    <rect x="100" y="0" width="14" height="12" rx="2" fill="#d29922"/>
    <text x="120" y="10" fill="#c9d1d9" font-size="11">Comp (Activity)</text>
    <rect x="220" y="0" width="14" height="12" rx="2" fill="#3fb950"/>
    <text x="240" y="10" fill="#c9d1d9" font-size="11">Decomp (Logs)</text>
  </g>

  <!-- Chart Area -->
  <g transform="translate(70, 110)">
    <!-- Grid lines (0 to 2000 MB/s) -->
    <line x1="0" y1="0" x2="820" y2="0" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-12" y="4" text-anchor="end" fill="#8b949e" font-size="11">2,000</text>

    <line x1="0" y1="70" x2="820" y2="70" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-12" y="74" text-anchor="end" fill="#8b949e" font-size="11">1,500</text>

    <line x1="0" y1="140" x2="820" y2="140" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-12" y="144" text-anchor="end" fill="#8b949e" font-size="11">1,000</text>

    <line x1="0" y1="210" x2="820" y2="210" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-12" y="214" text-anchor="end" fill="#8b949e" font-size="11">500</text>

    <line x1="0" y1="280" x2="820" y2="280" stroke="#8b949e" stroke-width="1.5"/>
    <text x="-12" y="284" text-anchor="end" fill="#8b949e" font-size="11">0</text>
    <text x="-40" y="140" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="600" transform="rotate(-90, -40, 140)">Throughput (MB/s)</text>

    <!-- Bars -->
    ${codecs.map((codec, i) => {
      const x = 20 + i * 88;
      const hC1 = (logSpeed[i] / 2000) * 280;
      const hC2 = (actSpeed[i] / 2000) * 280;
      const hD = (decompLogs[i] / 2000) * 280;
      return `
        <!-- ${codec} -->
        <rect x="${x}" y="${280 - hC1}" width="20" height="${hC1}" rx="2" fill="#388bfd" opacity="0.9"/>
        <rect x="${x + 23}" y="${280 - hC2}" width="20" height="${hC2}" rx="2" fill="#d29922" opacity="0.9"/>
        <rect x="${x + 46}" y="${280 - hD}" width="20" height="${hD}" rx="2" fill="#2ea043" opacity="0.9"/>
        <text x="${x + 33}" y="302" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="600">${codec}</text>
      `;
    }).join('')}
  </g>

  <!-- Note -->
  <text x="480" y="445" text-anchor="middle" fill="#8b949e" font-size="11">ZSTD achieves ultra-fast decompression (1.43–1.98 GB/s), making telemetry immediately searchable upon retrieval.</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, 'fig6-speed-vs-space.svg'), svg);
  console.log('Saved fig6-speed-vs-space.svg');
}

// -------------------------------------------------------------
// Fig 7: Storage Cost Savings
// -------------------------------------------------------------
function generateFig7() {
  const codecs = ['GZIP-1', 'GZIP-6', 'GZIP-9', 'ZSTD-3', 'ZSTD-10', 'ZSTD-19', 'LZMA-1', 'LZMA-6', 'LZMA-9'];
  const logCost = [65.53, 52.36, 50.05, 50.20, 41.81, 37.31, 42.74, 36.76, 36.76];
  const actCost = [101.21, 84.75, 82.24, 83.89, 75.19, 69.16, 85.47, 69.64, 69.64];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" width="100%" height="100%" style="background:#0d1117; font-family:${fontStack}">
  <text x="480" y="38" text-anchor="middle" fill="#58a6ff" font-size="20" font-weight="700">Fig. 7: Estimated Monthly Storage Cost for 1,000 GiB</text>
  <text x="480" y="60" text-anchor="middle" fill="#8b949e" font-size="12">Telemetry Storage Rate: $0.50 per GiB-month | Baseline Uncompressed: $500.00 / Month ($6,000 / Year)</text>

  <!-- Legend -->
  <g transform="translate(620, 85)">
    <line x1="0" y1="6" x2="30" y2="6" stroke="#f85149" stroke-width="2" stroke-dasharray="4,4"/>
    <text x="36" y="10" fill="#f85149" font-size="11" font-weight="700">Uncompressed ($500)</text>
    <rect x="180" y="0" width="14" height="12" rx="2" fill="#388bfd"/>
    <text x="200" y="10" fill="#c9d1d9" font-size="11">Logs Cost</text>
    <rect x="270" y="0" width="14" height="12" rx="2" fill="#d29922"/>
    <text x="290" y="10" fill="#c9d1d9" font-size="11">Activity Cost</text>
  </g>

  <!-- Chart Area -->
  <g transform="translate(70, 110)">
    <!-- 500 baseline dashed line -->
    <line x1="0" y1="0" x2="820" y2="0" stroke="#f85149" stroke-width="2" stroke-dasharray="4,4"/>
    <text x="-12" y="4" text-anchor="end" fill="#f85149" font-size="11" font-weight="700">$500</text>

    <!-- Grid lines -->
    <line x1="0" y1="70" x2="820" y2="70" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-12" y="74" text-anchor="end" fill="#8b949e" font-size="11">$375</text>

    <line x1="0" y1="140" x2="820" y2="140" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-12" y="144" text-anchor="end" fill="#8b949e" font-size="11">$250</text>

    <line x1="0" y1="210" x2="820" y2="210" stroke="#30363d" stroke-dasharray="3,3"/>
    <text x="-12" y="214" text-anchor="end" fill="#8b949e" font-size="11">$125</text>

    <line x1="0" y1="280" x2="820" y2="280" stroke="#8b949e" stroke-width="1.5"/>
    <text x="-12" y="284" text-anchor="end" fill="#8b949e" font-size="11">$0</text>
    <text x="-40" y="140" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="600" transform="rotate(-90, -40, 140)">Monthly Cost (USD/month)</text>

    <!-- Bars -->
    ${codecs.map((codec, i) => {
      const x = 30 + i * 86;
      const hL = (logCost[i] / 500) * 280;
      const hA = (actCost[i] / 500) * 280;
      return `
        <!-- ${codec} -->
        <rect x="${x}" y="${280 - hL}" width="30" height="${hL}" rx="3" fill="#388bfd" opacity="0.9"/>
        <text x="${x + 15}" y="${280 - hL - 6}" text-anchor="middle" fill="#79c0ff" font-size="10" font-weight="700">$${Math.round(logCost[i])}</text>
        <rect x="${x + 34}" y="${280 - hA}" width="30" height="${hA}" rx="3" fill="#d29922" opacity="0.9"/>
        <text x="${x + 49}" y="${280 - hA - 6}" text-anchor="middle" fill="#e3b341" font-size="10" font-weight="700">$${Math.round(actCost[i])}</text>
        <text x="${x + 32}" y="302" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="600">${codec}</text>
      `;
    }).join('')}
  </g>

  <!-- Note -->
  <text x="480" y="445" text-anchor="middle" fill="#8b949e" font-size="11">Annual storage savings exceed $5,550/year per 1,000 GiB under ZSTD-19 and LZMA-6/9 (from $6,000/yr down to ~$441/yr).</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, 'fig7-storage-cost.svg'), svg);
  console.log('Saved fig7-storage-cost.svg');
}

generateFig1();
generateFig2();
generateFig3();
generateFig4();
generateFig5();
generateFig6();
generateFig7();
console.log('All diagrams generated successfully!');
