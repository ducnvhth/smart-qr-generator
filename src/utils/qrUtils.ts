import QRCode from 'qrcode';
import { QRConfig } from '../types';

/**
 * Draws the logo at the center of the QR canvas
 */
async function drawCenterLogo(
  ctx: CanvasRenderingContext2D,
  size: number,
  config: QRConfig
): Promise<void> {
  if (config.logo === 'none' && !config.customLogoUrl) return;

  const logoSize = Math.floor(size * 0.22); // 22% of QR size
  const center = size / 2;
  const radius = logoSize / 2;
  const padding = Math.max(4, Math.floor(size * 0.02));
  const badgeRadius = radius + padding;

  // Draw background circle / rounded rectangle for contrast
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, badgeRadius, 0, Math.PI * 2);
  ctx.fillStyle = config.bgColor || '#ffffff';
  ctx.fill();
  ctx.lineWidth = Math.max(2, Math.floor(size * 0.008));
  ctx.strokeStyle = config.fgColor || '#000000';
  ctx.stroke();
  ctx.restore();

  // If custom logo image provided
  if (config.logo === 'custom' && config.customLogoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load custom logo'));
        img.src = config.customLogoUrl!;
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, center - radius, center - radius, logoSize, logoSize);
      ctx.restore();
      return;
    } catch {
      // fallback to default icon if image fails
    }
  }

  // Draw vector icons for predefined options
  drawBuiltinLogo(ctx, center, radius, config.logo, config.fgColor);
}

function drawBuiltinLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  logo: string,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, cy * 0.12);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = cy * 0.5;

  if (logo === 'facebook') {
    // Facebook 'f'
    ctx.fillStyle = '#1877F2';
    ctx.beginPath();
    ctx.arc(cx, cy, cy * 0.85, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(s * 1.8)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('f', cx + s * 0.1, cy + s * 0.15);
  } else if (logo === 'youtube') {
    // YouTube play icon
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.roundRect(cx - s * 1.2, cy - s * 0.8, s * 2.4, s * 1.6, s * 0.4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy - s * 0.5);
    ctx.lineTo(cx + s * 0.5, cy);
    ctx.lineTo(cx - s * 0.3, cy + s * 0.5);
    ctx.closePath();
    ctx.fill();
  } else if (logo === 'zalo') {
    // Zalo badge
    ctx.fillStyle = '#0068FF';
    ctx.beginPath();
    ctx.arc(cx, cy, cy * 0.85, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(s * 0.85)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Zalo', cx, cy);
  } else if (logo === 'tiktok') {
    // TikTok badge
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, cy * 0.85, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#25F4EE';
    ctx.font = `bold ${Math.floor(s * 1.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', cx, cy);
  } else {
    // Default Link / Globe icon
    ctx.beginPath();
    // Link chain glyph
    ctx.arc(cx - s * 0.35, cy, s * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + s * 0.35, cy, s * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.2, cy);
    ctx.lineTo(cx + s * 0.2, cy);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Generates an HTMLCanvasElement with full resolution, styling, optional logo, and optional frame text
 */
export async function generateQRCanvas(
  config: QRConfig,
  targetSize: number = config.downloadSize
): Promise<HTMLCanvasElement> {
  const effectiveErrorCorrection =
    config.logo !== 'none' || config.customLogoUrl
      ? ('H' as const) // Use High error correction when logo is enabled
      : config.errorCorrectionLevel;

  // Base QR size
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, config.url.trim() || 'https://google.com', {
    width: targetSize,
    margin: config.margin,
    color: {
      dark: config.fgColor || '#000000',
      light: config.bgColor || '#ffffff',
    },
    errorCorrectionLevel: effectiveErrorCorrection,
  });

  const ctx = qrCanvas.getContext('2d');
  if (ctx) {
    await drawCenterLogo(ctx, targetSize, config);
  }

  // If no frame is needed, return base QR
  if (!config.includeFrame || !config.frameText.trim()) {
    return qrCanvas;
  }

  // Draw framed card version
  const frameCanvas = document.createElement('canvas');
  const framePadding = Math.floor(targetSize * 0.08);
  const textHeight = Math.floor(targetSize * 0.18);
  const totalWidth = targetSize + framePadding * 2;
  const totalHeight = targetSize + framePadding * 2 + textHeight;

  frameCanvas.width = totalWidth;
  frameCanvas.height = totalHeight;

  const fCtx = frameCanvas.getContext('2d');
  if (!fCtx) return qrCanvas;

  // Frame background
  fCtx.fillStyle = config.bgColor || '#ffffff';
  fCtx.fillRect(0, 0, totalWidth, totalHeight);

  // Border outline
  fCtx.strokeStyle = config.fgColor || '#0f172a';
  fCtx.lineWidth = Math.max(3, Math.floor(targetSize * 0.008));
  fCtx.strokeRect(
    fCtx.lineWidth / 2,
    fCtx.lineWidth / 2,
    totalWidth - fCtx.lineWidth,
    totalHeight - fCtx.lineWidth
  );

  // Draw QR in center
  fCtx.drawImage(qrCanvas, framePadding, framePadding);

  // Draw Frame text
  fCtx.fillStyle = config.fgColor || '#0f172a';
  const fontSize = Math.floor(textHeight * 0.42);
  fCtx.font = `bold ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
  fCtx.textAlign = 'center';
  fCtx.textBaseline = 'middle';
  fCtx.fillText(
    config.frameText.trim(),
    totalWidth / 2,
    framePadding + targetSize + textHeight * 0.5
  );

  return frameCanvas;
}

/**
 * Export to SVG string
 */
export async function generateQRSVG(config: QRConfig): Promise<string> {
  const effectiveErrorCorrection =
    config.logo !== 'none' || config.customLogoUrl
      ? ('H' as const)
      : config.errorCorrectionLevel;

  const svgString = await QRCode.toString(config.url.trim() || 'https://google.com', {
    type: 'svg',
    margin: config.margin,
    color: {
      dark: config.fgColor || '#000000',
      light: config.bgColor || '#ffffff',
    },
    errorCorrectionLevel: effectiveErrorCorrection,
  });

  return svgString;
}

/**
 * Download canvas as PNG file
 */
export async function downloadCanvasAsPNG(
  config: QRConfig,
  fileName: string = 'ma-qr.png'
): Promise<void> {
  const canvas = await generateQRCanvas(config, config.downloadSize);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download SVG file
 */
export async function downloadSVG(
  config: QRConfig,
  fileName: string = 'ma-qr.svg'
): Promise<void> {
  const svgString = await generateQRSVG(config);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy QR image to clipboard
 */
export async function copyQRImageToClipboard(config: QRConfig): Promise<boolean> {
  try {
    const canvas = await generateQRCanvas(config, 1024);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}

/**
 * Format domain display
 */
export function extractDomain(url: string): string {
  try {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
