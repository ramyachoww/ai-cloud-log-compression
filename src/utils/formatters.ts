// Storage and byte formatting utilities

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

// Standard cloud pay-as-you-use ingestion & storage rate for telemetry / log files ($0.50 per GB)
export const CLOUD_PAYG_RATE_PER_GB = 0.50;

/**
 * Calculates pay-as-you-use cloud cost for a given file size in bytes
 */
export function calculateCloudPrice(bytes: number | null | undefined, ratePerGb = CLOUD_PAYG_RATE_PER_GB): number {
  if (!bytes || bytes <= 0) return 0;
  const gb = bytes / (1024 * 1024 * 1024);
  return gb * ratePerGb;
}

/**
 * Formats a calculated cloud dollar amount with appropriate decimal precision
 */
export function formatCloudPrice(priceInDollars: number | null | undefined): string {
  if (priceInDollars === null || priceInDollars === undefined) return "—";
  if (priceInDollars === 0) return "$0.00";
  if (priceInDollars < 0.001) return "<$0.001";
  if (priceInDollars < 1) {
    return `$${priceInDollars.toFixed(3)}`;
  }
  return `$${priceInDollars.toFixed(2)}`;
}
