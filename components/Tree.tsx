import React, { useEffect, useRef } from 'react';
import { LightColorMode } from '../types';

interface TreeProps {
  lightsOn: boolean;
  colorMode: LightColorMode;
}

const Tree: React.FC<TreeProps> = ({ lightsOn, colorMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Tree Dimensions
    const treeHeight = 550;
    const treeBaseWidth = 320;
    
    // Particle Types
    type ParticleType = 'leaf' | 'light' | 'ornament' | 'tinsel' | 'star' | 'ray' | 'trunk';
    
    interface Particle {
      x: number;
      y: number;
      z: number;
      color: string;
      size: number;
      type: ParticleType;
      swayOffset: number;
      blinkOffset?: number;
      baseX: number;
      baseY: number;
      rotation?: number;
    }

    let particles: Particle[] = [];

    const getLightColor = (mode: LightColorMode, index: number) => {
      // If color mode is multi, we can still have standard warm lights or mixed
      if (mode === LightColorMode.WarmWhite) return `rgba(255, 220, 150, 0.9)`;
      if (mode === LightColorMode.BlueIce) return `rgba(200, 240, 255, 0.9)`;
      
      const colors = ['#ff0000', '#00ff00', '#ffff00', '#0000ff'];
      return colors[index % colors.length];
    };

    const initTree = () => {
      particles = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height - 80; 

      // 0. Trunk
      const trunkHeight = 80;
      const trunkWidth = 40;
      const trunkStartY = 80 + treeHeight - 40; // Overlap slightly with bottom foliage

      for (let i = 0; i < 300; i++) {
          const xOffset = (Math.random() - 0.5) * trunkWidth;
          const y = trunkStartY + Math.random() * trunkHeight;
          // Cylinder shape approximation
          const z = (Math.random() - 0.5) * trunkWidth;
          
          particles.push({
              x: centerX + xOffset,
              y: y,
              z: z - 10, // Slightly behind center so front leaves cover it
              color: Math.random() > 0.6 ? '#2D1B13' : '#3E2723', // Dark bark texture
              size: 5 + Math.random() * 4,
              type: 'trunk',
              swayOffset: 0.02, // Sturdy
              baseX: centerX + xOffset,
              baseY: y
          });
      }

      // 1. Realistic Foliage (Pine Needles)
      // Use a cone distribution but with layers
      const layers = 24;
      for (let l = 0; l < layers; l++) {
        const layerProgress = l / layers; // 0 (top) to 1 (bottom)
        const y = 80 + layerProgress * treeHeight; // Start below top
        
        // Flare out curve: Top is narrow, bottom is wide
        const currentRadius = 10 + (layerProgress * treeBaseWidth * 0.5); 
        
        // Density increases downwards
        const count = 50 + (l * 40);

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          // Distribute points inside the cone volume, but biased to surface
          const r = Math.sqrt(Math.random()) * currentRadius;
          
          const xx = Math.cos(angle) * r;
          
          // Add some randomness to Y to blend layers
          const yy = (Math.random() - 0.5) * 20; 

          const z = Math.sin(angle) * r;

          // Deep Pine Green colors
          const brightness = 10 + Math.random() * 40; // Darker base
          const color = `rgb(${brightness}, ${brightness + 40 + Math.random() * 30}, ${brightness + 10})`;

          particles.push({
            x: centerX + xx,
            y: y + yy,
            z: z,
            color: color,
            size: 2 + Math.random() * 3, // Long needles
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
        const radius = 15 + (p * treeBaseWidth * 0.55); // Slightly wider than tree

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius + 5; // Pop out

        particles.push({
          x: centerX + x,
          y: y,
          z: z,
          color: '#FFD700', // Gold
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
         const p = Math.random(); // height progress
         // Avoid very top
         if (p < 0.1) continue;
         
         const y = 100 + p * treeHeight;
         const maxR = 10 + (p * treeBaseWidth * 0.45);
         const angle = Math.random() * Math.PI * 2;
         
         // Place on surface
         const x = Math.cos(angle) * maxR;
         const z = Math.sin(angle) * maxR + 2;

         particles.push({
            x: centerX + x,
            y: y,
            z: z,
            color: '#CC0000', // Deep Red
            size: 5 + Math.random() * 3,
            type: 'ornament',
            swayOffset: (1-p),
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
        const r = Math.random() * maxR; // Distributed throughout

        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;

        particles.push({
          x: centerX + x,
          y: y,
          z: z,
          color: 'white',
          size: 3,
          type: 'light',
          swayOffset: (1-p),
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
      particles.sort((a, b) => (a.z - b.z));
    };

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string) => {
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
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const wind = Math.sin(time) * 3;

      particles.forEach((p, i) => {
        // Sway logic
        const sway = wind * p.swayOffset;
        p.x = p.baseX + sway;

        if (p.type === 'trunk') {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.rect(p.x - p.size/2, p.y - p.size/2, p.size, p.size * 1.5);
            ctx.fill();
        } else if (p.type === 'leaf') {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.size, p.y + p.size * 2); 
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } else if (p.type === 'tinsel') {
            const shimmer = Math.sin(time * 5 + p.y) > 0 ? '#FFFFAA' : '#CCAA00';
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
                const blink = Math.sin(time * 4 + (p.blinkOffset || 0));
                if (blink > -0.2) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = getLightColor(colorMode, i);
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }
        } else if (p.type === 'star') {
             drawStar(p.x, p.y, 5, p.size, p.size/2, '#FFD700');
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const resize = () => {
        const parent = canvas.parentElement;
        if(parent) {
            canvas.width = parent.clientWidth;
            canvas.height = 750;
            initTree();
        }
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [lightsOn, colorMode]);

  return (
    <div className="w-full max-w-4xl mx-auto h-[750px] relative flex justify-center z-10">
        <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default Tree;