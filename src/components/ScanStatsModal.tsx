import React, { useState } from 'react';
import {
  X,
  BarChart3,
  ExternalLink,
  Smartphone,
  Calendar,
  Clock,
  RotateCcw,
  Check,
  Copy,
  TrendingUp,
  RefreshCw,
  Globe,
  Monitor,
  Tablet,
} from 'lucide-react';
import { TrackedLink, ScanLog } from '../types';

interface ScanStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: TrackedLink | null;
  onRefresh: () => void;
  onReset: (id: string) => Promise<void>;
}

export const ScanStatsModal: React.FC<ScanStatsModalProps> = ({
  isOpen,
  onClose,
  link,
  onRefresh,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen || !link) return null;

  const trackingUrl = `${window.location.origin}/r/${link.shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleReset = async () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại số lượt quét về 0?')) {
      setIsResetting(true);
      await onReset(link.id);
      setIsResetting(false);
    }
  };

  // Device Breakdown calculations
  const logs = link.scanLogs || [];
  const mobileCount = logs.filter(
    (l) => l.deviceType === 'mobile' || (!l.deviceType && l.os?.includes('iOS')) || l.os?.includes('Android')
  ).length;
  const desktopCount = logs.filter((l) => l.deviceType === 'desktop').length;
  const tabletCount = logs.filter((l) => l.deviceType === 'tablet').length;

  const formatDate = (ms: number) => {
    return new Date(ms).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Chi tiết lượt quét mã QR
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs sm:max-w-md">
                {link.title || link.originalUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleManualRefresh}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100">
              <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                Tổng lượt quét
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">
                {link.scanCount}
              </div>
              <div className="text-[11px] text-blue-600/80 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Cập nhật tức thì
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Lần quét gần nhất
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-2">
                {link.lastScannedAt ? formatDate(link.lastScannedAt) : 'Chưa có'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {link.lastScannedAt ? 'Từ thiết bị người dùng' : 'Sẵn sàng ghi nhận'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Ngày tạo mã
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-2">
                {formatDate(link.createdAt)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Mã đang hoạt động</div>
            </div>
          </div>

          {/* Link Info Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-semibold text-slate-700">Link đích ban đầu:</span>
              <a
                href={link.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 truncate max-w-md font-mono"
              >
                {link.originalUrl}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-700">Link quét trung gian (URL trong mã QR):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded text-[11px]">
                  {trackingUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Device Distribution */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-slate-500" />
              Thiết bị người dùng quét mã
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Điện thoại</div>
                  <div className="text-sm font-bold text-slate-800">{mobileCount}</div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Tablet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Máy tính bảng</div>
                  <div className="text-sm font-bold text-slate-800">{tabletCount}</div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Máy tính / Khác</div>
                  <div className="text-sm font-bold text-slate-800">{desktopCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Scan Log Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Lịch sử các lần quét gần nhất
            </h3>

            {logs.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500">
                  Chưa có dữ liệu quét nào được ghi nhận. Hãy quét mã QR trên điện thoại hoặc bấm nút "Thử quét ngay" ở màn hình chính!
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {logs.map((log, idx) => (
                    <div
                      key={log.id || idx}
                      className="p-3 flex items-center justify-between text-xs bg-white hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-[10px]">
                          #{logs.length - idx}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {formatDate(log.timestamp)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {log.os || 'Hệ điều hành di động'} • {log.browser || 'Trình duyệt'}
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Thành công
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting || link.scanCount === 0}
            className="px-3 py-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-100/70 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại lượt quét về 0</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
