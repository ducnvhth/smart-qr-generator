import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
  Trash2,
  RotateCcw,
  Calendar,
  Clock,
  ArrowRight,
  QrCode,
  Download,
  Eye,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { TrackedLink } from '../types';
import { extractDomain, downloadCanvasAsPNG } from '../utils/qrUtils';

interface TrackingDashboardProps {
  links: TrackedLink[];
  onRefresh: () => void;
  onOpenDetail: (link: TrackedLink) => void;
  onReset: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSwitchToCreate: () => void;
}

export const TrackingDashboard: React.FC<TrackingDashboardProps> = ({
  links,
  onRefresh,
  onOpenDetail,
  onReset,
  onDelete,
  onSwitchToCreate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleCopy = (shortCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/r/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(shortCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTestScan = (shortCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/r/${shortCode}`;
    window.open(fullUrl, '_blank');
    setTimeout(() => onRefresh(), 1500);
  };

  const handleDownloadMini = async (link: TrackedLink, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/r/${link.shortCode}`;
    await downloadCanvasAsPNG(
      {
        url: fullUrl,
        trackScans: true,
        fgColor: link.fgColor || '#000000',
        bgColor: link.bgColor || '#ffffff',
        errorCorrectionLevel: 'M',
        margin: 2,
        downloadSize: 1024,
        logo: 'none',
        customLogoUrl: null,
        includeFrame: false,
        frameText: '',
      },
      `qr-${link.shortCode}.png`
    );
  };

  // Filter links
  const filtered = links.filter((l) => {
    const term = searchTerm.toLowerCase();
    return (
      l.originalUrl.toLowerCase().includes(term) ||
      l.title.toLowerCase().includes(term) ||
      l.shortCode.toLowerCase().includes(term)
    );
  });

  // Calculate high-level stats
  const totalScans = links.reduce((sum, item) => sum + (item.scanCount || 0), 0);
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayScans = links.reduce((sum, item) => {
    const countToday =
      item.scanLogs?.filter((l) => l.timestamp >= todayStart).length || 0;
    return sum + countToday;
  }, 0);

  const mostScanned = [...links].sort((a, b) => b.scanCount - a.scanCount)[0];

  const formatDate = (ms: number) => {
    return new Date(ms).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getRelativeTime = (ms: number | null) => {
    if (!ms) return 'Chưa có lượt quét';
    const seconds = Math.floor((Date.now() - ms) / 1000);
    if (seconds < 60) return 'Vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total QR Codes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng số mã QR
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {links.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Đang hoạt động</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        {/* Total Scans */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng lượt quét
            </div>
            <div className="text-3xl font-extrabold text-blue-600 mt-1">
              {totalScans}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Tất cả các mã
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* Today Scans */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lượt quét hôm nay
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">
              {todayScans}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Từ 00:00 hôm nay</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Top Performer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mã quét nhiều nhất
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1 truncate">
              {mostScanned ? mostScanned.title : 'Chưa có'}
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">
              {mostScanned ? `${mostScanned.scanCount} lượt quét` : '0 lượt'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Bảng theo dõi tất cả mã QR
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                {filtered.length} mã
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật số lượt quét thời gian thực mỗi khi có người dùng quét mã bằng điện thoại
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm link hoặc tên..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 w-44 sm:w-60"
              />
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors"
              title="Làm mới bảng số liệu"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
              />
            </button>

            {/* Switch to Create */}
            <button
              type="button"
              onClick={onSwitchToCreate}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>+ Tạo mã mới</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        {filtered.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">
              {links.length === 0
                ? 'Chưa có mã QR nào được tạo với tính năng đếm'
                : 'Không tìm thấy mã QR phù hợp'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {links.length === 0
                ? 'Hãy chuyển sang tab Tạo mã QR và bật tùy chọn "Bật đếm lượt quét" để bắt đầu theo dõi.'
                : 'Thử tìm kiếm với từ khóa khác hoặc xóa ô tìm kiếm.'}
            </p>
            {links.length === 0 && (
              <button
                type="button"
                onClick={onSwitchToCreate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Tạo mã QR đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Mã & Link gốc</th>
                  <th className="py-3 px-4">Link trung gian theo dõi</th>
                  <th className="py-3 px-4 text-center">Lượt quét</th>
                  <th className="py-3 px-4">Lần quét gần nhất</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((item) => {
                  const trackingUrl = `${window.location.origin}/r/${item.shortCode}`;
                  const isCopied = copiedCode === item.shortCode;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onOpenDetail(item)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Name and Destination Link */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: item.fgColor || '#000000' }}
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                              {item.originalUrl}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tracking short link */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-blue-700 bg-blue-50/80 px-2 py-1 rounded-md border border-blue-200/60 max-w-[180px] truncate">
                            /r/{item.shortCode}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(item.shortCode, e)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            title="Sao chép link theo dõi"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleTestScan(item.shortCode, e)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Thử quét (mở tab mới để test lượt quét tăng)"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Scan count badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 shadow-2xs">
                          <Smartphone className="w-3 h-3 text-blue-600" />
                          {item.scanCount} lượt
                        </span>
                      </td>

                      {/* Last scan info */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">
                          {getRelativeTime(item.lastScannedAt)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.lastScannedAt
                            ? formatDate(item.lastScannedAt)
                            : `Tạo lúc ${formatDate(item.createdAt)}`}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Open Detail Modal */}
                          <button
                            type="button"
                            onClick={() => onOpenDetail(item)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Xem biểu đồ và lịch sử quét"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>

                          {/* Quick Download QR */}
                          <button
                            type="button"
                            onClick={(e) => handleDownloadMini(item, e)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Tải ảnh QR PNG"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset scans */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Bạn có chắc muốn đặt lại lượt quét về 0?')) {
                                onReset(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Đặt lại lượt quét về 0"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Link */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Xóa mã QR này khỏi danh sách theo dõi?')) {
                                onDelete(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa mã này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
