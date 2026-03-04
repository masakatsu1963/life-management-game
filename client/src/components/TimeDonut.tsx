/**
 * TimeDonut.tsx
 * Design: Dark Gaming Gauge - 24h donut chart
 * Shows ideal (blue) vs actual (red) time distribution
 * Canvas-based for performance
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

    blocks.push({
      startMin,
      endMin,
      label: sorted[i].activity,
      completed: sorted[i].completed,
    });
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

    ctx.clearRect(0, 0, size, size);

    const totalMin = 24 * 60;
    const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();
    const blocks = buildTimeBlocks(schedule);

    // Draw background ring
    ctx.beginPath();
    ctx.arc(cx, cy, (outerR + innerR) / 2, 0, Math.PI * 2);
    ctx.lineWidth = outerR - innerR;
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.stroke();

    // Draw schedule blocks
    for (const block of blocks) {
      const startAngle = (block.startMin / totalMin) * Math.PI * 2 - Math.PI / 2;
      const endAngle = (block.endMin / totalMin) * Math.PI * 2 - Math.PI / 2;
      const isPast = block.endMin <= currentMin;
      const isCurrent = block.startMin <= currentMin && block.endMin > currentMin;

      let color: string;
      if (block.completed) {
        color = "rgba(34,217,122,0.85)"; // green - completed
      } else if (isPast) {
        color = "rgba(240,82,82,0.70)"; // red - missed
      } else if (isCurrent) {
        color = "rgba(240,180,41,0.85)"; // yellow - current
      } else {
        color = "rgba(96,165,250,0.50)"; // blue - upcoming ideal
      }

      ctx.beginPath();
      ctx.arc(cx, cy, (outerR + innerR) / 2, startAngle, endAngle);
      ctx.lineWidth = outerR - innerR - 2;
      ctx.strokeStyle = color;
      ctx.stroke();
    }

    // Current time indicator
    const nowAngle = (currentMin / totalMin) * Math.PI * 2 - Math.PI / 2;
    const tx = cx + Math.cos(nowAngle) * outerR;
    const ty = cy + Math.sin(nowAngle) * outerR;

    ctx.beginPath();
    ctx.arc(tx, ty, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Center text
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const mins = currentTime.getMinutes().toString().padStart(2, "0");
    ctx.font = `bold ${size * 0.14}px Orbitron, monospace`;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${hours}:${mins}`, cx, cy - size * 0.04);

    ctx.font = `${size * 0.07}px 'Noto Sans JP', sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
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
