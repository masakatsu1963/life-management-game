/**
 * GaugeMeter.tsx
 * Design: Dark Gaming Gauge - Half-circle needle meter
 * Canvas-based real-time gauge with animated needle
 * Score 0-100, color-coded: red(0-40) → yellow(40-70) → green(70-100)
 */

import { useEffect, useRef, useCallback } from "react";

interface GaugeMeterProps {
  score: number;        // 0-100
  label?: string;
  size?: number;        // canvas width in px
  animated?: boolean;
}

function scoreToColor(score: number): string {
  if (score >= 70) return "#22d97a";   // green
  if (score >= 40) return "#f0b429";   // yellow
  return "#f05252";                     // red
}

function scoreToAngle(score: number): number {
  // Maps 0-100 to -180deg to 0deg (left to right semicircle)
  // Returns angle in radians from the left (π = 180°)
  return Math.PI - (score / 100) * Math.PI;
}

export default function GaugeMeter({
  score,
  label = "生活効率スコア",
  size = 300,
  animated = true,
}: GaugeMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const currentAngleRef = useRef<number>(Math.PI); // start at left (score=0)
  const targetAngleRef = useRef<number>(scoreToAngle(score));

  const draw = useCallback((angle: number, currentScore: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const cx = w / 2;
    const cy = h * 0.72; // center slightly below midpoint
    const outerR = w * 0.44;
    const innerR = w * 0.32;
    const needleR = outerR * 0.92;

    ctx.clearRect(0, 0, w * dpr, h * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    // === Background arc (track) ===
    const trackWidth = outerR - innerR;

    // Draw colored segments
    const segments = [
      { from: Math.PI, to: Math.PI * 1.4, color: "rgba(240,82,82,0.25)" },      // red zone
      { from: Math.PI * 1.4, to: Math.PI * 1.7, color: "rgba(240,180,41,0.25)" }, // yellow zone
      { from: Math.PI * 1.7, to: Math.PI * 2, color: "rgba(34,217,122,0.25)" },  // green zone
    ];

    for (const seg of segments) {
      ctx.beginPath();
      ctx.arc(cx, cy, outerR - trackWidth / 2, seg.from, seg.to);
      ctx.lineWidth = trackWidth;
      ctx.strokeStyle = seg.color;
      ctx.stroke();
    }

    // Tick marks
    const tickCount = 10;
    for (let i = 0; i <= tickCount; i++) {
      const tickAngle = Math.PI + (i / tickCount) * Math.PI;
      const isMajor = i % 2 === 0;
      const tickLen = isMajor ? 10 : 6;
      const tickR = outerR + 4;
      const x1 = cx + Math.cos(tickAngle) * tickR;
      const y1 = cy + Math.sin(tickAngle) * tickR;
      const x2 = cx + Math.cos(tickAngle) * (tickR + tickLen);
      const y2 = cy + Math.sin(tickAngle) * (tickR + tickLen);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.strokeStyle = isMajor ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)";
      ctx.stroke();

      // Labels for major ticks
      if (isMajor) {
        const labelVal = i * 10;
        const labelR = tickR + tickLen + 14;
        const lx = cx + Math.cos(tickAngle) * labelR;
        const ly = cy + Math.sin(tickAngle) * labelR;
        ctx.font = `bold ${w * 0.028}px Orbitron, monospace`;
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(labelVal), lx, ly);
      }
    }

    // === Active arc (filled up to current score) ===
    const activeColor = scoreToColor(currentScore);
    const activeAngle = Math.PI + (currentScore / 100) * Math.PI;

    // Gradient for active arc
    const grad = ctx.createLinearGradient(cx - outerR, cy, cx + outerR, cy);
    grad.addColorStop(0, "#f05252");
    grad.addColorStop(0.4, "#f0b429");
    grad.addColorStop(1, "#22d97a");

    ctx.beginPath();
    ctx.arc(cx, cy, outerR - trackWidth / 2, Math.PI, activeAngle);
    ctx.lineWidth = trackWidth;
    ctx.strokeStyle = grad;
    ctx.lineCap = "round";
    ctx.stroke();

    // Glow on active arc
    ctx.beginPath();
    ctx.arc(cx, cy, outerR - trackWidth / 2, Math.PI, activeAngle);
    ctx.lineWidth = trackWidth * 0.4;
    ctx.strokeStyle = activeColor + "55";
    ctx.stroke();

    // === Needle ===
    const nx = cx + Math.cos(angle) * needleR;
    const ny = cy + Math.sin(angle) * needleR;

    // Needle shadow
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.lineWidth = 3;
    ctx.strokeStyle = activeColor;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Needle base circle
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = activeColor;
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#0d1020";
    ctx.fill();

    // === Score text ===
    const scoreInt = Math.round(currentScore);
    ctx.font = `900 ${w * 0.18}px Orbitron, monospace`;
    ctx.fillStyle = activeColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 20;
    ctx.fillText(String(scoreInt), cx, cy - outerR * 0.15);
    ctx.shadowBlur = 0;

    // Label
    ctx.font = `500 ${w * 0.045}px 'Noto Sans JP', sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(label, cx, cy + outerR * 0.12);

    // Level badge
    const level = Math.floor(currentScore);
    ctx.font = `700 ${w * 0.038}px Orbitron, monospace`;
    ctx.fillStyle = activeColor + "cc";
    ctx.fillText(`Lv.${level}`, cx, cy + outerR * 0.28);

    ctx.restore();
  }, [label]);

  // Animate needle to target
  useEffect(() => {
    targetAngleRef.current = scoreToAngle(score);

    if (!animated) {
      currentAngleRef.current = targetAngleRef.current;
      draw(currentAngleRef.current, score);
      return;
    }

    const animate = () => {
      const current = currentAngleRef.current;
      const target = targetAngleRef.current;
      const diff = target - current;

      if (Math.abs(diff) < 0.001) {
        currentAngleRef.current = target;
        draw(target, score);
        return;
      }

      // Smooth easing
      currentAngleRef.current = current + diff * 0.08;
      // Interpolate display score from angle
      const displayScore = ((Math.PI - currentAngleRef.current) / Math.PI) * 100;
      draw(currentAngleRef.current, Math.max(0, Math.min(100, displayScore)));
      animRef.current = requestAnimationFrame(animate);
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [score, animated, draw]);

  // Handle DPR and resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = (size * 0.65) * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 0.65}px`;
    draw(currentAngleRef.current, score);
  }, [size, draw, score]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", margin: "0 auto" }}
      aria-label={`${label}: ${Math.round(score)}点`}
    />
  );
}
