import { GOLD, CREAM } from '../../constants/colors';
import { FONT_DISPLAY, FONT_BODY } from '../../constants/typography';
import { SHOWCASE_YACHTS } from '../../constants/content';
import { useScrollProgress } from '../../hooks/useScrollProgress';

import azimutImg from '../../assets/yachts/azimut.png';
import benettiImg from '../../assets/yachts/benetti.png';
import ferrettiImg from '../../assets/yachts/ferretti.png';
import sunseekerImg from '../../assets/yachts/sunseeker.png';

const YACHT_IMAGES = [azimutImg, benettiImg, ferrettiImg, sunseekerImg];

/** Cubic ease-in-out */
function easeInOutCubic(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

interface YachtRowProps {
  yacht: (typeof SHOWCASE_YACHTS)[number];
  img: string;
  index: number;
}

function YachtRow({ yacht, img, index }: YachtRowProps) {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const eased = easeInOutCubic(Math.min(progress, 1));

  const fromLeft = index % 2 === 0;
  const docked = progress > 0.85;

  // Yacht translateX: starts off-screen, docks to 0
  const translateX = fromLeft
    ? `${(-110 * (1 - eased)).toFixed(1)}%`
    : `${(110 * (1 - eased)).toFixed(1)}%`;

  // Slight rotation during "sailing"
  const rotate = (fromLeft ? -1 : 1) * (1 - eased) * 5;

  // Text fade + slide
  const textProgress = Math.max(0, (progress - 0.45) * 2.2);
  const textEased = Math.min(textProgress, 1);
  const textTranslateX = fromLeft
    ? `${(40 * (1 - textEased)).toFixed(1)}px`
    : `${(-40 * (1 - textEased)).toFixed(1)}px`;

  return (
    <div
      ref={ref}
      className="showcase-row"
      style={{
        display: 'flex',
        flexDirection: fromLeft ? 'row' : 'row-reverse',
        alignItems: 'center',
        gap: 'clamp(24px, 4vw, 64px)',
        minHeight: 340,
        overflow: 'hidden',
      }}
    >
      {/* Yacht image */}
      <div
        className="showcase-img"
        style={{
          flex: '0 0 55%',
          maxWidth: '55%',
          transform: `translateX(${translateX}) rotate(${rotate.toFixed(2)}deg)`,
          willChange: 'transform',
        }}
      >
        {/* Flip wrapper — separate from bob to avoid CSS conflicts */}
        <div
          style={{
            transform: yacht.flip ? 'scaleX(-1)' : 'none',
          }}
        >
          {/* Bob wrapper — only activates after docking */}
          <div
            className={docked ? 'yacht-bob' : ''}
            style={{
              animationDelay: `${index * 0.3}s`,
            }}
          >
            <img
              src={img}
              alt={yacht.name}
              loading="lazy"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                filter: `drop-shadow(0 20px 40px rgba(0,0,0,0.4))`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Text content */}
      <div
        style={{
          flex: 1,
          opacity: textEased,
          transform: `translateX(${textTranslateX})`,
          willChange: 'opacity, transform',
        }}
      >
        {/* Style label */}
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 11,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: GOLD,
            marginBottom: 12,
            fontWeight: 500,
          }}
        >
          {yacht.style}
        </div>

        {/* Yacht name */}
        <h3
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(24px, 3vw, 38px)',
            fontWeight: 400,
            color: CREAM,
            margin: '0 0 16px',
            lineHeight: 1.15,
          }}
        >
          {yacht.name}
        </h3>

        {/* Description */}
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: 14.5,
            color: 'rgba(245,240,232,0.5)',
            lineHeight: 1.75,
            margin: '0 0 24px',
            maxWidth: 420,
            fontWeight: 300,
          }}
        >
          {yacht.description}
        </p>

        {/* Color palette */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,0.25)',
              marginRight: 4,
            }}
          >
            Palette
          </span>
          {yacht.colors.map((c, ci) => (
            <div
              key={ci}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: c,
                border: '2px solid rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShowcaseSection() {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '40px 24px 120px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 80 }}>
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
          Showcase
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
          Matched <span style={{ fontStyle: 'italic' }}>Perfection</span>
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
        {SHOWCASE_YACHTS.map((yacht, i) => (
          <YachtRow key={yacht.name} yacht={yacht} img={YACHT_IMAGES[i]} index={i} />
        ))}
      </div>
    </section>
  );
}
