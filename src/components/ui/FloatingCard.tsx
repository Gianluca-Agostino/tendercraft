import { useState, useEffect, type ReactNode } from 'react';

interface FloatingCardProps {
  children: ReactNode;
  delay?: number;
  index?: number;
}

export default function FloatingCard({ children, delay = 0, index = 0 }: FloatingCardProps) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600 + delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? `translateY(0) scale(${hovered ? 1.02 : 1})`
          : 'translateY(50px) scale(0.96)',
        transition: 'opacity 0.9s ease, transform 0.5s cubic-bezier(0.23,1,0.32,1)',
        animation: visible ? `bob 5s ease-in-out ${index * 1.1}s infinite` : 'none',
        background: hovered
          ? 'linear-gradient(145deg, rgba(12,28,52,0.85), rgba(8,18,35,0.92))'
          : 'linear-gradient(145deg, rgba(12,28,52,0.7), rgba(8,18,35,0.82))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${hovered ? 'rgba(201,169,110,0.5)' : 'rgba(201,169,110,0.12)'}`,
        borderRadius: 18,
        padding: '36px 32px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        boxShadow: hovered
          ? '0 32px 80px rgba(0,0,0,0.6)'
          : '0 20px 60px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(to top, rgba(0,60,100,0.12), transparent)',
          pointerEvents: 'none',
          animation: `reflPulse 5s ease-in-out ${index * 0.6}s infinite`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)',
        }}
      />
      {children}
    </div>
  );
}
