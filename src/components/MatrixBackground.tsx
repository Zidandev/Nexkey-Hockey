import { useEffect, useRef } from 'react';

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to occupy full parent container
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters pool
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0101abcdefghijklmnopqrstuvwxyz<>[]#@$%&*^+-={}/|';
    const characters = charset.split('');

    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);

    // Track vertical drop position of each column
    const drops: number[] = Array(columns).fill(1);

    let animationId: number;
    let tick = 0;

    const draw = () => {
      // Sub-translucent black rectangle to create trails of falling digits
      ctx.fillStyle = 'rgba(6, 6, 9, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Neon-matrix green drops
      ctx.fillStyle = '#00ff66';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Pick random character
        const char = characters[Math.floor(Math.random() * characters.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Make some droplets glowing cyan for the "Nexus" accent
        if (Math.random() > 0.96) {
          ctx.fillStyle = '#00ffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00ffff';
        } else {
          ctx.fillStyle = '#00ff66';
          ctx.shadowBlur = 0;
        }

        ctx.fillText(char, x, y);

        // Reset column back to top randomly or keep falling
        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33); // ~30 fps is quiet and smooth

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="matrix-ambient-canvas"
      className="fixed inset-0 -z-50 opacity-25 pointer-events-none block"
    />
  );
}
