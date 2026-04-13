import { useState, useEffect, useRef } from 'react';

/**
 * Returns a 0→1 progress value based on how far an element has scrolled into view.
 * 0 = bottom edge just entered the viewport, 1 = element is fully visible.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // raw: 0 when element top enters viewport bottom, 1 when fully visible
      const raw = 1 - (rect.top / (vh * 0.65));
      setProgress(Math.max(0, Math.min(1, raw)));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return { ref, progress };
}
