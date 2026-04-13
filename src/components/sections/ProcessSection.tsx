import { GOLD, CREAM } from '../../constants/colors';
import { FONT_DISPLAY, FONT_BODY } from '../../constants/typography';
import { PROCESS_STEPS } from '../../constants/content';
import FloatingCard from '../ui/FloatingCard';
import FeatureIcon from '../ui/FeatureIcon';

export default function ProcessSection() {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '80px 24px 120px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 11,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: GOLD,
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          The Process
        </div>
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(32px, 4vw, 50px)',
            fontWeight: 400,
            color: CREAM,
            margin: 0,
          }}
        >
          From Vision to <span style={{ fontStyle: 'italic' }}>Reality</span>
        </h2>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(255px, 1fr))',
          gap: 22,
        }}
      >
        {PROCESS_STEPS.map((s, i) => (
          <FloatingCard key={s.num} delay={i * 150} index={i}>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 44,
                fontWeight: 300,
                color: 'rgba(201,169,110,0.07)',
                position: 'absolute',
                top: 14,
                right: 22,
              }}
            >
              {s.num}
            </div>
            <FeatureIcon>{s.icon}</FeatureIcon>
            <h3
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 19,
                fontWeight: 500,
                color: CREAM,
                margin: '0 0 10px',
              }}
            >
              {s.title}
            </h3>
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: 13.5,
                color: 'rgba(245,240,232,0.45)',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {s.desc}
            </p>
          </FloatingCard>
        ))}
      </div>
    </section>
  );
}
