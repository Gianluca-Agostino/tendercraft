import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import type { YachtAnalysis } from '../types/index.js';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const ANALYSIS_PROMPT = `You are a luxury yacht design expert and naval architect. Analyze this yacht image with extreme attention to design details. Respond ONLY with a JSON object (no markdown, no backticks).
{
  "yacht_name": "Identified model or best guess, e.g. 'Azimut Grande 35 Metri'",
  "design_style": "2-3 word style label, e.g. 'Italian Minimalist', 'British Muscular', 'Scandinavian Clean'",
  "style_description": "One detailed sentence describing the overall design philosophy — what makes this yacht's design distinctive and recognizable",
  "colors": [
    {"hex": "#XXXXXX", "name": "Color name", "usage": "Exactly where on the yacht this color appears and how it's used"}
  ],
  "materials": ["Be specific: not just 'wood' but 'natural teak with visible grain', not just 'metal' but 'brushed stainless steel fittings'"],
  "hull_character": "Detailed description of the hull shape, lines, and character — describe the bow angle, the chine type, the stern shape, whether lines are aggressive or flowing, the flare, the tumblehome, any distinctive design signatures of this builder",
  "tender_prompt": "Describe in detail how the design DNA of this yacht would translate to a small 4-5 meter tender boat. How would the hull lines scale down? What design signatures would carry over? How would the color scheme adapt? What materials would match? Describe it as if briefing a naval architect who needs to design a matching tender."
}
Return 3-5 colors with SPECIFIC hex codes. Be extremely detailed about design language — a good analysis should let someone recognize the yacht brand just from the description.`;

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
