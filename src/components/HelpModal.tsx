import React from 'react';
import { X, CheckCircle2, AlertCircle, Smartphone, Printer, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Hướng dẫn & Mẹo in ấn mã QR
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-600">
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100/80">
            <div className="font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
              <Smartphone className="w-4 h-4 text-blue-600" /> Cách quét mã QR
            </div>
            <p className="text-blue-800 text-xs">
              Mở camera trên iPhone hoặc điện thoại Android (hoặc app Zalo/Google Lens), hướng thẳng vào mã QR trên màn hình hoặc bản in để mở đường link ngay.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Printer className="w-4 h-4 text-slate-600" /> Mẹo khi in mã QR cho quán, cửa hàng
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Độ tương phản:</strong> Nét mã QR nên có màu tối (đen, xanh đậm) trên nền sáng (trắng, be nhẹ) để máy quét nhận diện dễ nhất.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Kích thước in tối thiểu:</strong> Với menu để bàn hoặc danh thiếp, kích thước mã QR nên từ <strong>2.5 x 2.5 cm</strong> trở lên.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Chọn định dạng:</strong> Dùng file <strong>PNG (HD 1024p hoặc 4K)</strong> cho in ảnh thông thường, hoặc <strong>Vector SVG</strong> để gửi xưởng in ấn kích thước lớn.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Luôn quét thử trước:</strong> Trước khi in số lượng lớn, hãy in thử 1 bản mẫu và quét bằng ít nhất 2 dòng điện thoại khác nhau.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
