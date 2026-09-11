import React, { useRef } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Type,
  Sliders,
  Upload,
  X,
  Sparkles,
} from 'lucide-react';
import { QRConfig, LogoOption, ErrorCorrectionLevel } from '../types';

interface CustomizationPanelProps {
  config: QRConfig;
  onChange: (updated: Partial<QRConfig>) => void;
}

const COLOR_PRESETS = [
  { name: 'Đen cổ điển', fg: '#000000', bg: '#ffffff' },
  { name: 'Xanh công nghệ', fg: '#1d4ed8', bg: '#ffffff' },
  { name: 'Xanh lá ngọc', fg: '#047857', bg: '#ffffff' },
  { name: 'Đỏ thắm', fg: '#b91c1c', bg: '#ffffff' },
  { name: 'Tím sang trọng', fg: '#6d28d9', bg: '#ffffff' },
  { name: 'Xanh rêu đậm', fg: '#1e3a8a', bg: '#f8fafc' },
  { name: 'Nâu cà phê', fg: '#451a03', bg: '#fef3c7' },
];

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  config,
  onChange,
}) => {
  const [activeTab, setActiveTab] = React.useState<'color' | 'logo' | 'frame' | 'advanced'>('color');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Vui lòng chọn ảnh logo nhỏ hơn 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onChange({
          logo: 'custom',
          customLogoUrl: reader.result as string,
          errorCorrectionLevel: 'H', // Force high error correction for custom logo
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCustomLogo = () => {
    onChange({
      logo: 'none',
      customLogoUrl: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
            2
          </span>
          <h2 className="text-sm font-bold text-slate-800">
            Tùy biến diện mạo mã QR
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">Tự động cập nhật tức thì</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1 text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('color')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'color'
              ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Màu sắc</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logo')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'logo'
              ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Biểu tượng tâm</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('frame')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'frame'
              ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Khung & Nhãn</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'advanced'
              ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Nâng cao</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {/* COLOR TAB */}
        {activeTab === 'color' && (
          <div className="space-y-4">
            {/* Quick palettes */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Bảng màu gợi ý:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected =
                    config.fgColor === preset.fg && config.bgColor === preset.bg;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        onChange({ fgColor: preset.fg, bgColor: preset.bg })
                      }
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-md border border-slate-300 flex items-center justify-center shrink-0 shadow-2xs"
                        style={{ backgroundColor: preset.bg }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-xs"
                          style={{ backgroundColor: preset.fg }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-700 truncate">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom hex colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Màu nét mã QR:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.fgColor}
                    onChange={(e) => onChange({ fgColor: e.target.value })}
                    className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={config.fgColor}
                    onChange={(e) => onChange({ fgColor: e.target.value })}
                    placeholder="#000000"
                    className="w-full text-xs font-mono uppercase py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Màu nền:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => onChange({ bgColor: e.target.value })}
                    className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={config.bgColor}
                    onChange={(e) => onChange({ bgColor: e.target.value })}
                    placeholder="#ffffff"
                    className="w-full text-xs font-mono uppercase py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGO TAB */}
        {activeTab === 'logo' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500">
              Thêm logo hoặc biểu tượng vào tâm mã QR giúp người quét dễ dàng nhận diện nguồn link.
            </div>

            {/* Preset logos */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Chọn biểu tượng có sẵn:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: 'none', label: 'Không có' },
                  { id: 'link', label: 'Liên kết' },
                  { id: 'zalo', label: 'Zalo' },
                  { id: 'facebook', label: 'Facebook' },
                  { id: 'youtube', label: 'YouTube' },
                  { id: 'tiktok', label: 'TikTok' },
                ].map((item) => {
                  const isSelected = config.logo === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          logo: item.id as LogoOption,
                          customLogoUrl: item.id === 'none' ? null : config.customLogoUrl,
                          errorCorrectionLevel: item.id === 'none' ? config.errorCorrectionLevel : 'H',
                        })
                      }
                      className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Logo Upload */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Hoặc tải lên logo riêng (PNG / JPG / SVG):
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomLogoUpload}
                className="hidden"
                id="custom-logo-input"
              />

              {config.customLogoUrl ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <img
                    src={config.customLogoUrl}
                    alt="Custom Logo"
                    className="w-12 h-12 object-contain rounded-lg bg-white border p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800">
                      Logo tùy chọn đã tải
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Đã tối ưu hóa độ sửa lỗi mức Cao (H)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearCustomLogo}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa logo này"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-slate-600 text-xs font-semibold transition-all"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Chọn tệp ảnh từ máy tính</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* FRAME & CALL TO ACTION */}
        {activeTab === 'frame' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Khung viền kèm chữ kêu gọi hành động (Call To Action)
                </div>
                <div className="text-[11px] text-slate-500">
                  Tạo viền bọc mã QR kèm nhãn chữ phía dưới để tăng tỷ lệ người quét
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeFrame}
                  onChange={(e) => onChange({ includeFrame: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {config.includeFrame && (
              <div className="pt-2 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Nội dung nhãn dưới mã QR:
                  </label>
                  <input
                    type="text"
                    value={config.frameText}
                    onChange={(e) => onChange({ frameText: e.target.value })}
                    placeholder="QUÉT ĐỂ TRUY CẬP"
                    maxLength={30}
                    className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 uppercase"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'QUÉT ĐỂ TRUY CẬP',
                    'SCAN ME',
                    'QUÉT MÃ TẠI ĐÂY',
                    'XEM MENU TẠI ĐÂY',
                    'KẾT NỐI VỚI CHÚNG TÔI',
                  ].map((presetText) => (
                    <button
                      key={presetText}
                      type="button"
                      onClick={() => onChange({ frameText: presetText })}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {presetText}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADVANCED TAB */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Độ sửa lỗi (Error Correction Level):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'L', label: 'L (7%)', desc: 'Nhẹ nhất' },
                  { id: 'M', label: 'M (15%)', desc: 'Tiêu chuẩn' },
                  { id: 'Q', label: 'Q (25%)', desc: 'An toàn' },
                  { id: 'H', label: 'H (30%)', desc: 'Chống rách/Logo' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        errorCorrectionLevel: item.id as ErrorCorrectionLevel,
                      })
                    }
                    className={`p-2 rounded-xl border text-center transition-all ${
                      config.errorCorrectionLevel === item.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Độ rộng lề trắng xung quanh (Quiet Zone):
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {config.margin} ô
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={6}
                step={1}
                value={config.margin}
                onChange={(e) => onChange({ margin: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Sát mép (0)</span>
                <span>Gọn gàng (2)</span>
                <span>Chuẩn máy quét (4)</span>
                <span>Rộng (6)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
