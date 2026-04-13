import { GOLD, GOLD_LIGHT, DARK, CREAM } from '../../constants/colors';
import { FONT_DISPLAY, FONT_BODY } from '../../constants/typography';
import FloatingCard from '../ui/FloatingCard';

interface CTASectionProps {
  onStart: () => void;
}

export default function CTASection({ onStart }: CTASectionProps) {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '80px 24px 120px',
        maxWidth: 700,
        margin: '0 auto',
      }}
    >
      <FloatingCard delay={0} index={8}>
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            padding: '20px 0',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: GOLD,
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            Begin Your Journey
          </div>
          <h2
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: 400,
              color: CREAM,
              margin: '0 0 16px',
              lineHeight: 1.25,
            }}
          >
            Ready to Design Your
            <br />
            <span style={{ fontStyle: 'italic', color: GOLD }}>Perfect Tender?</span>
          </h2>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: 14.5,
              color: 'rgba(245,240,232,0.45)',
              lineHeight: 1.75,
              margin: '0 0 36px',
              fontWeight: 300,
            }}
          >
            Upload your yacht and let our AI craft a tender that&apos;s unmistakably yours. No two
            designs are ever the same.
          </p>
          <button
            onClick={onStart}
            style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              border: 'none',
              color: DARK,
              padding: '18px 52px',
              borderRadius: 12,
              fontFamily: FONT_BODY,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 8px 40px rgba(201,169,110,0.35)',
            }}
          >
            Configure Now
          </button>
        </div>
      </FloatingCard>
    </section>
  );
}
