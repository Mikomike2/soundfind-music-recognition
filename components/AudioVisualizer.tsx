'use client';

import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
  isProcessing: boolean;
  frequencyData?: Uint8Array | null;
  volume?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isListening,
  isProcessing,
  frequencyData,
  volume = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isListening && frequencyData && frequencyData.length > 0) {
        // Draw real-time frequency spectrum
        const barCount = 36;
        const step = Math.floor(frequencyData.length / barCount);
        const barWidth = (width / barCount) * 0.65;
        const gap = (width - barCount * barWidth) / (barCount + 1);

        for (let i = 0; i < barCount; i++) {
          const rawVal = frequencyData[i * step] || 0;
          // Scale bar height dynamically
          const normalized = Math.max(0.08, rawVal / 255);
          const barHeight = normalized * (height * 0.85);

          const x = gap + i * (barWidth + gap);
          const y = (height - barHeight) / 2;

          // Gradient color: purple -> indigo -> cyan
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          const hueRatio = i / barCount;
          gradient.addColorStop(0, `rgba(168, 85, 247, 0.9)`); // purple-500
          gradient.addColorStop(0.5, `rgba(129, 140, 248, 0.95)`); // indigo-400
          gradient.addColorStop(1, `rgba(6, 182, 212, 0.9)`); // cyan-500

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 4, 4]);
          ctx.fill();
        }
      } else if (isProcessing) {
        // Futuristic radar scanning wave
        phase += 0.08;
        const barCount = 36;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width - barCount * barWidth) / (barCount + 1);

        for (let i = 0; i < barCount; i++) {
          const sinVal = Math.sin(phase + (i / barCount) * Math.PI * 4);
          const normalized = (sinVal + 1) / 2;
          const barHeight = (0.2 + normalized * 0.6) * (height * 0.8);

          const x = gap + i * (barWidth + gap);
          const y = (height - barHeight) / 2;

          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, 'rgba(236, 72, 153, 0.9)'); // pink
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0.9)'); // purple

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 4, 4]);
          ctx.fill();
        }
      } else {
        // Idle gentle breathing wave
        phase += 0.03;
        const barCount = 36;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width - barCount * barWidth) / (barCount + 1);

        for (let i = 0; i < barCount; i++) {
          const sinVal = Math.sin(phase + (i / barCount) * Math.PI * 2);
          const barHeight = (0.12 + Math.abs(sinVal) * 0.15) * height;

          const x = gap + i * (barWidth + gap);
          const y = (height - barHeight) / 2;

          ctx.fillStyle = 'rgba(148, 163, 184, 0.25)'; // slate-400 subtle
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 3, 3]);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isProcessing, frequencyData, volume]);

  return (
    <div className="w-full max-w-lg mx-auto h-20 flex items-center justify-center px-4 relative">
      <canvas
        ref={canvasRef}
        width={480}
        height={80}
        className="w-full h-full max-w-md drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]"
      />
    </div>
  );
};
