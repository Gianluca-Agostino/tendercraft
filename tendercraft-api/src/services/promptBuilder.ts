import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import type { YachtAnalysis, GenerateOptions } from '../types/index.js';

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SIZE_DESCRIPTION: Record<NonNullable<GenerateOptions['size']>, string> = {
  small: '3 meters long (about the size of a car), seats 2-3 people',
  medium: '4.5 meters long (about the length of a minivan), seats 4-5 people',
  large:
    '6.5 meters long (about the length of a large SUV limousine), seats 6-8 people',
};

const STERN_DESCRIPTION: Record<NonNullable<GenerateOptions['stern_style']>, string> = {
  open: 'Open stern with a small teak swim platform and chrome boarding ladder',
  closed: 'Clean enclosed stern with integrated storage compartments',
  platform: 'Extended stern platform with integrated steps to the water, teak-laid',
};

/**
 * Two-phase prompt construction:
 * Claude acts as a naval designer, translating yacht DNA into a tender brief
 * that Flux can render. Returns a single-paragraph creative prompt.
 */
export async function buildFluxPrompt(
  analysis: YachtAnalysis,
  options?: GenerateOptions,
): Promise<string> {
  const size = options?.size || 'medium';
  const sizeDesc = SIZE_DESCRIPTION[size];

  const cabinDesc =
    options?.cabin === false
      ? 'OPEN layout — no cabin, no roof, center console helm with single steering wheel, low profile'
      : "Small enclosed pilot house with windshield, proportional to the tender's compact size";

  const sternDesc = STERN_DESCRIPTION[options?.stern_style || 'open'];

  const systemPrompt = `You are a luxury yacht designer writing an image generation prompt. You must translate a yacht's design DNA into a matching tender (small shuttle boat).

Your job: write a SINGLE detailed paragraph prompt for an AI image generator (Flux) that will produce a photorealistic render of a tender that looks like it was designed by the same naval architect as the mother yacht.

CRITICAL RULES:
- A tender is a SMALL boat (${sizeDesc}), NOT a yacht
- It must have NO flybridge, NO multiple decks, NO large superstructure
- The beam (width) is roughly 40% of the length
- The freeboard (hull above water) is low, 50-70cm
- It sits LOW in the water
- The design language, materials, colors, and proportions must feel like a scaled-down sibling of the mother yacht
- Be extremely specific about colors (use hex codes), materials, shapes, and design details
- The prompt must be a single paragraph, no bullet points, no line breaks
- End with: "3/4 aerial perspective view from slightly above. Floating on dark deep ocean water at night. Dramatic cinematic lighting with warm golden reflections. Dark background. 16:9 landscape. 8K product photography. No text, no watermarks, no people."`;

  const userPrompt = `Here is the analysis of the mother yacht:

YACHT: ${analysis.yacht_name}
STYLE: ${analysis.design_style}
DESCRIPTION: ${analysis.style_description}
HULL: ${analysis.hull_character}
COLORS:
${analysis.colors.map((c) => `- ${c.hex} ${c.name} — used for: ${c.usage}`).join('\n')}
MATERIALS: ${analysis.materials.join(', ')}

TENDER SPECIFICATIONS:
- Size: ${sizeDesc}
- Layout: ${cabinDesc}
- Stern: ${sternDesc}
${options?.custom_instructions ? `- Custom requests: ${options.custom_instructions}` : ''}

Write the image generation prompt. Focus heavily on transferring the yacht's design DNA — the hull lines, the way surfaces curve, the material choices, the color relationships, the chrome/wood/paint balance — into tender proportions. The tender should be immediately recognizable as belonging to this yacht.`;

  const start = Date.now();
  console.log('[PromptBuilder] Generating creative prompt via Claude...');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const prompt = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  const duration = Date.now() - start;
  console.log(`[PromptBuilder] Done in ${duration}ms`);
  console.log(`[PromptBuilder] Prompt: ${prompt.substring(0, 200)}...`);

  return prompt;
}
