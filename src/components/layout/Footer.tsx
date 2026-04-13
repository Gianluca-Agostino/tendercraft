import { FONT_BODY } from '../../constants/typography';
import { FOOTER_LINKS } from '../../constants/content';

export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid rgba(201,169,110,0.08)',
        padding: '40px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <span
        style={{
          fontFamily: FONT_BODY,
          fontSize: 12,
          color: 'rgba(245,240,232,0.25)',
        }}
      >
        &copy; 2026 TenderCraft &mdash; AI-Powered Yacht Tender Design
      </span>
      <div style={{ display: 'flex', gap: 24 }}>
        {FOOTER_LINKS.map((l) => (
          <a
            key={l}
            href="#"
            style={{
              fontFamily: FONT_BODY,
              fontSize: 12,
              color: 'rgba(245,240,232,0.25)',
              textDecoration: 'none',
            }}
          >
            {l}
          </a>
        ))}
      </div>
    </footer>
  );
}
