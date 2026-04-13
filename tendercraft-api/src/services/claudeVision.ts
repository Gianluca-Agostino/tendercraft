import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import type { YachtAnalysis } from '../types/index.js';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const ANALYSIS_PROMPT = `You are a luxury yacht design expert. Analyze this yacht image and respond ONLY with a JSON object (no markdown, no backticks). The JSON must have:
{
  "yacht_name": "Identified model or best guess",
  "design_style": "2-3 word style label",
  "style_description": "One sentence describing the design philosophy",
  "colors": [
    {"hex": "#XXXXXX", "name": "Color name", "usage": "Where on the yacht"}
  ],
  "materials": ["material1", "material2"],
  "hull_character": "One sentence about hull lines and shape",
  "tender_prompt": "A detailed 2-3 sentence prompt for generating a matching tender. Start with: A photorealistic render of a luxury yacht tender... Include specific hex colors, materials, hull shape, and style cues."
}
Return 3-5 colors. Be specific and detailed.`;

export async function analyzeYachtImage(
  imageBuffer: Buffer,
  mediaType: string = 'image/png',
): Promise<YachtAnalysis> {
  const start = Date.now();
  console.log(`[CLAUDE] Starting yacht analysis...`);

  const base64 = imageBuffer.toString('base64');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
              data: base64,
            },
          },
          { type: 'text', text: ANALYSIS_PROMPT },
        ],
      },
    ],
  });

  const text = response.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('');

  // Robust JSON parsing — strip markdown fences if present
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  let analysis: YachtAnalysis;
  try {
    analysis = JSON.parse(clean) as YachtAnalysis;
  } catch {
    console.error(`[CLAUDE] JSON parse failed. Raw text:\n${text}`);
    throw new Error('Failed to parse Claude Vision response as JSON');
  }

  const duration = Date.now() - start;
  console.log(`[CLAUDE] Analysis complete in ${duration}ms — ${analysis.yacht_name}`);

  return analysis;
}
