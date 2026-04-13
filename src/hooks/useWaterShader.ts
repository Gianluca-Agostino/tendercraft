import { useEffect, useRef } from 'react';
import { VERT, FRAG, TRAIL_LEN } from '../components/water/shaders';
import type { TrailPoint } from '../types';

interface WaterUniforms {
  time: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
  trailLen: WebGLUniformLocation | null;
  trail: (WebGLUniformLocation | null)[];
  trailAge: (WebGLUniformLocation | null)[];
}

export function useWaterShader(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const animRef = useRef<number>(0);
  const trailRef = useRef<TrailPoint[]>([]);
  const startTime = useRef(Date.now());
  const lastPush = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    function compile(src: string, type: number) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(s));
      }
      return s;
    }

    const vs = compile(VERT, gl.VERTEX_SHADER);
    const fs = compile(FRAG, gl.FRAGMENT_SHADER);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u: WaterUniforms = {
      time: gl.getUniformLocation(prog, 'u_time'),
      resolution: gl.getUniformLocation(prog, 'u_resolution'),
      trailLen: gl.getUniformLocation(prog, 'u_trailLen'),
      trail: [],
      trailAge: [],
    };
    for (let i = 0; i < TRAIL_LEN; i++) {
      u.trail.push(gl.getUniformLocation(prog, `u_trail[${i}]`));
      u.trailAge.push(gl.getUniformLocation(prog, `u_trailAge[${i}]`));
    }

    const resize = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * d;
      canvas.height = innerHeight * d;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      gl!.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    addEventListener('resize', resize);

    const onMove = (e: MouseEvent | TouchEvent) => {
      const touch = 'touches' in e ? e.touches[0] : e;
      const cx = touch.clientX;
      const cy = touch.clientY;
      const now = Date.now();
      if (now - lastPush.current > 14) {
        trailRef.current.unshift({
          x: cx / innerWidth,
          y: 1 - cy / innerHeight,
          t: (now - startTime.current) / 1000,
        });
        if (trailRef.current.length > TRAIL_LEN) trailRef.current.pop();
        lastPush.current = now;
      }
    };
    addEventListener('mousemove', onMove);
    addEventListener('touchmove', onMove, { passive: true });

    function render() {
      const now = (Date.now() - startTime.current) / 1000;
      gl!.uniform1f(u.time, now);
      gl!.uniform2f(u.resolution, canvas!.width, canvas!.height);

      trailRef.current = trailRef.current.filter((p) => now - p.t < 2);
      const trail = trailRef.current;
      const len = Math.min(trail.length, TRAIL_LEN);
      gl!.uniform1i(u.trailLen, len);

      for (let i = 0; i < TRAIL_LEN; i++) {
        if (i < len) {
          gl!.uniform2f(u.trail[i], trail[i].x, trail[i].y);
          gl!.uniform1f(u.trailAge[i], now - trail[i].t);
        } else {
          gl!.uniform2f(u.trail[i], -1, -1);
          gl!.uniform1f(u.trailAge[i], 99);
        }
      }

      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      animRef.current = requestAnimationFrame(render);
    }
    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      removeEventListener('resize', resize);
      removeEventListener('mousemove', onMove);
      removeEventListener('touchmove', onMove);

      // Proper WebGL cleanup
      gl.deleteBuffer(buf);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(prog);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [canvasRef]);
}
