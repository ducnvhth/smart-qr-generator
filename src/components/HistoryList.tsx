import React from 'react';
import { History, Trash2, ArrowUpRight, Copy, Check, BarChart3, Smartphone } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onRemoveItem: (id: string) => void;
  onOpenStatsItem?: (item: HistoryItem) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelect,
  onClear,
  onRemoveItem,
  onOpenStatsItem,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (history.length === 0) return null;

  const handleCopy = (id: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-800">
            Mã QR đã tạo gần đây ({history.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa lịch sử</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="py-2.5 px-3 -mx-2 rounded-xl flex items-center justify-between hover:bg-slate-50 cursor-pointer group transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div
                className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                style={{ backgroundColor: item.fgColor }}
                title={`Màu: ${item.fgColor}`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {item.title || item.url}
                  </span>
                  {item.isDynamic && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      <Smartphone className="w-2.5 h-2.5" />
                      {item.scanCount ?? 0}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                  {item.url}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
              {onOpenStatsItem && item.isDynamic && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenStatsItem(item);
                  }}
                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Xem chi tiết lượt quét"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={(e) => handleCopy(item.id, item.url, e)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                title="Sao chép link này"
              >
                {copiedId === item.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Xóa mục này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="text-blue-600 p-1 group-hover:translate-x-0.5 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
