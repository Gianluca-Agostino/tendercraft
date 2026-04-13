import { GOLD, GOLD_LIGHT, DARK, CREAM } from '../../constants/colors';
import { FONT_DISPLAY, FONT_BODY } from '../../constants/typography';
import type { RenderResult, YachtAnalysis, EditRequest, TenderOptions } from '../../types';
import EditPanel from './EditPanel';

interface ResultStepProps {
  render: RenderResult;
  analysis: YachtAnalysis | null;
  isEditing: boolean;
  renderHistory: RenderResult[];
  onEdit: (req: Omit<EditRequest, 'render_id'>) => void;
  onSelectHistory: (render: RenderResult) => void;
  onNewVariation: () => void;
  onReset: () => void;
  options: TenderOptions;
}

export default function ResultStep({
  render,
  analysis,
  isEditing,
  renderHistory,
  onEdit,
  onSelectHistory,
  onNewVariation,
  onReset,
  options,
}: ResultStepProps) {
  return (
    <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 11,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: GOLD,
            marginBottom: 12,
            fontWeight: 500,
          }}
        >
          Your Tender
        </div>
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(24px,3vw,36px)',
            fontWeight: 400,
            color: CREAM,
            margin: 0,
          }}
        >
          {analysis?.yacht_name || 'Custom'}{' '}
          <span style={{ fontStyle: 'italic', color: GOLD }}>Tender</span>
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: 28,
        }}
        className="result-grid"
      >
        {/* === LEFT: Render image === */}
        <div>
          <div
            style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(201,169,110,0.12)',
              background: 'rgba(0,0,0,0.4)',
            }}
          >
            {render.image_url && (
              <img
                src={render.image_url}
                alt="Generated tender"
                style={{ width: '100%', display: 'block' }}
              />
            )}

            {/* Editing overlay */}
            {isEditing && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(5,8,14,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: `2px solid ${GOLD}`,
                    borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 20,
              flexWrap: 'wrap',
            }}
          >
            {/* Download */}
            {render.image_url && (
              <a
                href={render.image_url}
                download="tendercraft-render.png"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                  border: 'none',
                  color: DARK,
                  padding: '12px 28px',
                  borderRadius: 10,
                  fontFamily: FONT_BODY,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxShadow: '0 4px 20px rgba(201,169,110,0.25)',
                }}
              >
                Download PNG
              </a>
            )}

            {/* New variation */}
            <button
              onClick={onNewVariation}
              style={{
                background: 'transparent',
                border: '1px solid rgba(201,169,110,0.2)',
                color: GOLD_LIGHT,
                padding: '12px 24px',
                borderRadius: 10,
                fontFamily: FONT_BODY,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              New Variation
            </button>

            {/* Try another */}
            <button
              onClick={onReset}
              style={{
                background: 'transparent',
                border: '1px solid rgba(201,169,110,0.1)',
                color: 'rgba(245,240,232,0.35)',
                padding: '12px 24px',
                borderRadius: 10,
                fontFamily: FONT_BODY,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Try Another Yacht
            </button>
          </div>
        </div>

        {/* === RIGHT: Edit panel === */}
        <EditPanel
          isEditing={isEditing}
          options={options}
          renderHistory={renderHistory}
          currentRenderId={render.id}
          onEdit={onEdit}
          onSelectHistory={onSelectHistory}
        />
      </div>
    </div>
  );
}
