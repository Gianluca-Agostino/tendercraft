import { useState, useEffect } from 'react';
import { GOLD, GOLD_LIGHT, DARK, CREAM } from '../../constants/colors';
import { FONT_DISPLAY, FONT_BODY } from '../../constants/typography';

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 300);
  }, []);

  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1.2s cubic-bezier(0.23,1,0.32,1)',
        }}
      >
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 11.5,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: GOLD,
            marginBottom: 28,
            fontWeight: 500,
          }}
        >
          AI-Powered Yacht Tender Design
        </div>
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(44px, 7vw, 92px)',
            fontWeight: 400,
            color: CREAM,
            lineHeight: 1.05,
            margin: '0 0 28px',
            maxWidth: 900,
          }}
        >
          Your Yacht.
          <br />
          <span style={{ fontStyle: 'italic', color: GOLD }}>Your Tender.</span>
        </h1>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: 17,
            color: 'rgba(245,240,232,0.55)',
            maxWidth: 520,
            margin: '0 auto 52px',
            lineHeight: 1.75,
            fontWeight: 300,
          }}
        >
          Generate bespoke tender renders that perfectly match your yacht&apos;s design language.
          Powered by artificial intelligence.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onStart}
            style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              border: 'none',
              color: DARK,
              padding: '17px 44px',
              borderRadius: 12,
              fontFamily: FONT_BODY,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 8px 36px rgba(201,169,110,0.3)',
            }}
          >
            Start Designing
          </button>
          <button
            style={{
              background: 'transparent',
              border: '1px solid rgba(201,169,110,0.25)',
              color: GOLD_LIGHT,
              padding: '17px 44px',
              borderRadius: 12,
              fontFamily: FONT_BODY,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            View Gallery
          </button>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeFloat 2.5s ease-in-out infinite',
        }}
      >
        <span
          style={{
            fontFamily: FONT_BODY,
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.25)',
          }}
        >
          Explore
        </span>
        <div
          style={{
            width: 1,
            height: 40,
            background: 'linear-gradient(to bottom, rgba(201,169,110,0.3), transparent)',
          }}
        />
      </div>
    </section>
  );
}
