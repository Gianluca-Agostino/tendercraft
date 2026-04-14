import { fal } from '@fal-ai/client';
import fs from 'fs';
import { env } from '../config/env.js';

fal.config({ credentials: env.FAL_KEY });

interface GenerateWithTemplateParams {
  prompt: string;
  cannyImagePath: string;
  yachtImageBase64: string;
  width: number;
  height: number;
}

interface FalImageResult {
  images?: Array<{ url: string }>;
}

/**
 * Parse a data URI or raw base64 string into a Blob.
 */
function base64ToBlob(input: string, defaultType = 'image/jpeg'): Blob {
  let mime = defaultType;
  let base64 = input;
  if (input.startsWith('data:')) {
    const match = input.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      mime = match[1];
      base64 = match[2];
    }
  }
  const buffer = Buffer.from(base64, 'base64');
  return new Blob([buffer], { type: mime });
}

/**
 * Generate a tender render using fal.ai flux-general with:
 * - ControlNet Union (Canny from template) → locks shape
 * - IP-Adapter (yacht photo) → transfers style
 * - Prompt → guides colors, materials, details
 */
export async function generateWithTemplate(
  params: GenerateWithTemplateParams,
): Promise<string> {
  const { prompt, cannyImagePath, yachtImageBase64, width, height } = params;

  // Upload Canny + yacht to fal storage → get URLs (avoids huge request payloads)
  const uploadStart = Date.now();
  console.log('[fal.ai] Uploading images to fal storage...');

  const cannyBuffer = fs.readFileSync(cannyImagePath);
  const cannyBlob = new Blob([cannyBuffer], { type: 'image/png' });
  const yachtBlob = base64ToBlob(yachtImageBase64);

  const [cannyUrl, yachtUrl] = await Promise.all([
    fal.storage.upload(cannyBlob),
    fal.storage.upload(yachtBlob),
  ]);
  console.log(`[fal.ai] Uploaded in ${Date.now() - uploadStart}ms`);

  const start = Date.now();
  console.log('[fal.ai] Generating with ControlNet Union + IP-Adapter...');

  const result = await fal.subscribe('fal-ai/flux-general', {
    input: {
      prompt,
      image_size: { width, height },
      num_images: 1,
      output_format: 'png',
      guidance_scale: 7.5,
      num_inference_steps: 28,
      controlnet_unions: [
        {
          path: 'Shakker-Labs/FLUX.1-dev-ControlNet-Union-Pro',
          controls: [
            {
              control_image_url: cannyUrl,
              control_mode: 'canny',
              conditioning_scale: 0.75,
            },
          ],
        },
      ],
      ip_adapters: [
        {
          path: 'XLabs-AI/flux-ip-adapter',
          ip_adapter_image_url: yachtUrl,
          scale: 0.35,
        },
      ],
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        const msgs = (update.logs || []).map((l) => l.message).join(', ');
        if (msgs) console.log(`[fal.ai] Progress: ${msgs}`);
      }
    },
  });

  const duration = Date.now() - start;
  console.log(`[fal.ai] Done in ${duration}ms`);

  const data = result.data as FalImageResult;
  const imageUrl = data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('No image in fal.ai response');

  return imageUrl;
}
