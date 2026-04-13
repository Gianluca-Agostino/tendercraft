import { GOLD } from '../../constants/colors';
import { FONT_BODY } from '../../constants/typography';
import type { RenderResult } from '../../types';

interface RenderHistoryProps {
  history: RenderResult[];
  currentId: string;
  onSelect: (render: RenderResult) => void;
}

export default function RenderHistory({ history, currentId, onSelect }: RenderHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(245,240,232,0.25)',
          marginBottom: 10,
        }}
      >
        Previous Versions
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
        {history.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            style={{
              width: 80,
              height: 50,
              borderRadius: 8,
              overflow: 'hidden',
              border: r.id === currentId
                ? `2px solid ${GOLD}`
                : '2px solid rgba(201,169,110,0.12)',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              background: 'rgba(0,0,0,0.3)',
              transition: 'border-color 0.3s ease',
            }}
          >
            {r.image_url && (
              <img
                src={r.image_url}
                alt={`Version ${r.id.slice(0, 6)}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
