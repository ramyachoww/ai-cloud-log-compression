// Application Types & Definitions

export type CloudEnvironmentId =
  | "aws-ec2"
  | "aws-lambda"
  | "aws-s3"
  | "azure-vm"
  | "gcp-compute"
  | "cloud-app-servers";

export interface CloudEnvironmentInfo {
  id: CloudEnvironmentId;
  name: string;
  provider: "AWS" | "Azure" | "GCP" | "Hybrid Cloud";
  region: string;
  iconType: "ec2" | "lambda" | "s3" | "azure" | "gcp" | "server";
  description: string;
}

export type FileCategory = "log" | "activity";

export type FileStatus = "uncompressed" | "analyzed" | "compressed" | "decompressed";

export interface CloudFile {
  id: string;
  name: string;
  category: FileCategory; // "log" (Cloud Log File) or "activity" (Cloud Activity File)
  type: string; // e.g. "syslog", "apache-access", "cloudtrail", "vpc-flow", "json-telemetry", "kernel-audit"
  environmentId: CloudEnvironmentId;
  environmentName: string;
  originalSizeBytes: number;
  compressedSizeBytes: number | null; // null if not yet compressed
  uploadDate: string;
  status: FileStatus;
  linesCount: number;
  sha256Original: string;
  sha256Compressed?: string;
  sampleContent: string[];
  description?: string;
  isDuplicate?: boolean;
  duplicateOfId?: string;
  duplicateReason?: string;
  repetitionScore?: number;
}

export type ActivityActionType =
  | "Upload"
  | "File type detection"
  | "AI analysis"
  | "Preprocessing"
  | "Compression"
  | "Decompression"
  | "Verification"
  | "Reports";

export interface RecentActivityItem {
  id: string;
  action: ActivityActionType;
  fileName: string;
  fileId?: string;
  environmentName: string;
  timestamp: string;
  details: string;
  status: "success" | "pending" | "info";
  metric?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: string;
  company: string;
  cloudTenants?: number;
  provider: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface AISuggestionItem {
  title: string;
  detail: string;
  priority: "HIGH" | "RECOMMENDED" | "BEST_PRACTICE";
  impact: string;
}

export interface AISuggestionResponse {
  success: boolean;
  question: string;
  directAnswer: string;
  suggestions: AISuggestionItem[];
  costAnalysis?: string;
  technicalTip?: string;
  source?: "gemini" | "domain-expert-ai";
}

export interface AIQnARecord {
  id: string;
  timestamp: string;
  fileId: string;
  fileName: string;
  question: string;
  response: AISuggestionResponse;
}

export type ThemeMode = "light" | "dark" | "system";

export interface UserSettings {
  theme: ThemeMode;
  fontDensity: "compact" | "standard" | "comfortable";
  telemetryRefreshRate: "5s" | "30s" | "manual";
  notifyOnCompressionComplete: boolean;
  notifyOnLosslessVerified: boolean;
  highContrastCode: boolean;
}

// =========================================================================
// 5-PILLAR PREPROCESSING DEFINITIONS & LOSSLESS PREPARATION INTERFACES
// =========================================================================

export interface RepeatedPatternItem {
  pattern: string;
  category: "timestamp_prefix" | "header_boilerplate" | "protocol_syntax" | "token_ngram";
  frequency: number;
  sampleOccurrence: string;
  byteSavingsEstimate: string;
  reversibleToken: string;
}

export interface WhitespaceNormalizationAnalysis {
  unnecessarySpacesIdentified: number;
  emptyLinesIdentified: number;
  redundantBytesIdentified: number;
  losslessSpacingMapSizeBytes: number;
  reversibleWhitespaceBitmap: string;
  isLosslessReversible: boolean;
}

export interface DuplicateRecordItem {
  recordIndex: number;
  duplicateOfIndex: number;
  recordPreview: string;
  sha256Hash: string;
  count: number;
  byteSize: number;
  status: "identified" | "pruned" | "pointer_encoded";
}

export interface CommonValueItem {
  value: string;
  category: "status_code" | "log_level" | "ip_subnet" | "method_verb" | "schema_key" | "constant";
  occurrences: number;
  tokenAssigned: string;
  originalBytes: number;
  encodedBytes: number;
  savingsRatio: string;
}

export interface FileStructureAnalysis {
  detectedFormat: "Syslog (RFC-5424)" | "Apache / Nginx Access" | "JSON Telemetry" | "CSV Tabular" | "Key-Value Logfmt" | "Kernel Audit";
  schemaColumnsDetected: string[];
  structuralReorganization: string;
  suitableFormatName: string;
  suitableFormatDescription: string;
  compressionEngineReadiness: {
    zstdSuitability: number; // e.g. 96%
    lz4Suitability: number;  // e.g. 92%
    brotliSuitability: number; // e.g. 94%
  };
}

export interface LosslessVerificationEvidence {
  originalDataLost: false;
  sha256Original: string;
  sha256Reconstructed: string;
  bitwiseParity: "100% BITWISE IDENTICAL";
  zeroBitsLost: boolean;
  inverseDecoderStatus: "VERIFIED_REVERSIBLE";
  decoderMechanism: string;
}

export interface FivePillarPreprocessingResult {
  fileId: string;
  fileName: string;
  fileSizeBytes: number;
  // Pillar 1: Repeated patterns
  repeatedPatterns: {
    totalPatternsIdentified: number;
    repetitionScorePercent: number;
    samplePatterns: RepeatedPatternItem[];
  };
  // Pillar 2: Unnecessary spaces/empty lines
  whitespaceNormalization: WhitespaceNormalizationAnalysis;
  // Pillar 3: Duplicate records
  duplicateRecords: {
    totalDuplicateRecordsIdentified: number;
    duplicateLinesByteVolume: number;
    records: DuplicateRecordItem[];
  };
  // Pillar 4: Common values
  commonValues: {
    totalCommonValuesIdentified: number;
    sharedDictionarySizeBytes: number;
    topValues: CommonValueItem[];
  };
  // Pillar 5: File structure & suitable format
  fileStructure: FileStructureAnalysis;
  // Lossless guarantee
  losslessEvidence: LosslessVerificationEvidence;
  // Synthesis & suitable format stream
  suitableFormatStreamSample: string[];
  estimatedTotalPreReductionPercent: number;
  readyToSendToCompression: boolean;
}

