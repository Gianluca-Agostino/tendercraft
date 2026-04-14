import path from 'path';
import fs from 'fs';
import type { GenerateOptions } from '../types/index.js';

type Size = GenerateOptions['size'];
type Stern = GenerateOptions['stern_style'];

interface TemplateConfig {
  size: Size;
  cabin: boolean;
  stern: Stern;
}

interface TemplateMetadata {
  width: number;
  height: number;
  reference: string;
  canny: string;
}

export interface TemplateSelection {
  id: string;
  cannyImagePath: string;
  referenceImagePath: string;
  width: number;
  height: number;
}

const TEMPLATE_MAP: Record<string, TemplateConfig> = {
  S1: { size: 'small', cabin: false, stern: 'open' },
  S2: { size: 'small', cabin: false, stern: 'platform' },
  S3: { size: 'small', cabin: false, stern: 'closed' },
  M1: { size: 'medium', cabin: false, stern: 'open' },
  M2: { size: 'medium', cabin: false, stern: 'platform' },
  M3: { size: 'medium', cabin: false, stern: 'closed' },
  M4: { size: 'medium', cabin: true, stern: 'open' },
  M5: { size: 'medium', cabin: true, stern: 'platform' },
  M6: { size: 'medium', cabin: true, stern: 'closed' },
  L1: { size: 'large', cabin: false, stern: 'open' },
  L2: { size: 'large', cabin: false, stern: 'platform' },
  L3: { size: 'large', cabin: true, stern: 'open' },
  L4: { size: 'large', cabin: true, stern: 'platform' },
  L5: { size: 'large', cabin: true, stern: 'closed' },
};

const TEMPLATES_DIR = path.join(process.cwd(), 'tender_templates');

let metadataCache: Record<string, TemplateMetadata> | null = null;
function loadMetadata(): Record<string, TemplateMetadata> {
  if (metadataCache) return metadataCache;
  const filepath = path.join(TEMPLATES_DIR, 'templates.json');
  metadataCache = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  return metadataCache!;
}

function buildSelection(id: string): TemplateSelection {
  const meta = loadMetadata()[id];
  if (!meta) {
    throw new Error(`Template metadata not found for id: ${id}`);
  }
  return {
    id,
    cannyImagePath: path.join(TEMPLATES_DIR, 'canny', `${id}_canny.png`),
    referenceImagePath: path.join(TEMPLATES_DIR, 'reference', `${id}.jpg`),
    width: meta.width,
    height: meta.height,
  };
}

/**
 * Pick the best-matching template for the requested size/cabin/stern combo.
 * Falls back progressively: exact → same size+cabin → same size only.
 */
export function selectTemplate(
  size: Size,
  cabin: boolean,
  stern: Stern,
): TemplateSelection {
  // Exact match
  const exact = Object.entries(TEMPLATE_MAP).find(
    ([, c]) => c.size === size && c.cabin === cabin && c.stern === stern,
  );
  if (exact) {
    console.log(`[Template] Exact match: ${exact[0]} (${size}/${cabin}/${stern})`);
    return buildSelection(exact[0]);
  }

  // Fallback 1: size + cabin (any stern)
  const sizeCabinMatch = Object.entries(TEMPLATE_MAP).find(
    ([, c]) => c.size === size && c.cabin === cabin,
  );
  if (sizeCabinMatch) {
    console.log(
      `[Template] Fallback (size+cabin): ${sizeCabinMatch[0]} for ${size}/${cabin}/${stern}`,
    );
    return buildSelection(sizeCabinMatch[0]);
  }

  // Fallback 2: size only
  const sizeMatch = Object.entries(TEMPLATE_MAP).find(([, c]) => c.size === size);
  if (sizeMatch) {
    console.log(`[Template] Fallback (size only): ${sizeMatch[0]} for ${size}`);
    return buildSelection(sizeMatch[0]);
  }

  throw new Error(`No template available for size=${size} cabin=${cabin} stern=${stern}`);
}
