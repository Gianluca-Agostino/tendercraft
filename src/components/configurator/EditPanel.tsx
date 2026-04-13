import { useState } from 'react';
import { GOLD, GOLD_LIGHT, DARK, CREAM } from '../../constants/colors';
import { FONT_DISPLAY, FONT_BODY } from '../../constants/typography';
import type { EditRequest, MaskArea, TenderOptions, RenderResult } from '../../types';
import RenderHistory from './RenderHistory';

interface EditPanelProps {
  isEditing: boolean;
  options: TenderOptions;
  renderHistory: RenderResult[];
  currentRenderId: string;
  onEdit: (req: Omit<EditRequest, 'render_id'>) => void;
  onSelectHistory: (render: RenderResult) => void;
}

const sectionLabel: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: 10,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: GOLD,
  marginBottom: 10,
  fontWeight: 500,
};

const editBtn: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 12,
  border: '1px solid rgba(201,169,110,0.12)',
  background: 'rgba(12,28,52,0.5)',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.3s ease',
};

export default function EditPanel({
  isEditing,
  options,
  renderHistory,
  currentRenderId,
  onEdit,
  onSelectHistory,
}: EditPanelProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [customMask, setCustomMask] = useState<MaskArea>('full');

  const fire = (
    editType: EditRequest['edit_type'],
    maskArea: MaskArea,
    prompt: string,
  ) => {
    onEdit({ edit_type: editType, mask_area: maskArea, new_prompt: prompt });
  };

  const disabled = isEditing;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 18,
          fontWeight: 400,
          color: CREAM,
          margin: 0,
        }}
      >
        Refine Your Tender
      </h3>

      {/* Change Colors */}
      <button
        disabled={disabled}
        onClick={() =>
          fire('color', 'hull', 'Same tender but repaint the hull with different tones from the yacht color palette.')
        }
        style={{ ...editBtn, opacity: disabled ? 0.4 : 1 }}
      >
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500, color: CREAM }}>
          Change Colors
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(245,240,232,0.35)', marginTop: 2 }}>
          Repaint the hull with palette variations
        </div>
      </button>

      {/* Toggle Cabin */}
      <button
        disabled={disabled}
        onClick={() =>
          fire(
            'cabin',
            'cabin',
            options.cabin
              ? 'Same tender but remove the cabin, make it an open center-console boat.'
              : 'Same tender but add an enclosed cabin with windows.',
          )
        }
        style={{ ...editBtn, opacity: disabled ? 0.4 : 1 }}
      >
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500, color: CREAM }}>
          {options.cabin ? 'Remove Cabin' : 'Add Cabin'}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(245,240,232,0.35)', marginTop: 2 }}>
          Toggle between enclosed cabin and open boat
        </div>
      </button>

      {/* Modify Stern */}
      <div style={{ ...editBtn, opacity: disabled ? 0.4 : 1, cursor: 'default' }}>
        <div style={sectionLabel}>Modify Stern</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['open', 'closed', 'platform'] as const).map((style) => (
            <button
              key={style}
              disabled={disabled}
              onClick={() =>
                fire('stern', 'stern', `Same tender but with ${style} stern style.`)
              }
              style={{
                flex: 1,
                padding: '8px 6px',
                borderRadius: 8,
                border: '1px solid rgba(201,169,110,0.15)',
                background: 'rgba(0,0,0,0.15)',
                cursor: disabled ? 'default' : 'pointer',
                fontFamily: FONT_BODY,
                fontSize: 11,
                color: CREAM,
                textTransform: 'capitalize',
                transition: 'all 0.3s ease',
              }}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Edit */}
      <div style={{ ...editBtn, cursor: 'default', opacity: disabled ? 0.4 : 1 }}>
        <div style={sectionLabel}>Custom Edit</div>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          disabled={disabled}
          placeholder="Make the hull matte black with gold accents"
          style={{
            width: '100%',
            minHeight: 60,
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(201,169,110,0.08)',
            borderRadius: 8,
            padding: '10px 12px',
            fontFamily: FONT_BODY,
            fontSize: 12,
            color: CREAM,
            resize: 'vertical',
            outline: 'none',
            marginBottom: 8,
          }}
        />
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {(['hull', 'cabin', 'stern', 'deck', 'full'] as MaskArea[]).map((area) => (
            <button
              key={area}
              onClick={() => setCustomMask(area)}
              disabled={disabled}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${customMask === area ? GOLD : 'rgba(201,169,110,0.12)'}`,
                background: customMask === area ? 'rgba(201,169,110,0.1)' : 'transparent',
                fontFamily: FONT_BODY,
                fontSize: 10,
                color: customMask === area ? GOLD : 'rgba(245,240,232,0.35)',
                cursor: disabled ? 'default' : 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.3s ease',
              }}
            >
              {area}
            </button>
          ))}
        </div>
        <button
          disabled={disabled || !customPrompt.trim()}
          onClick={() => {
            fire('custom', customMask, customPrompt);
            setCustomPrompt('');
          }}
          style={{
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
            border: 'none',
            color: DARK,
            padding: '10px 24px',
            borderRadius: 8,
            fontFamily: FONT_BODY,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: disabled || !customPrompt.trim() ? 'default' : 'pointer',
            opacity: disabled || !customPrompt.trim() ? 0.4 : 1,
          }}
        >
          Apply Edit
        </button>
      </div>

      {/* History */}
      <RenderHistory
        history={renderHistory}
        currentId={currentRenderId}
        onSelect={onSelectHistory}
      />
    </div>
  );
}
