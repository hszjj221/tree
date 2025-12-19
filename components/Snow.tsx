import React, { useEffect, useRef } from 'react';

const Snow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; radius: number; speed: number; wind: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor(window.innerWidth / 3); // Density based on width
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle(true));
      }
    };

    const createParticle = (randomY = false) => {
      return {
        x: Math.random() * canvas.width,
        y: randomY ? Math.random() * canvas.height : -10,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 1,
        wind: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.3
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.shadowBlur = 5;
      ctx.shadowColor = "white";

      particles.forEach((p, i) => {
        p.y += p.speed;
        p.x += p.wind + Math.sin(p.y * 0.01) * 0.5;

        // Reset if out of bounds
        if (p.y > canvas.height) {
          particles[i] = createParticle();
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });

      // Reset shadow for performance
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />;
};

export default Snow;