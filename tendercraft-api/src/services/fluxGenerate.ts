import Replicate from 'replicate';
import { env } from '../config/env.js';

const replicate = new Replicate({ auth: env.REPLICATE_API_TOKEN });

interface FluxPrediction {
  id: string;
  status: string;
  output?: string | string[];
  error?: string;
}

/**
 * Start a Flux 1.1 Pro generation and return the prediction ID.
 */
export async function startGeneration(prompt: string): Promise<string> {
  const start = Date.now();
  console.log(`[FLUX-GEN] Starting generation...`);

  const prediction = (await replicate.predictions.create({
    model: 'black-forest-labs/flux-1.1-pro',
    input: {
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png',
      safety_tolerance: 5,
    },
  })) as FluxPrediction;

  const duration = Date.now() - start;
  console.log(`[FLUX-GEN] Prediction created in ${duration}ms — id=${prediction.id}`);

  return prediction.id;
}

/**
 * Check prediction status. Returns the full prediction object.
 */
export async function getPrediction(
  id: string,
): Promise<FluxPrediction> {
  const prediction = (await replicate.predictions.get(id)) as FluxPrediction;
  return prediction;
}

/**
 * Download image from a Replicate output URL and return it as a Buffer.
 */
export async function downloadOutput(url: string): Promise<Buffer> {
  const start = Date.now();
  console.log(`[FLUX-GEN] Downloading output...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const duration = Date.now() - start;
  console.log(`[FLUX-GEN] Downloaded ${(buffer.length / 1024).toFixed(0)}KB in ${duration}ms`);

  return buffer;
}
