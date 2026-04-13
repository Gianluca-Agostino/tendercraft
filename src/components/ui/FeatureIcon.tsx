import type { ReactNode } from 'react';

interface FeatureIconProps {
  children: ReactNode;
}

export default function FeatureIcon({ children }: FeatureIconProps) {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(201,169,110,0.04))',
        border: '1px solid rgba(201,169,110,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        fontSize: 22,
      }}
    >
      {children}
    </div>
  );
}
