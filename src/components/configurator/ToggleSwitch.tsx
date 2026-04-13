import { GOLD, CREAM } from '../../constants/colors';
import { FONT_BODY } from '../../constants/typography';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelOn: string;
  labelOff: string;
}

export default function ToggleSwitch({ checked, onChange, labelOn, labelOff }: ToggleSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        outline: 'none',
      }}
    >
      {/* Track */}
      <div
        style={{
          position: 'relative',
          width: 48,
          height: 26,
          borderRadius: 13,
          background: checked ? 'rgba(201,169,110,0.3)' : 'rgba(245,240,232,0.1)',
          border: `1px solid ${checked ? GOLD : 'rgba(245,240,232,0.15)'}`,
          transition: 'all 0.3s ease',
          flexShrink: 0,
        }}
      >
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 24 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: checked ? GOLD : 'rgba(245,240,232,0.4)',
            transition: 'left 0.3s ease, background 0.3s ease',
            boxShadow: checked ? '0 0 8px rgba(201,169,110,0.4)' : 'none',
          }}
        />
      </div>
      {/* Label */}
      <span
        style={{
          fontFamily: FONT_BODY,
          fontSize: 13,
          color: checked ? CREAM : 'rgba(245,240,232,0.45)',
          transition: 'color 0.3s ease',
        }}
      >
        {checked ? labelOn : labelOff}
      </span>
    </button>
  );
}
