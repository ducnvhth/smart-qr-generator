import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ScanLog {
  id: string;
  timestamp: number;
  userAgent?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  os: string;
  browser: string;
}

interface TrackedLink {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string;
  createdAt: number;
  scanCount: number;
  lastScannedAt: number | null;
  fgColor?: string;
  bgColor?: string;
  scanLogs: ScanLog[];
}

// In-memory data store with seed demo data
const trackedLinks: Map<string, TrackedLink> = new Map();

function detectDeviceInfo(ua: string = '') {
  const uaLower = ua.toLowerCase();
  let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(uaLower)) {
    deviceType = 'tablet';
  } else if (/iphone|ipod|android.*mobile|windows phone|blackberry/i.test(uaLower)) {
    deviceType = 'mobile';
  }

  let os = 'Khác';
  if (/iphone|ipad|ipod/i.test(uaLower)) os = 'iOS (iPhone/iPad)';
  else if (/android/i.test(uaLower)) os = 'Android';
  else if (/windows/i.test(uaLower)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(uaLower)) os = 'macOS';
  else if (/linux/i.test(uaLower)) os = 'Linux';

  let browser = 'Trình duyệt';
  if (/zalo/i.test(uaLower)) browser = 'Zalo App';
  else if (/fbav|fban/i.test(uaLower)) browser = 'Facebook App';
  else if (/chrome|crios/i.test(uaLower)) browser = 'Chrome';
  else if (/safari/i.test(uaLower) && !/chrome/i.test(uaLower)) browser = 'Safari';
  else if (/firefox|fxios/i.test(uaLower)) browser = 'Firefox';
  else if (/edg/i.test(uaLower)) browser = 'Edge';

  return { deviceType, os, browser };
}

// Seed initial default Google link if empty
const defaultSeedId = 'seed-google-demo';
const defaultSeedCode = 'goog-demo';
trackedLinks.set(defaultSeedId, {
  id: defaultSeedId,
  shortCode: defaultSeedCode,
  originalUrl: 'https://google.com',
  title: 'google.com',
  createdAt: Date.now() - 3600000 * 24,
  scanCount: 3,
  lastScannedAt: Date.now() - 3600000 * 2,
  fgColor: '#000000',
  bgColor: '#ffffff',
  scanLogs: [
    {
      id: 'log-1',
      timestamp: Date.now() - 3600000 * 18,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      deviceType: 'mobile',
      os: 'iOS (iPhone/iPad)',
      browser: 'Safari',
    },
    {
      id: 'log-2',
      timestamp: Date.now() - 3600000 * 6,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B)',
      deviceType: 'mobile',
      os: 'Android',
      browser: 'Chrome',
    },
    {
      id: 'log-3',
      timestamp: Date.now() - 3600000 * 2,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      deviceType: 'mobile',
      os: 'iOS (iPhone/iPad)',
      browser: 'Zalo App',
    },
  ],
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Redirection endpoint for QR code scans (/r/:code)
  app.get('/r/:code', (req, res) => {
    const code = req.params.code;
    const link = Array.from(trackedLinks.values()).find((l) => l.shortCode === code);

    if (!link) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="vi">
          <head><meta charset="utf-8"><title>Mã QR không tồn tại</title></head>
          <body style="font-family:sans-serif;text-align:center;padding:50px;">
            <h2>Mã QR hoặc liên kết này không tìm thấy</h2>
            <p>Vui lòng kiểm tra lại liên kết hoặc tạo mã QR mới.</p>
            <a href="/" style="display:inline-block;margin-top:16px;color:#2563eb;">Về trang tạo mã QR</a>
          </body>
        </html>
      `);
    }

    // Record scan event
    const userAgent = req.headers['user-agent'] || '';
    const { deviceType, os, browser } = detectDeviceInfo(userAgent);

    link.scanCount = (link.scanCount || 0) + 1;
    link.lastScannedAt = Date.now();
    link.scanLogs.unshift({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userAgent,
      deviceType,
      os,
      browser,
    });

    // Keep up to 100 recent scan logs per link
    if (link.scanLogs.length > 100) {
      link.scanLogs = link.scanLogs.slice(0, 100);
    }

    // Redirect user to destination link
    return res.redirect(link.originalUrl);
  });

  // API 1: Get all tracked links
  app.get('/api/links', (req, res) => {
    const list = Array.from(trackedLinks.values()).sort(
      (a, b) => b.createdAt - a.createdAt
    );
    res.json(list);
  });

  // API 2: Create or retrieve link for a URL
  app.post('/api/links', (req, res) => {
    const { originalUrl, title, fgColor, bgColor } = req.body;
    if (!originalUrl || typeof originalUrl !== 'string') {
      return res.status(400).json({ error: 'originalUrl is required' });
    }

    const trimmedUrl = originalUrl.trim();

    // Check if an existing link exists for this exact url
    const existing = Array.from(trackedLinks.values()).find(
      (l) => l.originalUrl.toLowerCase() === trimmedUrl.toLowerCase()
    );

    if (existing) {
      if (fgColor) existing.fgColor = fgColor;
      if (bgColor) existing.bgColor = bgColor;
      return res.json(existing);
    }

    // Create unique short code
    const shortCode = crypto.randomBytes(3).toString('hex'); // 6 chars
    const id = crypto.randomUUID();

    const newLink: TrackedLink = {
      id,
      shortCode,
      originalUrl: trimmedUrl,
      title: title || trimmedUrl,
      createdAt: Date.now(),
      scanCount: 0,
      lastScannedAt: null,
      fgColor: fgColor || '#000000',
      bgColor: bgColor || '#ffffff',
      scanLogs: [],
    };

    trackedLinks.set(id, newLink);
    return res.status(201).json(newLink);
  });

  // API 3: Get single link stats
  app.get('/api/links/:identifier', (req, res) => {
    const identifier = req.params.identifier;
    const link =
      trackedLinks.get(identifier) ||
      Array.from(trackedLinks.values()).find((l) => l.shortCode === identifier);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    return res.json(link);
  });

  // API 4: Reset scan counts for a link
  app.post('/api/links/:id/reset', (req, res) => {
    const id = req.params.id;
    const link = trackedLinks.get(id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    link.scanCount = 0;
    link.lastScannedAt = null;
    link.scanLogs = [];
    return res.json(link);
  });

  // API 5: Delete a link
  app.delete('/api/links/:id', (req, res) => {
    const id = req.params.id;
    if (trackedLinks.has(id)) {
      trackedLinks.delete(id);
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'Not found' });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
