import { GOLD, GOLD_LIGHT, DARK, CREAM } from '../../constants/colors';
import { FONT_DISPLAY, FONT_BODY } from '../../constants/typography';
import type { YachtAnalysis, TenderOptions, ConfigAction } from '../../types';
import OptionCard from './OptionCard';
import ToggleSwitch from './ToggleSwitch';

interface ConfigureStepProps {
  analysis: YachtAnalysis;
  imagePreview: string | null;
  options: TenderOptions;
  dispatch: React.Dispatch<ConfigAction>;
  onGenerate: () => void;
}

const sectionLabel: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: 11,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: GOLD,
  marginBottom: 12,
  fontWeight: 500,
};

const cardBg: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(12,28,52,0.7), rgba(8,18,35,0.82))',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(201,169,110,0.12)',
  borderRadius: 16,
  padding: '24px 20px',
};

export default function ConfigureStep({
  analysis,
  imagePreview,
  options,
  dispatch,
  onGenerate,
}: ConfigureStepProps) {
  const setOpt = (partial: Partial<TenderOptions>) =>
    dispatch({ type: 'SET_OPTIONS', options: partial });

  return (
    <div style={{ maxWidth: 1000, width: '100%', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={sectionLabel}>Step 2</div>
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(26px,3.5vw,40px)',
            fontWeight: 400,
            color: CREAM,
            margin: 0,
          }}
        >
          Configure Your <span style={{ fontStyle: 'italic', color: GOLD }}>Tender</span>
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
        }}
        className="configure-grid"
      >
        {/* === LEFT: Analysis Summary === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Photo + name */}
          <div style={cardBg}>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Yacht"
                style={{
                  width: '100%',
                  height: 180,
                  objectFit: 'cover',
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              />
            )}
            <h3
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 20,
                fontWeight: 400,
                color: CREAM,
                margin: '0 0 4px',
              }}
            >
              {analysis.yacht_name}
            </h3>
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: 12,
                color: GOLD,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              {analysis.design_style}
            </span>
          </div>

          {/* Color palette */}
          <div style={cardBg}>
            <div style={sectionLabel}>Color Palette</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {analysis.colors.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 8,
                    padding: '6px 10px',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: c.hex,
                      border: '1px solid rgba(255,255,255,0.1)',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: CREAM }}>
                      {c.name}
                    </div>
                    <div
                      style={{ fontFamily: FONT_BODY, fontSize: 9.5, color: 'rgba(245,240,232,0.3)' }}
                    >
                      {c.hex}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Materials + Hull */}
          <div style={cardBg}>
            <div style={sectionLabel}>Materials</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {analysis.materials.map((m, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 11.5,
                    color: CREAM,
                    background: 'rgba(201,169,110,0.08)',
                    border: '1px solid rgba(201,169,110,0.15)',
                    borderRadius: 6,
                    padding: '5px 12px',
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
            <div style={sectionLabel}>Hull Character</div>
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: 13,
                color: 'rgba(245,240,232,0.5)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {analysis.hull_character}
            </p>
          </div>
        </div>

        {/* === RIGHT: Tender Options === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Cabin toggle */}
          <div style={cardBg}>
            <div style={sectionLabel}>Cabin</div>
            <ToggleSwitch
              checked={options.cabin}
              onChange={(v) => setOpt({ cabin: v })}
              labelOn="Con Cabina"
              labelOff="Open Boat"
            />
          </div>

          {/* Stern style */}
          <div style={cardBg}>
            <div style={sectionLabel}>Stern Style</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <OptionCard
                label="Open"
                description="Classic open stern with swim platform"
                selected={options.stern_style === 'open'}
                onClick={() => setOpt({ stern_style: 'open' })}
              />
              <OptionCard
                label="Closed"
                description="Enclosed stern with storage"
                selected={options.stern_style === 'closed'}
                onClick={() => setOpt({ stern_style: 'closed' })}
              />
              <OptionCard
                label="Platform"
                description="Extended platform with water access"
                selected={options.stern_style === 'platform'}
                onClick={() => setOpt({ stern_style: 'platform' })}
              />
            </div>
          </div>

          {/* Size */}
          <div style={cardBg}>
            <div style={sectionLabel}>Size</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <OptionCard
                label="Compact"
                description="3m — 2-3 pax"
                selected={options.size === 'small'}
                onClick={() => setOpt({ size: 'small' })}
              />
              <OptionCard
                label="Medium"
                description="4.5m — 4-5 pax"
                selected={options.size === 'medium'}
                onClick={() => setOpt({ size: 'medium' })}
              />
              <OptionCard
                label="Large"
                description="6m — 6-8 pax"
                selected={options.size === 'large'}
                onClick={() => setOpt({ size: 'large' })}
              />
            </div>
          </div>

          {/* Custom instructions */}
          <div style={cardBg}>
            <div style={sectionLabel}>Custom Instructions</div>
            <textarea
              value={options.custom_instructions}
              onChange={(e) => setOpt({ custom_instructions: e.target.value })}
              placeholder="Add specific requests... e.g. 'Add LED underwater lights' or 'Match the Riva Aquarama style'"
              style={{
                width: '100%',
                minHeight: 80,
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(201,169,110,0.1)',
                borderRadius: 10,
                padding: '12px 16px',
                fontFamily: FONT_BODY,
                fontSize: 13,
                color: CREAM,
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.1)')}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={onGenerate}
            style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              border: 'none',
              color: DARK,
              padding: '18px 44px',
              borderRadius: 12,
              fontFamily: FONT_BODY,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 8px 36px rgba(201,169,110,0.3)',
              width: '100%',
            }}
          >
            Generate Tender &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
