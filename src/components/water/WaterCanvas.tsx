import { useRef } from 'react';
import { useWaterShader } from '../../hooks/useWaterShader';

export default function WaterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useWaterShader(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
