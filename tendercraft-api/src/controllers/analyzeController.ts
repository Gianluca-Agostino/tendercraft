import type { Request, Response, NextFunction } from 'express';
import { resizeForAnalysis } from '../services/imageProcessor.js';
import { analyzeYachtImage } from '../services/claudeVision.js';
import fs from 'fs';

export async function analyzeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'No image file provided' });
      return;
    }

    // Resize for Claude Vision (max 1500px longest side)
    const resizedBuffer = await resizeForAnalysis(file.path, 1500);

    // resizeForAnalysis always outputs PNG
    const analysis = await analyzeYachtImage(resizedBuffer, 'image/png');

    // Cleanup uploaded file
    fs.unlink(file.path, () => {});

    res.json({ success: true, data: { analysis } });
  } catch (err) {
    next(err);
  }
}
