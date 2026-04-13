import { useState, useEffect } from 'react';
import { GOLD, GOLD_LIGHT, DARK, CREAM } from '../../constants/colors';
import { FONT_DISPLAY, FONT_BODY } from '../../constants/typography';
import { NAV_LINKS } from '../../constants/content';

interface NavProps {
  onConfigure: () => void;
}

export default function Nav({ onConfigure }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(scrollY > 40);
    addEventListener('scroll', h);
    return () => removeEventListener('scroll', h);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 48px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled || menuOpen ? 'rgba(10,14,20,0.9)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,169,110,0.08)' : 'none',
        transition: 'all 0.4s ease',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 4L28 12V24L16 28L4 24V12L16 4Z"
            stroke={GOLD}
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M7 18C11 14 21 14 25 18"
            stroke={GOLD}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M9 21C13 18 19 18 23 21"
            stroke={GOLD}
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 19,
            fontWeight: 600,
            color: CREAM,
            letterSpacing: '0.06em',
          }}
        >
          TENDER<span style={{ color: GOLD }}>CRAFT</span>
        </span>
      </div>

      {/* Desktop links */}
      <div
        style={{
          display: 'flex',
          gap: 36,
          alignItems: 'center',
        }}
        className="nav-desktop"
      >
        {NAV_LINKS.map((item) => (
          <a
            key={item}
            href="#"
            style={{
              color: 'rgba(245,240,232,0.6)',
              textDecoration: 'none',
              fontFamily: FONT_BODY,
              fontSize: 12.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,0.6)')}
          >
            {item}
          </a>
        ))}
        <button
          onClick={onConfigure}
          style={{
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
            border: 'none',
            color: DARK,
            padding: '10px 24px',
            borderRadius: 8,
            fontFamily: FONT_BODY,
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Configure
        </button>
      </div>

      {/* Hamburger button (mobile) */}
      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          flexDirection: 'column',
          gap: 5,
        }}
      >
        <span
          style={{
            display: 'block',
            width: 24,
            height: 2,
            background: GOLD,
            transition: 'transform 0.3s, opacity 0.3s',
            transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none',
          }}
        />
        <span
          style={{
            display: 'block',
            width: 24,
            height: 2,
            background: GOLD,
            transition: 'opacity 0.3s',
            opacity: menuOpen ? 0 : 1,
          }}
        />
        <span
          style={{
            display: 'block',
            width: 24,
            height: 2,
            background: GOLD,
            transition: 'transform 0.3s, opacity 0.3s',
            transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
          }}
        />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="nav-mobile-menu"
          style={{
            position: 'absolute',
            top: 72,
            left: 0,
            right: 0,
            background: 'rgba(10,14,20,0.95)',
            backdropFilter: 'blur(20px)',
            padding: '24px 48px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            borderBottom: '1px solid rgba(201,169,110,0.08)',
          }}
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item}
              href="#"
              onClick={() => setMenuOpen(false)}
              style={{
                color: 'rgba(245,240,232,0.6)',
                textDecoration: 'none',
                fontFamily: FONT_BODY,
                fontSize: 14,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              {item}
            </a>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              onConfigure();
            }}
            style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              border: 'none',
              color: DARK,
              padding: '12px 24px',
              borderRadius: 8,
              fontFamily: FONT_BODY,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            Configure
          </button>
        </div>
      )}
    </nav>
  );
}
