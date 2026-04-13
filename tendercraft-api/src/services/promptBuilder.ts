import type { YachtAnalysis, GenerateOptions } from '../types/index.js';

export function buildFluxPrompt(
  analysis: YachtAnalysis,
  options?: GenerateOptions,
): string {
  // 1. BASE: definizione chiara di TENDER
  let prompt =
    'A photorealistic product render of a small luxury yacht TENDER boat (NOT a yacht).';

  // 2. PROPORZIONI CRITICHE in base alla taglia
  switch (options?.size) {
    case 'small':
      prompt +=
        ' The tender is a compact 3-meter boat, roughly the size of a car. It seats 2-3 people maximum. Very small and intimate.';
      break;
    case 'large':
      prompt +=
        ' The tender is a 6.5-meter luxury day boat, about the length of a large SUV limousine. It seats 6-8 people.';
      break;
    default:
      prompt +=
        ' The tender is a 4.5-meter boat, about the length of a minivan. It seats 4-5 people.';
      break;
  }

  // 3. TIPO DI TENDER
  prompt +=
    ' Hard hull tender with rigid fiberglass construction (NOT an inflatable, NOT a RIB, NO rubber tubes).';

  // 4. DESIGN dalla analisi yacht
  prompt += ` Design style: ${analysis.design_style}.`;
  prompt += ` ${analysis.style_description}`;

  // 5. COLORI specifici dall'analisi
  if (analysis.colors && analysis.colors.length > 0) {
    const hullColor =
      analysis.colors.find(
        (c) =>
          c.usage.toLowerCase().includes('hull') || c.usage.toLowerCase().includes('body'),
      ) || analysis.colors[0];

    const accentColor =
      analysis.colors.find(
        (c) =>
          c.usage.toLowerCase().includes('accent') ||
          c.usage.toLowerCase().includes('stripe'),
      ) || analysis.colors[1];

    const deckColor = analysis.colors.find(
      (c) =>
        c.usage.toLowerCase().includes('deck') || c.usage.toLowerCase().includes('teak'),
    );

    prompt += ` Hull color: ${hullColor.name} (${hullColor.hex}).`;
    if (accentColor) prompt += ` Accent/waterline stripe: ${accentColor.name} (${accentColor.hex}).`;
    if (deckColor) prompt += ` Deck: ${deckColor.name} (${deckColor.hex}).`;
  }

  // 6. MATERIALI dall'analisi
  if (analysis.materials && analysis.materials.length > 0) {
    prompt += ` Materials: ${analysis.materials.join(', ')}.`;
  }

  // 7. SCAFO dall'analisi
  if (analysis.hull_character) {
    prompt += ` Hull character adapted to tender scale: ${analysis.hull_character}`;
  }

  // 8. OPZIONE CABINA
  if (options?.cabin === false) {
    prompt +=
      ' Open boat layout with a compact center console helm station, single steering wheel, no cabin, no roof. Low profile.';
  } else {
    prompt +=
      " Small enclosed pilot house with windshield, proportional to the tender's compact size. The cabin is much smaller relative to the boat than on a full yacht.";
  }

  // 9. OPZIONE POPPA
  switch (options?.stern_style) {
    case 'open':
      prompt += ' Open stern with a small teak swim platform and chrome boarding ladder.';
      break;
    case 'platform':
      prompt += ' Extended stern platform with integrated steps to the water, teak-laid.';
      break;
    default:
      prompt += ' Clean enclosed stern with integrated storage.';
      break;
  }

  // 10. ISTRUZIONI CUSTOM
  if (options?.custom_instructions) {
    prompt += ` Additional details: ${options.custom_instructions}`;
  }

  // 11. SPECIFICHE PROPORZIONI — CRITICHE
  prompt +=
    ' IMPORTANT PROPORTIONS: This is a SMALL tender boat, not a full-size yacht. The beam (width) should be roughly 40% of the length. The freeboard (hull height above water) should be low, about 50-70cm. The boat sits LOW in the water. There should be NO flybridge, NO multiple decks, NO large superstructure.';

  // 12. CAMERA E LIGHTING
  prompt +=
    ' 3/4 aerial perspective view from slightly above and to the side. The tender is floating on dark deep ocean water. Dramatic cinematic lighting with warm golden reflections on the hull. Dark moody background. Landscape 16:9 composition. Ultra high quality, 8K product photography style. No text, no watermarks, no people.';

  return prompt;
}
