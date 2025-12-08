import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FlickeringGridProps {
  className?: string;
  squareSize?: number;
  gridGap?: number;
  color?: string;
  maxOpacity?: number;
  flickerChance?: number;
}

export function FlickeringGrid({
  className,
  squareSize = 4,
  gridGap = 6,
  color = 'hsl(262, 83%, 58%)',
  maxOpacity = 0.3,
  flickerChance = 0.3,
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const squares: { x: number; y: number; opacity: number; targetOpacity: number }[] = [];
    const cols = Math.ceil(canvas.width / (squareSize + gridGap));
    const rows = Math.ceil(canvas.height / (squareSize + gridGap));

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        squares.push({
          x: i * (squareSize + gridGap),
          y: j * (squareSize + gridGap),
          opacity: Math.random() * maxOpacity,
          targetOpacity: Math.random() * maxOpacity,
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      squares.forEach(square => {
        if (Math.random() < flickerChance * 0.01) {
          square.targetOpacity = Math.random() * maxOpacity;
        }

        square.opacity += (square.targetOpacity - square.opacity) * 0.1;

        ctx.fillStyle = color.replace(')', `, ${square.opacity})`).replace('hsl', 'hsla');
        ctx.fillRect(square.x, square.y, squareSize, squareSize);
      });

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [squareSize, gridGap, color, maxOpacity, flickerChance]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
    />
  );
}
