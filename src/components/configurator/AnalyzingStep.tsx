import { GOLD, CREAM } from '../../constants/colors';
import { FONT_DISPLAY } from '../../constants/typography';
import RotatingText from './RotatingText';

const MESSAGES = [
  'Extracting color palette...',
  'Identifying hull lines...',
  'Mapping materials and finishes...',
  'Building tender specification...',
];

export default function AnalyzingStep() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          margin: '0 auto 28px',
          border: `2px solid ${GOLD}`,
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
        }}
      />
      <h2
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 28,
          fontWeight: 400,
          color: CREAM,
          margin: '0 0 16px',
        }}
      >
        Analyzing Design DNA...
      </h2>
      <RotatingText messages={MESSAGES} intervalMs={3000} />
    </div>
  );
}
