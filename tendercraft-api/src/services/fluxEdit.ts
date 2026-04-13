import Replicate from 'replicate';
import { env } from '../config/env.js';
import { bufferToBase64 } from './imageProcessor.js';

const replicate = new Replicate({ auth: env.REPLICATE_API_TOKEN });

interface FluxFillPrediction {
  id: string;
  status: string;
  output?: string | string[];
  error?: string;
}

/**
 * Start a Flux Fill Pro inpainting edit and return the prediction ID.
 */
export async function startEdit(
  imageBuffer: Buffer,
  maskBuffer: Buffer,
  prompt: string,
): Promise<string> {
  const start = Date.now();
  console.log(`[FLUX-EDIT] Starting inpainting edit...`);

  const imageUri = bufferToBase64(imageBuffer, 'image/png');
  const maskUri = bufferToBase64(maskBuffer, 'image/png');

  const prediction = (await replicate.predictions.create({
    model: 'black-forest-labs/flux-fill-pro',
    input: {
      image: imageUri,
      mask: maskUri,
      prompt,
      output_format: 'png',
      safety_tolerance: 5,
    },
  })) as FluxFillPrediction;

  const duration = Date.now() - start;
  console.log(`[FLUX-EDIT] Prediction created in ${duration}ms — id=${prediction.id}`);

  return prediction.id;
}
