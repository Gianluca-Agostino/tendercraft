import type { YachtAnalysis, GenerateOptions } from '../types/index.js';

export function buildFluxPrompt(
  analysis: YachtAnalysis,
  options?: GenerateOptions,
): string {
  let prompt = analysis.tender_prompt;

  if (options?.cabin === false) {
    prompt +=
      ' The tender is an open boat without a cabin, with a center console helm station.';
  }

  switch (options?.stern_style) {
    case 'open':
      prompt += ' Open stern with a teak swim platform.';
      break;
    case 'platform':
      prompt += ' Extended stern platform with integrated steps to the water.';
      break;
  }

  switch (options?.size) {
    case 'small':
      prompt += ' Compact 3-meter tender for 2-3 passengers.';
      break;
    case 'large':
      prompt += ' Spacious 6-meter tender with generous seating for 8 passengers.';
      break;
    default:
      prompt += ' Medium 4.5-meter tender for 4-5 passengers.';
  }

  if (options?.custom_instructions) {
    prompt += ` Additional details: ${options.custom_instructions}`;
  }

  // Quality suffix — always appended
  prompt +=
    ' 3/4 aerial perspective view from slightly above. The boat is on dark deep ocean water at night. Dramatic cinematic lighting. Pure solid black background (#000000). Landscape 16:9. Ultra high quality, 8K product render. No text, no watermarks.';

  return prompt;
}
