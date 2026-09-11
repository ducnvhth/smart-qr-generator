import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Copy,
  Printer,
  Check,
  Sparkles,
  FileCode,
  Layers,
  BarChart3,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRConfig, TrackedLink } from '../types';
import {
  generateQRCanvas,
  downloadCanvasAsPNG,
  downloadSVG,
  copyQRImageToClipboard,
  extractDomain,
} from '../utils/qrUtils';

interface QRPreviewProps {
  config: QRConfig;
  trackedLink?: TrackedLink | null;
  onSaveToHistory: () => void;
  onOpenStats?: () => void;
  onRefreshStats?: () => void;
  onTestScan?: () => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  config,
  trackedLink,
  onSaveToHistory,
  onOpenStats,
  onRefreshStats,
  onTestScan,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [svgDownloading, setSvgDownloading] = useState(false);
  const [currentResolution, setCurrentResolution] = useState<number>(config.downloadSize);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const domain = extractDomain(config.url);
  const safeFilename = domain
    ? `qr-${domain.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    : 'qr-code';

  // If tracking is enabled and a shortCode exists, encode the tracking URL
  const effectiveUrl =
    config.trackScans && trackedLink?.shortCode
      ? `${window.location.origin}/r/${trackedLink.shortCode}`
      : config.url;

  const effectiveConfig: QRConfig = {
    ...config,
    url: effectiveUrl,
  };

  // Render QR Canvas live on state changes
  useEffect(() => {
    let isCancelled = false;

    async function updatePreview() {
      try {
        const canvas = await generateQRCanvas({
          ...effectiveConfig,
          downloadSize: 420, // display resolution
        });

        if (isCancelled || !containerRef.current) return;

        containerRef.current.innerHTML = '';
        canvas.className =
          'w-full h-auto max-w-[280px] sm:max-w-[320px] rounded-xl shadow-xs transition-all';
        canvasRef.current = canvas;
        containerRef.current.appendChild(canvas);
      } catch (err) {
        console.error('Error generating preview:', err);
      }
    }

    updatePreview();

    return () => {
      isCancelled = true;
    };
  }, [effectiveConfig]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2563EB', '#3B82F6', '#60A5FA', '#10B981'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleDownloadPNG = async () => {
    try {
      setDownloading(true);
      await downloadCanvasAsPNG(
        { ...effectiveConfig, downloadSize: currentResolution },
        `${safeFilename}-${currentResolution}px.png`
      );
      triggerConfetti();
      onSaveToHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSVG = async () => {
    try {
      setSvgDownloading(true);
      await downloadSVG(effectiveConfig, `${safeFilename}.svg`);
      triggerConfetti();
      onSaveToHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setSvgDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    const success = await copyQRImageToClipboard(effectiveConfig);
    if (success) {
      setCopied(true);
      triggerConfetti();
      onSaveToHistory();
      setTimeout(() => setCopied(false), 2500);
    } else {
      alert('Trình duyệt không hỗ trợ sao chép ảnh trực tiếp. Vui lòng bấm Tải ảnh PNG.');
    }
  };

  const handlePrint = async () => {
    try {
      const highResCanvas = await generateQRCanvas(effectiveConfig, 1024);
      const dataUrl = highResCanvas.toDataURL('image/png');

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>In mã QR - ${domain || 'QR Code'}</title>
            <style>
              body {
                margin: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: system-ui, -apple-system, sans-serif;
                text-align: center;
              }
              img {
                max-width: 380px;
                height: auto;
              }
              .url-text {
                margin-top: 14px;
                font-size: 14px;
                color: #475569;
                word-break: break-all;
                max-width: 400px;
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Mã QR" />
            <div class="url-text">${config.url}</div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      onSaveToHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualRefresh = () => {
    if (onRefreshStats) {
      setIsRefreshing(true);
      onRefreshStats();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center sticky top-20">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Kết quả trực tiếp
          </span>
        </div>
        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
          {config.trackScans ? 'Có đếm lượt quét' : 'Mã QR tĩnh'}
        </span>
      </div>

      {/* QR Code Stage */}
      <div className="w-full flex items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-100/80 mb-4 relative group">
        <div
          ref={containerRef}
          className="flex items-center justify-center transition-transform group-hover:scale-[1.01]"
        />
      </div>

      {/* Live Scan Tracker Card (Directly Below Preview) */}
      {config.trackScans && (
        <div className="w-full mb-4 p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 rounded-2xl border border-blue-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Lượt quét trực tiếp
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-blue-900 leading-none">
                    {trackedLink?.scanCount || 0}
                  </span>
                  <span className="text-xs text-blue-700 font-bold">lượt</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onRefreshStats && (
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Cập nhật số lượt quét"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
                  />
                </button>
              )}

              {onTestScan && (
                <button
                  type="button"
                  id="btn-test-scan"
                  onClick={onTestScan}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="Mở tab mới quét thử để xem số lượt tăng ngay"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Thử quét</span>
                </button>
              )}

              {onOpenStats && (
                <button
                  type="button"
                  id="btn-view-stats-modal"
                  onClick={onOpenStats}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="Mở bảng thống kê chi tiết"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Bảng theo dõi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resolution selection */}
      <div className="w-full mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Độ phân giải xuất:
          </span>
          <span className="text-[11px] text-blue-600 font-mono">
            {currentResolution} x {currentResolution} px
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { size: 512, label: 'Chuẩn 512p' },
            { size: 1024, label: 'HD 1024p' },
            { size: 2048, label: 'Siêu nét 4K' },
          ].map((item) => (
            <button
              key={item.size}
              type="button"
              onClick={() => setCurrentResolution(item.size)}
              className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                currentResolution === item.size
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-2">
        {/* Primary Download Button */}
        <button
          type="button"
          id="btn-download-png"
          disabled={downloading}
          onClick={handleDownloadPNG}
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Đang xuất ảnh...' : 'Tải ảnh PNG (Chất lượng cao)'}</span>
        </button>

        {/* Secondary options row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Copy to clipboard */}
          <button
            type="button"
            id="btn-copy-qr"
            onClick={handleCopyImage}
            className={`py-2.5 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Sao chép ảnh vào bộ nhớ tạm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          {/* Download SVG */}
          <button
            type="button"
            id="btn-download-svg"
            disabled={svgDownloading}
            onClick={handleDownloadSVG}
            className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Tải tệp vector SVG cho nhà in"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-500" />
            <span>Vector SVG</span>
          </button>

          {/* Print */}
          <button
            type="button"
            id="btn-print-qr"
            onClick={handlePrint}
            className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="In mã QR ngay"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>In ngay</span>
          </button>
        </div>
      </div>

      {/* Helpful tip */}
      <div className="mt-4 pt-4 border-t border-slate-100 w-full text-center">
        <p className="text-[11px] text-slate-400">
          💡 Bạn có thể dùng camera điện thoại quét thử ngay trên màn hình trước khi tải về.
        </p>
      </div>
    </div>
  );
};
