import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LinkInput } from './components/LinkInput';
import { CustomizationPanel } from './components/CustomizationPanel';
import { QRPreview } from './components/QRPreview';
import { HistoryList } from './components/HistoryList';
import { HelpModal } from './components/HelpModal';
import { ScanStatsModal } from './components/ScanStatsModal';
import { TrackingDashboard } from './components/TrackingDashboard';
import { QRConfig, HistoryItem, LogoOption, TrackedLink } from './types';
import { extractDomain } from './utils/qrUtils';
import { BarChart3, PlusCircle, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'qr_generator_history_v1';

export default function App() {
  const [activeView, setActiveView] = useState<'create' | 'dashboard'>('create');

  const [config, setConfig] = useState<QRConfig>({
    url: 'https://google.com',
    trackScans: true, // Enabled by default to count scans
    fgColor: '#000000',
    bgColor: '#ffffff',
    errorCorrectionLevel: 'M',
    margin: 2,
    downloadSize: 1024,
    logo: 'none',
    customLogoUrl: null,
    includeFrame: false,
    frameText: 'QUÉT ĐỂ TRUY CẬP',
  });

  const [allTrackedLinks, setAllTrackedLinks] = useState<TrackedLink[]>([]);
  const [trackedLink, setTrackedLink] = useState<TrackedLink | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [statsModalLink, setStatsModalLink] = useState<TrackedLink | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Fetch all tracked links from server
  const fetchAllLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const data = await res.json();
        setAllTrackedLinks(data);
      }
    } catch (err) {
      console.error('Failed to fetch links:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllLinks();
  }, [fetchAllLinks]);

  // Create or sync tracked link on server whenever URL or trackScans changes
  useEffect(() => {
    if (!config.trackScans || !config.url || !config.url.trim()) {
      return;
    }

    let isCurrent = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalUrl: config.url.trim(),
            title: extractDomain(config.url) || config.url,
            fgColor: config.fgColor,
            bgColor: config.bgColor,
          }),
        });
        if (res.ok && isCurrent) {
          const data: TrackedLink = await res.json();
          setTrackedLink(data);
          fetchAllLinks();
        }
      } catch (err) {
        console.error('Error syncing tracked link:', err);
      }
    }, 300);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [config.url, config.trackScans, config.fgColor, config.bgColor, fetchAllLinks]);

  // Poll for scan updates every 4 seconds to update counters live
  useEffect(() => {
    const interval = setInterval(async () => {
      if (trackedLink?.id) {
        try {
          const res = await fetch(`/api/links/${trackedLink.id}`);
          if (res.ok) {
            const data = await res.json();
            setTrackedLink(data);
            if (statsModalOpen && statsModalLink?.id === data.id) {
              setStatsModalLink(data);
            }
          }
        } catch {
          // ignore
        }
      }
      fetchAllLinks();
    }, 4000);

    return () => clearInterval(interval);
  }, [trackedLink?.id, statsModalOpen, statsModalLink?.id, fetchAllLinks]);

  const handleUpdateConfig = (updated: Partial<QRConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleApplyPresetLogo = (logoType: LogoOption) => {
    setConfig((prev) => ({
      ...prev,
      logo: logoType,
      errorCorrectionLevel: logoType !== 'none' ? 'H' : prev.errorCorrectionLevel,
    }));
  };

  const handleSaveToHistory = () => {
    if (!config.url || !config.url.trim()) return;

    const domain = extractDomain(config.url);
    const title = domain ? `Mã QR cho ${domain}` : config.url;

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.url !== config.url);
      const newItem: HistoryItem = {
        id: trackedLink?.id || Date.now().toString(),
        url: config.url.trim(),
        title,
        createdAt: Date.now(),
        fgColor: config.fgColor,
        bgColor: config.bgColor,
        isDynamic: config.trackScans,
        scanCount: trackedLink?.scanCount || 0,
        shortCode: trackedLink?.shortCode,
      };
      return [newItem, ...filtered].slice(0, 10);
    });
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setConfig((prev) => ({
      ...prev,
      url: item.url,
      fgColor: item.fgColor || prev.fgColor,
      bgColor: item.bgColor || prev.bgColor,
    }));
  };

  const handleOpenStatsModal = (linkToInspect?: TrackedLink) => {
    const target = linkToInspect || trackedLink;
    if (target) {
      setStatsModalLink(target);
      setStatsModalOpen(true);
    }
  };

  const handleResetLinkScans = async (id: string) => {
    try {
      const res = await fetch(`/api/links/${id}/reset`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        if (trackedLink?.id === id) setTrackedLink(updated);
        if (statsModalLink?.id === id) setStatsModalLink(updated);
        fetchAllLinks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllLinks();
        if (trackedLink?.id === id) setTrackedLink(null);
        if (statsModalLink?.id === id) setStatsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const totalScans = allTrackedLinks.reduce(
    (acc, cur) => acc + (cur.scanCount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header
        activeView={activeView}
        onChangeView={setActiveView}
        totalTrackedLinks={allTrackedLinks.length}
        totalScans={totalScans}
        onOpenHelp={() => setShowHelp(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Banner for Easy Discovery */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                id="btn-view-creator"
                onClick={() => setActiveView('create')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'create'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>1. Tạo mã QR</span>
              </button>

              <button
                type="button"
                id="btn-view-dashboard"
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'dashboard'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>2. Bảng theo dõi lượt quét ({allTrackedLinks.length})</span>
                {totalScans > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                    {totalScans} quét
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            {activeView === 'create' ? (
              <button
                type="button"
                onClick={() => setActiveView('dashboard')}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Xem danh sách & thống kê lượt quét tất cả mã</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveView('create')}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span aria-hidden="true">&larr;</span>
                <span>Quay lại trang tạo mã QR</span>
              </button>
            )}
          </div>
        </div>

        {/* VIEW 1: CREATE QR VIEW */}
        {activeView === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Input + Customizer + History (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <LinkInput
                trackScans={config.trackScans}
                onToggleTrackScans={(val) => handleUpdateConfig({ trackScans: val })}
                scanCount={trackedLink?.scanCount || 0}
                url={config.url}
                onChangeUrl={(newUrl) => handleUpdateConfig({ url: newUrl })}
                onApplyPresetLogo={handleApplyPresetLogo}
              />

              <CustomizationPanel
                config={config}
                onChange={handleUpdateConfig}
              />

              <HistoryList
                history={history}
                onSelect={handleSelectHistoryItem}
                onOpenStatsItem={(item) => {
                  const matched = allTrackedLinks.find(
                    (l) => l.id === item.id || l.shortCode === item.shortCode
                  );
                  handleOpenStatsModal(matched || (item as TrackedLink));
                }}
                onClear={handleClearHistory}
                onRemoveItem={handleRemoveHistoryItem}
              />
            </div>

            {/* Right Column: Live QR Preview + Download Panel (5 cols) */}
            <div className="lg:col-span-5">
              <QRPreview
                config={config}
                trackedLink={trackedLink}
                onSaveToHistory={handleSaveToHistory}
                onOpenStats={() => handleOpenStatsModal(trackedLink || undefined)}
                onRefreshStats={fetchAllLinks}
                onTestScan={() => {
                  if (trackedLink) {
                    const redirectUrl = `${window.location.origin}/r/${trackedLink.shortCode}`;
                    window.open(redirectUrl, '_blank');
                    setTimeout(() => {
                      fetchAllLinks();
                    }, 1200);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: TRACKING DASHBOARD VIEW */}
        {activeView === 'dashboard' && (
          <TrackingDashboard
            links={allTrackedLinks}
            onRefresh={fetchAllLinks}
            onOpenDetail={handleOpenStatsModal}
            onReset={handleResetLinkScans}
            onDelete={handleDeleteLink}
            onSwitchToCreate={() => setActiveView('create')}
          />
        )}
      </main>

      {/* Clean minimal footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Tạo mã QR từ liên kết nhanh chóng, bảo mật và trực tiếp trên trình duyệt.</span>
          <span className="text-slate-400">
            Hỗ trợ đếm lượt quét thời gian thực & bảo toàn chất lượng in ấn.
          </span>
        </div>
      </footer>

      {/* Analytics Modal */}
      <ScanStatsModal
        isOpen={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        link={statsModalLink || trackedLink}
        onRefresh={fetchAllLinks}
        onReset={handleResetLinkScans}
      />

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
