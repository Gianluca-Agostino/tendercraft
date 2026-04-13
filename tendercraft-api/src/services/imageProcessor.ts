import sharp from 'sharp';
import type { MaskArea } from '../types/index.js';

/**
 * Resize an image so its longest side is at most `maxDim` pixels.
 * Returns the resized buffer as PNG.
 */
export async function resizeForAnalysis(
  inputPath: string,
  maxDim: number = 1500,
): Promise<Buffer> {
  const metadata = await sharp(inputPath).metadata();
  const { width = 0, height = 0 } = metadata;

  const longest = Math.max(width, height);
  if (longest <= maxDim) {
    return sharp(inputPath).png().toBuffer();
  }

  return sharp(inputPath)
    .resize({
      width: width >= height ? maxDim : undefined,
      height: height > width ? maxDim : undefined,
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();
}

/**
 * Get image dimensions from a file path.
 */
export async function getImageDimensions(
  inputPath: string,
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(inputPath).metadata();
  return { width: metadata.width || 0, height: metadata.height || 0 };
}

/**
 * Generate a black/white mask for Flux Fill inpainting.
 * White = area to edit, Black = area to preserve.
 */
export async function generateMask(
  width: number,
  height: number,
  area: MaskArea,
): Promise<Buffer> {
  const regions: Record<MaskArea, [number, number, number, number]> = {
    hull: [0, Math.floor(height * 0.6), width, Math.floor(height * 0.4)],
    cabin: [
      Math.floor(width * 0.3),
      Math.floor(height * 0.3),
      Math.floor(width * 0.4),
      Math.floor(height * 0.3),
    ],
    stern: [Math.floor(width * 0.7), 0, Math.floor(width * 0.3), height],
    deck: [0, Math.floor(height * 0.4), width, Math.floor(height * 0.15)],
    full: [0, 0, width, height],
  };

  const [left, top, w, h] = regions[area];

  const whiteRect = await sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .png()
    .toBuffer();

  const mask = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite([{ input: whiteRect, left, top }])
    .png()
    .toBuffer();

  return mask;
}

/**
 * Convert an image buffer to base64 data URI.
 */
export function bufferToBase64(buffer: Buffer, mediaType: string = 'image/png'): string {
  return `data:${mediaType};base64,${buffer.toString('base64')}`;
}
