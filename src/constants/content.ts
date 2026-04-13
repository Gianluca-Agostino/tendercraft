export const NAV_LINKS = ['Collection', 'Experience', 'Atelier', 'Contact'] as const;

export const PROCESS_STEPS = [
  {
    num: '01',
    icon: '⛵',
    title: 'Upload Your Yacht',
    desc: "Share a photo of your yacht or select from our curated catalogue of the world's finest vessels.",
  },
  {
    num: '02',
    icon: '✦',
    title: 'AI Style Analysis',
    desc: 'Our AI deconstructs the design DNA — hull lines, color palette, material finishes, and aesthetic philosophy.',
  },
  {
    num: '03',
    icon: '◈',
    title: 'Generate Renders',
    desc: "Receive photorealistic tender renders that harmonize perfectly with your yacht's signature style.",
  },
  {
    num: '04',
    icon: '⬡',
    title: 'Refine & Perfect',
    desc: 'Iterate on every detail — from upholstery tones to hull geometry — until perfection is achieved.',
  },
] as const;

export const SHOWCASE_YACHTS = [
  {
    name: 'Azimut Grande',
    style: 'Italian Elegance',
    flip: false,
    description:
      'Flowing lines, warm teak accents, and a hull that whispers through Mediterranean waters. Every curve deliberate, every surface refined.',
    colors: ['#2C3E50', '#F0EBE0', '#C9A96E'],
  },
  {
    name: 'Benetti Oasis',
    style: 'Modern Minimalism',
    flip: true,
    description:
      'Clean geometries and a restrained palette create serenity on water. Pure form following function at 8 knots.',
    colors: ['#1A2332', '#E8E2D8', '#8B7355'],
  },
  {
    name: 'Ferretti 1000',
    style: 'Sportive Luxury',
    flip: false,
    description:
      'Aggressive stance meets refined detail. Carbon fiber meets hand-stitched leather. Fast enough to thrill, beautiful enough to admire.',
    colors: ['#1E3A5F', '#D8D8D8', '#8B2020'],
  },
  {
    name: 'Sunseeker Predator',
    style: 'British Performance',
    flip: false,
    description:
      'Muscular lines carved by decades of engineering heritage. Dark hulls that cut through Atlantic swells with authority.',
    colors: ['#151520', '#C0C0C0', '#3A5A7C'],
  },
];

export const FOOTER_LINKS = ['Privacy', 'Terms', 'Contact'] as const;
