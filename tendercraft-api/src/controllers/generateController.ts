import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { buildFluxPrompt } from '../services/promptBuilder.js';
import { selectTemplate } from '../services/templateSelector.js';
import { generateWithTemplate } from '../services/falGenerate.js';
import { downloadOutput } from '../services/fluxGenerate.js';
import { saveRender } from '../utils/storage.js';
import type { GenerateRequest } from '../types/index.js';

export async function generateController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as GenerateRequest;

    if (!body.analysis || !body.analysis.tender_prompt) {
      res.status(400).json({
        success: false,
        error: 'Missing analysis data. Run /api/analyze first.',
      });
      return;
    }

    if (!body.yachtImageBase64) {
      res.status(400).json({
        success: false,
        error: 'Missing yachtImageBase64 — the original yacht photo is required for style transfer.',
      });
      return;
    }

    // 1. Select template based on options
    const size = body.options?.size || 'medium';
    const cabin = body.options?.cabin !== false;
    const stern = body.options?.stern_style || 'open';
    const template = selectTemplate(size, cabin, stern);
    console.log(`[Generate] Template selected: ${template.id} (${template.width}x${template.height})`);

    // 2. Build creative prompt via Claude
    const prompt = await buildFluxPrompt(body.analysis, body.options);

    // 3. Generate with fal.ai (ControlNet + IP-Adapter)
    const imageUrl = await generateWithTemplate({
      prompt,
      cannyImagePath: template.cannyImagePath,
      yachtImageBase64: body.yachtImageBase64,
      width: template.width,
      height: template.height,
    });

    // 4. Download and save locally
    const buffer = await downloadOutput(imageUrl);
    const renderId = crypto.randomUUID();
    saveRender(renderId, buffer);
    console.log(`[Generate] Saved render ${renderId}`);

    // 5. Sync response — no polling needed
    res.json({
      success: true,
      data: {
        render_id: renderId,
        status: 'completed',
        image_url: `/api/render/${renderId}/image`,
        template_used: template.id,
        prompt_used: prompt,
      },
    });
  } catch (err) {
    next(err);
  }
}
