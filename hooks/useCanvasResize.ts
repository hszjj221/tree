import { useEffect, useRef } from 'react';

interface CanvasResizeOptions {
  height?: number;
  onResize?: (width: number, height: number) => void;
}

/**
 * Hook for handling canvas resize with device pixel ratio support
 */
export const useCanvasResize = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  options: CanvasResizeOptions = {}
) => {
  const { height, onResize } = options;
  const resizeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();

      // Set display size (css pixels)
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height || rect.height}px`;

      // Set actual size in memory (scaled to account for extra pixel density)
      canvas.width = rect.width * dpr;
      canvas.height = (height || rect.height) * dpr;

      // Normalize coordinate system to use css pixels
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      onResize?.(rect.width, height || rect.height);
    };

    resizeRef.current = resize;
    resize();

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [canvasRef, height, onResize]);

  return { resize: resizeRef.current };
};
