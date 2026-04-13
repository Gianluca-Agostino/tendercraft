import type { Request, Response, NextFunction } from 'express';
import { buildFluxPrompt } from '../services/promptBuilder.js';
import { startGeneration } from '../services/fluxGenerate.js';
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

    const prompt = buildFluxPrompt(body.analysis, body.options);
    const predictionId = await startGeneration(prompt);

    res.json({
      success: true,
      data: {
        render_id: predictionId,
        status: 'pending',
        prompt_used: prompt,
      },
    });
  } catch (err) {
    next(err);
  }
}
