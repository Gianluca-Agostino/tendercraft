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
 * Generate a tender render using fal.ai flux-general with:
 * - ControlNet Union (Canny from template) → locks shape
 * - IP-Adapter (yacht photo) → transfers style
 * - Prompt → guides colors, materials, details
 */
export async function generateWithTemplate(
  params: GenerateWithTemplateParams,
): Promise<string> {
  const { prompt, cannyImagePath, yachtImageBase64, width, height } = params;

  const cannyBuffer = fs.readFileSync(cannyImagePath);
  const cannyDataUri = `data:image/png;base64,${cannyBuffer.toString('base64')}`;

  const yachtDataUri = yachtImageBase64.startsWith('data:')
    ? yachtImageBase64
    : `data:image/jpeg;base64,${yachtImageBase64}`;

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
              control_image_url: cannyDataUri,
              control_mode: 'canny',
              conditioning_scale: 0.75,
            },
          ],
        },
      ],
      ip_adapters: [
        {
          path: 'XLabs-AI/flux-ip-adapter',
          ip_adapter_image_url: yachtDataUri,
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
