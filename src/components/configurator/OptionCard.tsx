import { GOLD, CREAM } from '../../constants/colors';
import { FONT_DISPLAY, FONT_BODY } from '../../constants/typography';

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export default function OptionCard({ label, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 0,
        background: selected
          ? 'rgba(201,169,110,0.08)'
          : 'rgba(12,28,52,0.4)',
        border: `1px solid ${selected ? GOLD : 'rgba(201,169,110,0.12)'}`,
        borderRadius: 12,
        padding: '16px 14px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.3s ease',
        boxShadow: selected ? '0 0 20px rgba(201,169,110,0.15)' : 'none',
        outline: 'none',
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 14,
          fontWeight: 500,
          color: selected ? GOLD : CREAM,
          marginBottom: description ? 4 : 0,
        }}
      >
        {label}
      </div>
      {description && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 11,
            color: 'rgba(245,240,232,0.35)',
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      )}
    </button>
  );
}
