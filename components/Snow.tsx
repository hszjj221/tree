import React, { useRef } from 'react';
import { useCanvasResize, useAnimationFrame } from '../hooks';

interface SnowParticle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
}

const SNOW_CONFIG = {
  maxParticles: 500, // Limit for ultra-wide screens
  densityFactor: 3,  // Particles per screen width divisor
  minRadius: 1,
  maxRadius: 3,
  minSpeed: 1,
  maxSpeed: 2,
  minOpacity: 0.3,
  maxOpacity: 0.8,
} as const;

const Snow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SnowParticle[]>([]);

  const createParticle = (canvasWidth: number, canvasHeight: number, randomY = false): SnowParticle => {
    return {
      x: Math.random() * canvasWidth,
      y: randomY ? Math.random() * canvasHeight : -10,
      radius: Math.random() * (SNOW_CONFIG.maxRadius - SNOW_CONFIG.minRadius) + SNOW_CONFIG.minRadius,
      speed: Math.random() * (SNOW_CONFIG.maxSpeed - SNOW_CONFIG.minSpeed) + SNOW_CONFIG.minSpeed,
      wind: Math.random() * 0.5 - 0.25,
      opacity: Math.random() * (SNOW_CONFIG.maxOpacity - SNOW_CONFIG.minOpacity) + SNOW_CONFIG.minOpacity
    };
  };

  const initParticles = (canvasWidth: number, canvasHeight: number) => {
    const particleCount = Math.min(
      Math.floor(canvasWidth / SNOW_CONFIG.densityFactor),
      SNOW_CONFIG.maxParticles
    );
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(canvasWidth, canvasHeight, true)
    );
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
    const logicalHeight = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    ctx.shadowBlur = 5;
    ctx.shadowColor = "white";

    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y += p.speed;
      p.x += p.wind + Math.sin(p.y * 0.01) * 0.5;

      // Reset if out of bounds
      if (p.y > logicalHeight) {
        particles[i] = createParticle(logicalWidth, logicalHeight);
      }
      if (p.x > logicalWidth) p.x = 0;
      if (p.x < 0) p.x = logicalWidth;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.fill();
    }

    // Reset shadow for performance
    ctx.shadowBlur = 0;
  };

  useCanvasResize(canvasRef, {
    onResize: (width, height) => {
      initParticles(width, height);
    }
  });

  useAnimationFrame(animate, true);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />;
};

export default Snow;
