export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type LogoOption =
  | 'none'
  | 'link'
  | 'globe'
  | 'facebook'
  | 'zalo'
  | 'youtube'
  | 'tiktok'
  | 'custom';

export interface QRConfig {
  url: string;
  trackScans?: boolean;
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  downloadSize: number; // 512, 1024, 2048
  logo: LogoOption;
  customLogoUrl: string | null;
  includeFrame: boolean;
  frameText: string;
}

export interface ScanLog {
  id: string;
  timestamp: number;
  userAgent?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  os?: string;
  browser?: string;
}

export interface TrackedLink {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string;
  createdAt: number;
  scanCount: number;
  lastScannedAt: number | null;
  fgColor?: string;
  bgColor?: string;
  scanLogs?: ScanLog[];
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  createdAt: number;
  fgColor: string;
  bgColor: string;
  isDynamic?: boolean;
  scanCount?: number;
  shortCode?: string;
}

export interface LinkPreset {
  id: string;
  name: string;
  placeholder: string;
  defaultPrefix: string;
  iconName: string;
  example: string;
}
