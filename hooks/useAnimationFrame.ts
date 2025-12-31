import { useEffect, useRef } from 'react';

/**
 * Hook for managing requestAnimationFrame loop with automatic cleanup
 */
export const useAnimationFrame = (
  callback: () => void,
  isActive: boolean = true
) => {
  const requestRef = useRef<number>();
  const callbackRef = useRef(callback);

  // Keep callback reference updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isActive) return;

    const animate = () => {
      callbackRef.current();
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive]);

  return { requestRef };
};
