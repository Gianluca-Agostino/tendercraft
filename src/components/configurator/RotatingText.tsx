import { useState, useEffect } from 'react';
import { FONT_BODY } from '../../constants/typography';

interface RotatingTextProps {
  messages: string[];
  intervalMs?: number;
}

export default function RotatingText({ messages, intervalMs = 3000 }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [messages.length, intervalMs]);

  return (
    <div
      style={{
        fontFamily: FONT_BODY,
        fontSize: 14,
        color: 'rgba(245,240,232,0.4)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        minHeight: '1.5em',
      }}
    >
      {messages[index]}
    </div>
  );
}
