<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ca810f5d-b534-4a0a-aa6b-611df0ba0b22

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Real Compression Benchmark (added)

1. Install Node.js and the project dependencies with `npm install`.
2. Install the system codec tools on the machine running the backend: `gzip`, `zstd`, and `xz` (XZ Utils). The benchmark checks for each executable and reports an error if one is missing; it never substitutes fake output.
3. Start the app with `npm run dev`.
4. Open **Benchmark Results** in the dashboard, select real files (maximum 20 files, each up to 10 MiB), and click **Run Benchmark**.
5. Export the resulting measurements with **Export CSV**.

The benchmark uses one warm-up and five timed compression runs per file and codec. It reports the median compression time, decompression time, sizes, ratio, saved bytes/percentage, throughput, SHA-256 values, and byte-for-byte integrity result. Timings include starting the external codec process and exclude browser upload/UI time. Results depend on the machine and codec versions and should be re-run on the environment described in a paper.

**Important:** Existing dashboard demo/sample data and the older client-side export helpers may still contain illustrative values or placeholder payloads. Do not use those as experimental evidence. The new Benchmark Results page measures the actual uploaded file bytes through the backend codec executables. It is a standalone benchmark, not proof that every existing compression action has been replaced by the same backend path.
