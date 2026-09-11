import React, { useState } from 'react';
import {
  Link as LinkIcon,
  ExternalLink,
  Clipboard,
  X,
  Check,
  Globe,
  Share2,
  MapPin,
  Youtube,
  MessageCircle,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { extractDomain } from '../utils/qrUtils';

interface LinkInputProps {
  url: string;
  onChangeUrl: (url: string) => void;
  onApplyPresetLogo?: (
    logoType: 'none' | 'facebook' | 'zalo' | 'youtube' | 'tiktok' | 'link'
  ) => void;
  trackScans?: boolean;
  onToggleTrackScans?: (val: boolean) => void;
  scanCount?: number;
}

const PRESETS = [
  {
    id: 'web',
    name: 'Website / Link bất kỳ',
    icon: Globe,
    prefix: 'https://',
    example: 'https://vnexpress.net',
    logo: 'link' as const,
  },
  {
    id: 'zalo',
    name: 'Zalo cá nhân / Nhóm',
    icon: MessageCircle,
    prefix: 'https://zalo.me/',
    example: 'https://zalo.me/0912345678',
    logo: 'zalo' as const,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Share2,
    prefix: 'https://facebook.com/',
    example: 'https://facebook.com/zuck',
    logo: 'facebook' as const,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    prefix: 'https://youtube.com/',
    example: 'https://youtube.com/@TED',
    logo: 'youtube' as const,
  },
  {
    id: 'maps',
    name: 'Google Maps',
    icon: MapPin,
    prefix: 'https://maps.google.com/?q=',
    example: 'https://maps.google.com/?q=Hanoi',
    logo: 'link' as const,
  },
];

export const LinkInput: React.FC<LinkInputProps> = ({
  url,
  onChangeUrl,
  onApplyPresetLogo,
  trackScans = true,
  onToggleTrackScans,
  scanCount = 0,
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);
  const domain = extractDomain(url);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeUrl(text.trim());
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    onChangeUrl('');
  };

  const handleTestLink = () => {
    if (!url.trim()) return;
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const handleSelectPreset = (preset: (typeof PRESETS)[0]) => {
    if (!url || url === 'https://example.com' || url === 'https://google.com') {
      onChangeUrl(preset.example);
    } else if (!url.startsWith(preset.prefix) && !url.includes(preset.id)) {
      onChangeUrl(preset.example);
    }
    if (onApplyPresetLogo) {
      onApplyPresetLogo(preset.logo);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <label
          htmlFor="qr-link-input"
          className="text-sm font-bold text-slate-800 flex items-center gap-2"
        >
          <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
            1
          </span>
          Nhập đường dẫn (Link / URL) cần tạo mã
        </label>
        {url.trim() && (
          <button
            type="button"
            onClick={handleTestLink}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
            title="Mở tab mới để thử đường dẫn này"
          >
            <span>Thử mở link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Input container */}
      <div className="relative flex items-center rounded-xl border-2 border-slate-200 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 bg-slate-50/50 transition-all">
        <div className="pl-3.5 pr-2 text-slate-400">
          <LinkIcon className="w-5 h-5" />
        </div>
        <input
          id="qr-link-input"
          type="url"
          value={url}
          onChange={(e) => onChangeUrl(e.target.value)}
          placeholder="Dán link vào đây, ví dụ: https://mywebsite.com"
          className="w-full py-3.5 px-1 bg-transparent text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
          autoFocus
        />

        <div className="flex items-center gap-1.5 pr-2">
          {url && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Xóa link"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            id="btn-paste-link"
            onClick={handlePaste}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Dán từ bộ nhớ tạm"
          >
            {copiedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Đã dán</span>
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                <span>Dán</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Domain verification badge */}
      {domain && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Đích đến:</span>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              {domain}
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">{url.length} ký tự</span>
        </div>
      )}

      {/* Dynamic Scan Counting Toggle Card */}
      <div className="mt-4 p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Theo dõi & Đếm số lượt quét QR
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
                Khuyên dùng
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Tự động đếm mỗi khi người dùng quét bằng điện thoại và lưu vào Bảng theo dõi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onToggleTrackScans && (
            <button
              type="button"
              id="toggle-track-scans"
              onClick={() => onToggleTrackScans(!trackScans)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                trackScans ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  trackScans ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Quick link presets */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-500 mb-2">
          Gợi ý loại link phổ biến:
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isActive = url.includes(preset.id) || (preset.id === 'web' && !url);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
