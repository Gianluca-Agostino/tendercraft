import type { Request, Response, NextFunction } from 'express';
import { readRender, renderExists } from '../utils/storage.js';
import { generateMask, getImageDimensions } from '../services/imageProcessor.js';
import { startEdit } from '../services/fluxEdit.js';
import { getRenderPath } from '../utils/storage.js';
import type { EditRequest, MaskArea } from '../types/index.js';

export async function editController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as EditRequest;

    if (!body.render_id) {
      res.status(400).json({ success: false, error: 'Missing render_id' });
      return;
    }

    if (!renderExists(body.render_id)) {
      res.status(404).json({ success: false, error: 'Render not found. It may have expired.' });
      return;
    }

    const imageBuffer = readRender(body.render_id);
    if (!imageBuffer) {
      res.status(404).json({ success: false, error: 'Could not read render file' });
      return;
    }

    const maskArea: MaskArea = body.mask_area || 'full';
    const renderPath = getRenderPath(body.render_id);
    const { width, height } = await getImageDimensions(renderPath);

    const maskBuffer = await generateMask(width, height, maskArea);

    // Build edit prompt
    let prompt = body.new_prompt || 'A photorealistic luxury yacht tender render.';
    if (body.custom_instructions) {
      prompt += ` ${body.custom_instructions}`;
    }

    const predictionId = await startEdit(imageBuffer, maskBuffer, prompt);

    res.json({
      success: true,
      data: {
        render_id: predictionId,
        status: 'pending',
      },
    });
  } catch (err) {
    next(err);
  }
}
