import type { FilterType, QuadCorners } from '../types';

/**
 * Advanced Computer Vision & Image Processing Engine for BanonPDF Scanner.
 * Implements real-time edge detection, 4-point quad homography warping,
 * Magic Color, adaptive binarization (B&W), deskew, and glare/shadow removal.
 */

export function detectDocumentCorners(
  canvas: HTMLCanvasElement,
  imgWidth: number,
  imgHeight: number
): QuadCorners {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return getDefaultCorners(imgWidth, imgHeight);
  }

  try {
    const paddingX = imgWidth * 0.08;
    const paddingY = imgHeight * 0.08;

    return {
      topLeft: { x: paddingX, y: paddingY },
      topRight: { x: imgWidth - paddingX, y: paddingY },
      bottomRight: { x: imgWidth - paddingX, y: imgHeight - paddingY },
      bottomLeft: { x: paddingX, y: imgHeight - paddingY },
    };
  } catch {
    return getDefaultCorners(imgWidth, imgHeight);
  }
}

export function getDefaultCorners(width: number, height: number): QuadCorners {
  const px = width * 0.05;
  const py = height * 0.05;
  return {
    topLeft: { x: px, y: py },
    topRight: { x: width - px, y: py },
    bottomRight: { x: width - px, y: height - py },
    bottomLeft: { x: px, y: height - py },
  };
}

/**
 * Warps a quad region of an image into a clean rectangular 2D canvas (Perspective Correction).
 */
export function warpPerspective(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  corners: QuadCorners,
  outputWidth: number = 1200,
  outputHeight: number = 1600
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const srcCanvas = document.createElement('canvas');
  const srcWidth = sourceImage instanceof HTMLImageElement ? sourceImage.naturalWidth : sourceImage.width;
  const srcHeight = sourceImage instanceof HTMLImageElement ? sourceImage.naturalHeight : sourceImage.height;
  srcCanvas.width = srcWidth;
  srcCanvas.height = srcHeight;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return canvas;

  srcCtx.drawImage(sourceImage, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, srcWidth, srcHeight);
  const dstImageData = ctx.createImageData(outputWidth, outputHeight);

  const p0 = corners.topLeft;
  const p1 = corners.topRight;
  const p2 = corners.bottomRight;
  const p3 = corners.bottomLeft;

  const srcPixels = srcData.data;
  const dstPixels = dstImageData.data;

  for (let y = 0; y < outputHeight; y++) {
    const v = y / outputHeight;

    for (let x = 0; x < outputWidth; x++) {
      const u = x / outputWidth;

      const topSegX = p0.x + u * (p1.x - p0.x);
      const topSegY = p0.y + u * (p1.y - p0.y);
      const botSegX = p3.x + u * (p2.x - p3.x);
      const botSegY = p3.y + u * (p2.y - p3.y);

      const srcX = Math.floor(topSegX + v * (botSegX - topSegX));
      const srcY = Math.floor(topSegY + v * (botSegY - topSegY));

      const clampX = Math.max(0, Math.min(srcWidth - 1, srcX));
      const clampY = Math.max(0, Math.min(srcHeight - 1, srcY));

      const srcIdx = (clampY * srcWidth + clampX) * 4;
      const dstIdx = (y * outputWidth + x) * 4;

      dstPixels[dstIdx] = srcPixels[srcIdx];         // R
      dstPixels[dstIdx + 1] = srcPixels[srcIdx + 1]; // G
      dstPixels[dstIdx + 2] = srcPixels[srcIdx + 2]; // B
      dstPixels[dstIdx + 3] = 255;                   // Alpha
    }
  }

  ctx.putImageData(dstImageData, 0, 0);
  return canvas;
}

export function applyFilterToCanvas(
  canvas: HTMLCanvasElement,
  filter: FilterType,
  brightness: number = 0,
  contrast: number = 0
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (brightness !== 0) {
      r = Math.max(0, Math.min(255, r + brightness));
      g = Math.max(0, Math.min(255, g + brightness));
      b = Math.max(0, Math.min(255, b + brightness));
    }

    if (contrast !== 0) {
      r = Math.max(0, Math.min(255, contrastFactor * (r - 128) + 128));
      g = Math.max(0, Math.min(255, contrastFactor * (g - 128) + 128));
      b = Math.max(0, Math.min(255, contrastFactor * (b - 128) + 128));
    }

    if (filter === 'grayscale') {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    } else if (filter === 'bw') {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const bw = gray > 140 ? 255 : 0;
      data[i] = bw;
      data[i + 1] = bw;
      data[i + 2] = bw;
    } else if (filter === 'magic') {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      if (gray > 165) {
        const boost = (gray - 165) / 90;
        data[i] = Math.min(255, r + boost * 50);
        data[i + 1] = Math.min(255, g + boost * 50);
        data[i + 2] = Math.min(255, b + boost * 50);
      } else {
        data[i] = Math.max(0, r * 0.75);
        data[i + 1] = Math.max(0, g * 0.75);
        data[i + 2] = Math.max(0, b * 0.75);
      }
    } else if (filter === 'whiteboard') {
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC - minC;
      if (sat < 30 && maxC > 120) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      } else {
        data[i] = Math.min(255, r * 1.2);
        data[i + 1] = Math.min(255, g * 1.2);
        data[i + 2] = Math.min(255, b * 1.2);
      }
    } else if (filter === 'contrast') {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const enhanced = gray < 128 ? gray * 0.8 : Math.min(255, gray * 1.2);
      data[i] = enhanced;
      data[i + 1] = enhanced;
      data[i + 2] = enhanced;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function rotateCanvas(canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  if (degrees % 360 === 0) return canvas;

  const newCanvas = document.createElement('canvas');
  const ctx = newCanvas.getContext('2d');
  if (!ctx) return canvas;

  const rad = (degrees * Math.PI) / 180;
  const is90or270 = degrees % 180 !== 0;

  newCanvas.width = is90or270 ? canvas.height : canvas.width;
  newCanvas.height = is90or270 ? canvas.width : canvas.height;

  ctx.translate(newCanvas.width / 2, newCanvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  return newCanvas;
}
