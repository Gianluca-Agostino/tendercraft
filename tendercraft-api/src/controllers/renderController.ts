import type { Request, Response, NextFunction } from 'express';
import { getPrediction, downloadOutput } from '../services/fluxGenerate.js';
import { saveRender, renderExists } from '../utils/storage.js';
import type { RenderResult } from '../types/index.js';

function paramStr(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

export async function renderController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = paramStr(req.params.id);

    if (!id) {
      res.status(400).json({ success: false, error: 'Missing render id' });
      return;
    }

    // Check if we already have it locally
    if (renderExists(id)) {
      const result: Partial<RenderResult> = {
        id,
        status: 'completed',
        image_url: `/api/render/${id}/image`,
        completed_at: new Date().toISOString(),
      };
      res.json({ success: true, data: result });
      return;
    }

    // Poll Replicate for status
    const prediction = await getPrediction(id);

    if (prediction.status === 'failed') {
      const result: Partial<RenderResult> = {
        id,
        status: 'failed',
        error: prediction.error || 'Generation failed',
      };
      res.json({ success: true, data: result });
      return;
    }

    if (prediction.status === 'succeeded' && prediction.output) {
      // Download and save locally
      const outputUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;

      const imageBuffer = await downloadOutput(outputUrl);
      saveRender(id, imageBuffer);

      const result: Partial<RenderResult> = {
        id,
        status: 'completed',
        image_url: `/api/render/${id}/image`,
        completed_at: new Date().toISOString(),
      };
      res.json({ success: true, data: result });
      return;
    }

    // Still processing
    const statusMap: Record<string, RenderResult['status']> = {
      starting: 'pending',
      processing: 'processing',
    };
    const result: Partial<RenderResult> = {
      id,
      status: statusMap[prediction.status] || 'processing',
    };
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * Serve the actual image file for a completed render.
 */
export async function renderImageController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = paramStr(req.params.id);

    if (!renderExists(id)) {
      res.status(404).json({ success: false, error: 'Render not found' });
      return;
    }

    const path = `renders/${id}.png`;
    res.sendFile(path, { root: '.' });
  } catch (err) {
    next(err);
  }
}
