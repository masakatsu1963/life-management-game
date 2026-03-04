/**
 * TimeDonut.tsx
 * Design: Pastel Kawaii Life Manager
 * Soft pastel donut chart for 24h schedule visualization
 */

import { useEffect, useRef } from "react";
import type { ScheduleItem } from "@/hooks/useScoreEngine";

interface TimeDonutProps {
  schedule: ScheduleItem[];
  currentTime: Date;
  size?: number;
}

interface TimeBlock {
  startMin: number;
  endMin: number;
  label: string;
  completed: boolean;
}

function buildTimeBlocks(schedule: ScheduleItem[]): TimeBlock[] {
  const sorted = [...schedule].sort((a, b) => {
    const [ah, am] = a.time.split(":").map(Number);
    const [bh, bm] = b.time.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });
  const blocks: TimeBlock[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const [sh, sm] = sorted[i].time.split(":").map(Number);
    const startMin = sh * 60 + sm;
    let endMin: number;
    if (i < sorted.length - 1) {
      const [eh, em] = sorted[i + 1].time.split(":").map(Number);
      endMin = eh * 60 + em;
    } else {
      endMin = 24 * 60;
    }
    blocks.push({ startMin, endMin, label: sorted[i].activity, completed: sorted[i].completed });
  }
  return blocks;
}

export default function TimeDonut({ schedule, currentTime, size = 160 }: TimeDonutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size * 0.44;
    const innerR = size * 0.28;
    const trackW = outerR - innerR;

    ctx.clearRect(0, 0, size, size);

    const totalMin = 24 * 60;
    const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();
    const blocks = buildTimeBlocks(schedule);

    // Background ring
    ctx.beginPath();
    ctx.arc(cx, cy, (outerR + innerR) / 2, 0, Math.PI * 2);
    ctx.lineWidth = trackW;
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.stroke();

    // Schedule blocks
    for (const block of blocks) {
      const startAngle = (block.startMin / totalMin) * Math.PI * 2 - Math.PI / 2;
      const endAngle = (block.endMin / totalMin) * Math.PI * 2 - Math.PI / 2;
      const isPast = block.endMin <= currentMin;
      const isCurrent = block.startMin <= currentMin && block.endMin > currentMin;

      let color: string;
      if (block.completed) {
        color = "rgba(110,231,183,0.85)";  // mint green
      } else if (isPast) {
        color = "rgba(252,165,165,0.75)";  // soft rose
      } else if (isCurrent) {
        color = "rgba(216,180,254,0.85)";  // lavender
      } else {
        color = "rgba(147,197,253,0.55)";  // sky blue
      }

      ctx.beginPath();
      ctx.arc(cx, cy, (outerR + innerR) / 2, startAngle, endAngle);
      ctx.lineWidth = trackW - 2;
      ctx.strokeStyle = color;
      ctx.stroke();
    }

    // Current time dot
    const nowAngle = (currentMin / totalMin) * Math.PI * 2 - Math.PI / 2;
    const tx = cx + Math.cos(nowAngle) * outerR;
    const ty = cy + Math.sin(nowAngle) * outerR;

    ctx.beginPath();
    ctx.arc(tx, ty, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#f472b6";
    ctx.shadowColor = "#f472b6";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Center: soft white circle
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();

    // Time text
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const mins = currentTime.getMinutes().toString().padStart(2, "0");
    ctx.font = `700 ${size * 0.14}px 'Shippori Mincho', serif`;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${hours}:${mins}`, cx, cy - size * 0.04);

    ctx.font = `400 ${size * 0.07}px 'Noto Sans JP', sans-serif`;
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillText("現在時刻", cx, cy + size * 0.12);

  }, [schedule, currentTime, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block" }}
      aria-label="24時間スケジュール円グラフ"
    />
  );
}
