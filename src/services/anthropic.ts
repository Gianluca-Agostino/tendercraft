import type { YachtAnalysis } from '../types';

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string;

const ANALYSIS_PROMPT = `You are a luxury yacht design expert. Analyze this yacht image and respond ONLY with a JSON object (no markdown, no backticks, no preamble). The JSON must have exactly these fields:

{
  "yacht_name": "Identified model or best guess, e.g. 'Azimut Grande 35 Metri'",
  "design_style": "2-3 word style label, e.g. 'Italian Minimalist', 'British Classic', 'Scandinavian Modern'",
  "style_description": "One sentence describing the overall design philosophy",
  "colors": [
    {"hex": "#XXXXXX", "name": "Color name", "usage": "Where on the yacht"}
  ],
  "materials": ["material1", "material2"],
  "hull_character": "One sentence about hull lines and shape",
  "tender_prompt": "A detailed 2-3 sentence prompt for an AI image generator to create a matching tender/dinghy that harmonizes with this yacht's design language. Include specific colors (hex codes), materials, hull shape, and style cues. The prompt should start with: A photorealistic render of a luxury yacht tender..."
}

Return 3-5 colors. Be specific and detailed.`;

export async function analyzeYachtImage(
  base64: string,
  mediaType: string,
): Promise<YachtAnalysis> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: ANALYSIS_PROMPT },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content?.map((b: { text?: string }) => b.text || '').join('') || '';
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as YachtAnalysis;
}
