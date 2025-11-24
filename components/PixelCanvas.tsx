
import React, { useRef, useEffect } from 'react';

interface Figure {
  x: number;
  y: number;
  speed: number;
  direction: 1 | -1;
  state: 'walk' | 'idle';
  timer: number;
  variant: number; // To slightly vary height/style
  chatTimer: number; // Random offset for chat bubbles
}

export const PixelCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scale factor: 1 logical pixel = 4 screen pixels
  const PIXEL_SCALE = 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crucial for pixel art look
    ctx.imageSmoothingEnabled = false;

    let figures: Figure[] = [];
    let skyline: { x: number, w: number, h: number }[] = [];
    let animationId: number;

    // Initialize figures based on low-res width
    const initFigures = (w: number, h: number) => {
        const count = Math.max(3, Math.floor(w / 25)); // Density adjusted
        figures = [];
        for(let i = 0; i < count; i++) {
            figures.push({
                x: Math.random() * w,
                y: h - 2, // Ground level in low-res coords
                speed: 0.15 + Math.random() * 0.25,
                direction: Math.random() > 0.5 ? 1 : -1,
                state: Math.random() > 0.6 ? 'idle' : 'walk',
                timer: Math.random() * 200,
                variant: Math.floor(Math.random() * 3),
                chatTimer: Math.random() * 10000
            });
        }
    };

    // Generate Random City Skyline (Static Background)
    const initSkyline = (w: number, h: number) => {
        skyline = [];
        let x = 0;
        while(x < w) {
            const buildingW = 5 + Math.random() * 15;
            const buildingH = 10 + Math.random() * 20;
            skyline.push({ x, w: buildingW, h: buildingH });
            x += buildingW + (Math.random() * 5); // Gap between buildings
        }
    };

    const resize = () => {
        // Set internal resolution to be small
        canvas.width = Math.ceil(container.clientWidth / PIXEL_SCALE);
        canvas.height = Math.ceil(container.clientHeight / PIXEL_SCALE);
        ctx.imageSmoothingEnabled = false; // Reset on resize
        initFigures(canvas.width, canvas.height);
        initSkyline(canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    // Helper to draw a pixel point
    const drawPixel = (x: number, y: number) => {
        ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    };

    // Helper to draw a line of pixels (Bresenham-ish)
    const drawLine = (x0: number, y0: number, x1: number, y1: number) => {
        x0 = Math.round(x0); y0 = Math.round(y0);
        x1 = Math.round(x1); y1 = Math.round(y1);
        
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while(true) {
            drawPixel(x0, y0);
            if ((x0 === x1) && (y0 === y1)) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    };

    const drawCity = (w: number, h: number) => {
        const isDark = document.documentElement.classList.contains('dark');
        // Very subtle gray for background city
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        
        skyline.forEach(b => {
            const by = h - 2 - b.h;
            ctx.fillRect(Math.round(b.x), Math.round(by), Math.round(b.w), Math.round(b.h));
            
            // Random "windows" (static noise on buildings)
            if (Math.random() > 0.99) {
                 // Tiny flicker
                 ctx.fillStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                 ctx.fillRect(Math.round(b.x + 2), Math.round(by + 2), 1, 1);
                 // Restore fill style
                 ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            }
        });
    };

    const drawFigure = (f: Figure, time: number) => {
        const isDark = document.documentElement.classList.contains('dark');
        
        // 1. Draw Figure (Reverted to High Contrast Black/White)
        ctx.fillStyle = isDark ? '#ffffff' : '#000000';

        const animOffset = (f.state === 'walk' && Math.floor(time / 200) % 2 === 0) ? 1 : 0;
        
        // Position in low-res space
        let px = Math.round(f.x);
        let py = Math.round(f.y);

        // Height variation (Reduced base height from 6 to 5 for smaller look)
        const h = 5 + f.variant; 

        // HEAD
        const headY = py - h - 2;
        ctx.fillRect(px - 1, headY, 3, 1); // Top cap
        ctx.fillRect(px - 1, headY + 1, 3, 1); // Face
        
        // BODY
        drawLine(px, headY + 2, px, py - 3);

        // ARMS
        const armY = headY + 3;
        if (f.state === 'walk') {
            // Swing arms
            const swing = animOffset ? 2 : -2;
            drawLine(px, armY, px - (f.direction * swing), armY + 2);
            drawLine(px, armY, px + (f.direction * swing), armY + 2);
        } else {
            // Idle arms down
            drawLine(px, armY, px - 2, armY + 2);
            drawLine(px, armY, px + 2, armY + 2);
        }

        // LEGS
        const legY = py - 3;
        if (f.state === 'walk') {
            const stride = animOffset ? 2 : 0;
            drawLine(px, legY, px - 2 + stride, py);
            drawLine(px, legY, px + 2 - stride, py);
        } else {
            drawLine(px, legY, px - 1, py);
            drawLine(px, legY, px + 1, py);
        }

        // 2. Draw Chat Bubble (High Contrast)
        if (f.state === 'idle') {
            // Bubble visibility cycle
            const cycle = Math.floor((time + f.chatTimer) / 2000) % 3;
            if (cycle === 0) {
                // Ensure bubble is also high contrast
                ctx.fillStyle = isDark ? '#ffffff' : '#000000';
                
                const bw = 11; // Wider bubble
                const bh = 7;
                
                // Position bubble slightly to the right and above head
                const bx = px + 2; 
                const by = headY - 9;
                
                // Outline
                // Top
                ctx.fillRect(bx + 1, by, bw - 2, 1); 
                // Bottom
                ctx.fillRect(bx + 1, by + bh - 1, bw - 2, 1); 
                // Left
                ctx.fillRect(bx, by + 1, 1, bh - 2); 
                // Right
                ctx.fillRect(bx + bw - 1, by + 1, 1, bh - 2); 
                
                // Sharp bottom-left corner connecting to tail
                ctx.fillRect(bx, by + bh - 1, 1, 1);

                // Tail (Asymmetric - bottom left step down)
                ctx.fillRect(bx + 1, by + bh, 1, 1);
                ctx.fillRect(bx, by + bh + 1, 1, 1);
                
                // Typing Dots Animation inside bubble
                const dots = Math.floor(time / 400) % 4;
                const dotY = by + 3;
                
                if (dots >= 0) ctx.fillRect(bx + 2, dotY, 1, 1);
                if (dots >= 1) ctx.fillRect(bx + 5, dotY, 1, 1);
                if (dots >= 2) ctx.fillRect(bx + 8, dotY, 1, 1);
            }
        }
    };

    const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw Skyline first (background)
        drawCity(canvas.width, canvas.height);

        const time = Date.now();

        figures.forEach(f => {
            // Update State
            f.timer--;
            if (f.timer <= 0) {
                if (f.state === 'walk') {
                    f.state = 'idle';
                    f.timer = 100 + Math.random() * 150;
                } else {
                    f.state = 'walk';
                    f.direction = Math.random() > 0.5 ? 1 : -1;
                    f.timer = 100 + Math.random() * 300;
                }
            }

            // Update Position
            if (f.state === 'walk') {
                f.x += f.speed * f.direction;
                if (f.x < 2) { f.x = 2; f.direction = 1; }
                if (f.x > canvas.width - 2) { f.x = canvas.width - 2; f.direction = -1; }
            }

            drawFigure(f, time);
        });

        animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
        {/* Canvas scaled up with pixelated rendering */}
        <canvas 
            ref={canvasRef} 
            className="block w-full h-full" 
            style={{ imageRendering: 'pixelated' }}
        />
    </div>
  );
};
