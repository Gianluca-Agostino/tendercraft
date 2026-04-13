import { GOLD, CREAM } from '../../constants/colors';
import { FONT_DISPLAY, FONT_BODY } from '../../constants/typography';
import RotatingText from './RotatingText';

const MESSAGES = [
  'Sculpting the hull...',
  'Applying the color palette...',
  'Adding teak deck details...',
  'Perfecting the lighting...',
  'Final touches...',
];

interface GeneratingStepProps {
  promptUsed: string | null;
}

export default function GeneratingStep({ promptUsed }: GeneratingStepProps) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 520 }}>
      {/* Animated ring */}
      <div
        style={{
          position: 'relative',
          width: 80,
          height: 80,
          margin: '0 auto 32px',
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ animation: 'spin 2s linear infinite' }}>
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="rgba(201,169,110,0.12)"
            strokeWidth="3"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke={GOLD}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="80 140"
          />
        </svg>
      </div>

      <h2
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(24px,3vw,32px)',
          fontWeight: 400,
          color: CREAM,
          margin: '0 0 16px',
        }}
      >
        Crafting Your Tender...
      </h2>

      <RotatingText messages={MESSAGES} intervalMs={4000} />

      {/* Prompt used */}
      {promptUsed && (
        <div
          style={{
            marginTop: 36,
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 10,
            padding: '14px 18px',
            border: '1px solid rgba(201,169,110,0.06)',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,0.25)',
              marginBottom: 8,
            }}
          >
            Prompt
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', 'SF Mono', monospace",
              fontSize: 11,
              color: 'rgba(245,240,232,0.35)',
              lineHeight: 1.6,
              maxHeight: 100,
              overflow: 'hidden',
            }}
          >
            {promptUsed.length > 300 ? promptUsed.slice(0, 300) + '...' : promptUsed}
          </div>
        </div>
      )}
    </div>
  );
}
