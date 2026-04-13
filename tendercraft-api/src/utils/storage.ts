import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = 'uploads';
const RENDERS_DIR = 'renders';
const UPLOADS_MAX_AGE_MS = 60 * 60 * 1000;       // 1 hour
const RENDERS_MAX_AGE_MS = 24 * 60 * 60 * 1000;  // 24 hours
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;       // 30 minutes

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getUploadPath(filename: string): string {
  ensureDir(UPLOADS_DIR);
  return path.join(UPLOADS_DIR, filename);
}

export function getRenderPath(id: string): string {
  ensureDir(RENDERS_DIR);
  return path.join(RENDERS_DIR, `${id}.png`);
}

export function renderExists(id: string): boolean {
  return fs.existsSync(getRenderPath(id));
}

export function saveRender(id: string, buffer: Buffer): string {
  const filepath = getRenderPath(id);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

export function readRender(id: string): Buffer | null {
  const filepath = getRenderPath(id);
  if (!fs.existsSync(filepath)) return null;
  return fs.readFileSync(filepath);
}

function cleanDirectory(dir: string, maxAgeMs: number): void {
  if (!fs.existsSync(dir)) return;
  const now = Date.now();
  for (const file of fs.readdirSync(dir)) {
    const filepath = path.join(dir, file);
    try {
      const stat = fs.statSync(filepath);
      if (now - stat.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filepath);
        console.log(`[CLEANUP] Deleted ${filepath}`);
      }
    } catch {
      // file may have been removed concurrently
    }
  }
}

export function startCleanupScheduler(): void {
  ensureDir(UPLOADS_DIR);
  ensureDir(RENDERS_DIR);

  const cleanup = () => {
    cleanDirectory(UPLOADS_DIR, UPLOADS_MAX_AGE_MS);
    cleanDirectory(RENDERS_DIR, RENDERS_MAX_AGE_MS);
  };

  // Run once at startup, then on interval
  cleanup();
  setInterval(cleanup, CLEANUP_INTERVAL_MS);
  console.log('[STORAGE] Cleanup scheduler started (every 30 min)');
}
