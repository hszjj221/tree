import React, { useEffect, useRef } from 'react';
import { LightColorMode, TreeParticle, ParticleType } from '../types';
import { useCanvasResize, useAnimationFrame } from '../hooks';

interface TreeProps {
  lightsOn: boolean;
  colorMode: LightColorMode;
}

const Tree: React.FC<TreeProps> = ({ lightsOn, colorMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<TreeParticle[]>([]);
  const timeRef = useRef(0);

  // Tree Dimensions
  const treeHeight = 550;
  const treeBaseWidth = 320;

  const getLightColor = (mode: LightColorMode, index: number) => {
    if (mode === LightColorMode.WarmWhite) return `rgba(255, 220, 150, 0.9)`;
    if (mode === LightColorMode.BlueIce) return `rgba(200, 240, 255, 0.9)`;

    const colors = ['#ff0000', '#00ff00', '#ffff00', '#0000ff'];
    return colors[index % colors.length];
  };

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    color: string
  ) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#FFD700";
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const initTree = (canvasWidth: number, canvasHeight: number) => {
    const particles: TreeParticle[] = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight - 80;

    // 0. Trunk
    const trunkHeight = 80;
    const trunkWidth = 40;
    const trunkStartY = 80 + treeHeight - 40;

    for (let i = 0; i < 300; i++) {
      const xOffset = (Math.random() - 0.5) * trunkWidth;
      const y = trunkStartY + Math.random() * trunkHeight;
      const z = (Math.random() - 0.5) * trunkWidth;

      particles.push({
        x: centerX + xOffset,
        y: y,
        z: z - 10,
        color: Math.random() > 0.6 ? '#2D1B13' : '#3E2723',
        size: 5 + Math.random() * 4,
        type: 'trunk',
        swayOffset: 0.02,
        baseX: centerX + xOffset,
        baseY: y
      });
    }

    // 1. Realistic Foliage (Pine Needles)
    const layers = 24;
    for (let l = 0; l < layers; l++) {
      const layerProgress = l / layers;
      const y = 80 + layerProgress * treeHeight;
      const currentRadius = 10 + (layerProgress * treeBaseWidth * 0.5);
      const count = 50 + (l * 40);

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * currentRadius;
        const xx = Math.cos(angle) * r;
        const yy = (Math.random() - 0.5) * 20;
        const z = Math.sin(angle) * r;

        const brightness = 10 + Math.random() * 40;
        const color = `rgb(${brightness}, ${brightness + 40 + Math.random() * 30}, ${brightness + 10})`;

        particles.push({
          x: centerX + xx,
          y: y + yy,
          z: z,
          color: color,
          size: 2 + Math.random() * 3,
          type: 'leaf',
          swayOffset: (1 - layerProgress) + 0.5,
          baseX: centerX + xx,
          baseY: y + yy,
          rotation: Math.random() * Math.PI
        });
      }
    }

    // 2. Gold Tinsel Garland (Spiral)
    const loops = 6;
    const tinselPoints = 600;
    for (let i = 0; i < tinselPoints; i++) {
      const p = i / tinselPoints;
      const angle = p * Math.PI * 2 * loops;
      const y = 100 + p * treeHeight;
      const radius = 15 + (p * treeBaseWidth * 0.55);

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius + 5;

      particles.push({
        x: centerX + x,
        y: y,
        z: z,
        color: '#FFD700',
        size: 1.5,
        type: 'tinsel',
        swayOffset: (1 - p) + 0.2,
        baseX: centerX + x,
        baseY: y
      });
    }

    // 3. Red Baubles (Ornaments)
    const ornamentCount = 45;
    for (let i = 0; i < ornamentCount; i++) {
      const p = Math.random();
      if (p < 0.1) continue;

      const y = 100 + p * treeHeight;
      const maxR = 10 + (p * treeBaseWidth * 0.45);
      const angle = Math.random() * Math.PI * 2;

      const x = Math.cos(angle) * maxR;
      const z = Math.sin(angle) * maxR + 2;

      particles.push({
        x: centerX + x,
        y: y,
        z: z,
        color: '#CC0000',
        size: 5 + Math.random() * 3,
        type: 'ornament',
        swayOffset: (1 - p),
        baseX: centerX + x,
        baseY: y
      });
    }

    // 4. Lights
    const lightCount = 80;
    for (let i = 0; i < lightCount; i++) {
      const p = Math.random();
      const y = 90 + p * treeHeight;
      const maxR = 5 + (p * treeBaseWidth * 0.5);
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * maxR;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      particles.push({
        x: centerX + x,
        y: y,
        z: z,
        color: 'white',
        size: 3,
        type: 'light',
        swayOffset: (1 - p),
        blinkOffset: Math.random() * 100,
        baseX: centerX + x,
        baseY: y
      });
    }

    // 5. The Star
    particles.push({
      x: centerX,
      y: 75,
      z: 100,
      color: '#FFD700',
      size: 25,
      type: 'star',
      swayOffset: 0,
      baseX: centerX,
      baseY: 75
    });

    // Sort by Z once during initialization
    particles.sort((a, b) => a.z - b.z);
    particlesRef.current = particles;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the logical size (not the physical size)
    const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
    const logicalHeight = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    timeRef.current += 0.01;

    const wind = Math.sin(timeRef.current) * 3;
    const particles = particlesRef.current;

    particles.forEach((p) => {
      const sway = wind * p.swayOffset;
      p.x = p.baseX + sway;

      if (p.type === 'trunk') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 1.5);
        ctx.fill();
      } else if (p.type === 'leaf') {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.size, p.y + p.size * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (p.type === 'tinsel') {
        const shimmer = Math.sin(timeRef.current * 5 + p.y) > 0 ? '#FFFFAA' : '#CCAA00';
        ctx.fillStyle = shimmer;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'ornament') {
        const grad = ctx.createRadialGradient(p.x - 2, p.y - 2, 1, p.x, p.y, p.size);
        grad.addColorStop(0, 'white');
        grad.addColorStop(0.2, '#ff4444');
        grad.addColorStop(1, '#880000');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      } else if (p.type === 'light') {
        if (lightsOn) {
          const blink = Math.sin(timeRef.current * 4 + (p.blinkOffset || 0));
          if (blink > -0.2) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = getLightColor(colorMode, particles.indexOf(p));
            ctx.shadowBlur = 8;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      } else if (p.type === 'star') {
        drawStar(ctx, p.x, p.y, 5, p.size, p.size / 2, '#FFD700');
      }
    });
  };

  // Initialize canvas with DPR support
  useCanvasResize(canvasRef, {
    height: 750,
    onResize: (width, height) => {
      initTree(width, height);
    }
  });

  // Animation loop
  useAnimationFrame(draw, true);

  return (
    <div className="w-full max-w-4xl mx-auto h-[750px] relative flex justify-center z-10">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default Tree;
