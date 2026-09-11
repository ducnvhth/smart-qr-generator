import React from 'react';
import { QrCode, Sparkles, HelpCircle, BarChart3, PlusCircle } from 'lucide-react';

interface HeaderProps {
  activeView: 'create' | 'dashboard';
  onChangeView: (view: 'create' | 'dashboard') => void;
  totalTrackedLinks: number;
  totalScans: number;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onChangeView,
  totalTrackedLinks,
  totalScans,
  onOpenHelp,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div
          onClick={() => onChangeView('create')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Tạo Mã QR từ Link
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                <Sparkles className="w-3 h-3 text-blue-600" /> Tự động đếm
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Tạo mã QR tùy biến & theo dõi lượt quét thời gian thực
            </p>
          </div>
        </div>

        {/* Center / Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            id="tab-create-qr"
            onClick={() => onChangeView('create')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'create'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo mã QR</span>
          </button>

          <button
            type="button"
            id="tab-tracking-dashboard"
            onClick={() => onChangeView('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Bảng theo dõi</span>
            {totalScans > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                {totalScans}
              </span>
            )}
          </button>
        </div>

        {/* Right Help Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-help"
            onClick={onOpenHelp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Mẹo in ấn</span>
          </button>
        </div>
      </div>
    </header>
  );
};

