/**
 * WeeklyDonut.tsx
 * Design: Pastel Kawaii Life Manager
 * 週間比較ドーナツ：
 *   左半円 = 理想バランス（均等配分）
 *   右半円 = 7日間累積実績（LocalStorageのweeklyLogから集計）
 */

import { useEffect, useRef, useState } from "react";
import type { ScheduleItem, ScheduleCategory } from "@/hooks/useScoreEngine";
import { loadWeeklyLog, calcWeeklyStats } from "@/hooks/useScoreEngine";

interface Props {
  schedule: ScheduleItem[];
  size?: number;
}

const CATS: ScheduleCategory[] = ["wakeup","pre_work","commute_learn","break","return_learn","pre_sleep"];

const CAT_COLORS: Record<string, string> = {
  wakeup:        "#fbbf24",
  pre_work:      "#f472b6",
  commute_learn: "#60a5fa",
  break:         "#34d399",
  return_learn:  "#a78bfa",
  pre_sleep:     "#c084f5",
};

function drawHalfDonut(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  halfSpan: number,
  segments: { value: number; color: string }[],
  gapRad: number
) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, startAngle + halfSpan);
    ctx.arc(cx, cy, innerR, startAngle + halfSpan, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fill();
    return;
  }
  let angle = startAngle;
  for (const seg of segments) {
    if (seg.value <= 0) continue;
    const span = (seg.value / total) * halfSpan;
    const a0 = angle + gapRad / 2;
    const a1 = angle + span - gapRad / 2;
    if (a1 > a0) {
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, a0, a1);
      ctx.arc(cx, cy, innerR, a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
    }
    angle += span;
  }
}

export default function WeeklyDonut({ schedule, size = 130 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const [weeklyStats, setWeeklyStats] = useState<
    Record<string, { totalItems: number; completedItems: number; rate: number }>
  >({});

  useEffect(() => {
    const logs = loadWeeklyLog();
    const stats = calcWeeklyStats(logs);
    setWeeklyStats(stats);
  }, [schedule]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = size;
    canvas.width = s * dpr;
    canvas.height = s * dpr;
    canvas.style.width = `${s}px`;
    canvas.style.height = `${s}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, s, s);

    const cx = s / 2;
    const cy = s / 2;
    const outerR = s * 0.46;
    const innerR = s * 0.27;
    const gapRad = 0.05;

    // 左半分：理想バランス（均等）
    const idealSegments = CATS.map(cat => ({
      value: 1,
      color: CAT_COLORS[cat] + "bb",
    }));
    drawHalfDonut(ctx, cx, cy, outerR, innerR, Math.PI / 2, Math.PI, idealSegments, gapRad);

    // 右半分：7日間累積実績
    const actualSegments = CATS.map(cat => {
      const stat = weeklyStats[cat];
      // 今日分も加算
      const todayItems = schedule.filter(s => s.category === cat);
      const todayCompleted = todayItems.filter(s => s.completed).length;
      const totalCompleted = (stat?.completedItems ?? 0) + todayCompleted;
      const totalItems = (stat?.totalItems ?? 0) + todayItems.length;

      if (totalItems === 0) return { value: 1, color: "rgba(0,0,0,0.04)" };
      return {
        value: Math.max(totalCompleted, 0.2),
        color: totalCompleted > 0 ? CAT_COLORS[cat] : CAT_COLORS[cat] + "28",
      };
    });
    drawHalfDonut(ctx, cx, cy, outerR, innerR, -Math.PI / 2, Math.PI, actualSegments, gapRad);

    // 仕切り線
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR - 3);
    ctx.lineTo(cx, cy + outerR + 3);
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 中央の白い円
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fill();

    // ラベル
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${s * 0.072}px 'Noto Sans JP', sans-serif`;
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillText("理想", cx - outerR * 0.58, cy);
    ctx.fillText("実績", cx + outerR * 0.58, cy);

    // 週間達成率
    const allStats = Object.values(weeklyStats);
    const totalCompleted = allStats.reduce((s, v) => s + v.completedItems, 0)
      + schedule.filter(s => CATS.includes(s.category as ScheduleCategory) && s.completed).length;
    const totalItems = allStats.reduce((s, v) => s + v.totalItems, 0)
      + schedule.filter(s => CATS.includes(s.category as ScheduleCategory)).length;
    const rate = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

    ctx.font = `bold ${s * 0.16}px 'Shippori Mincho', serif`;
    ctx.fillStyle = rate >= 70 ? "#34d399" : rate >= 40 ? "#c084f5" : "#f472b6";
    ctx.fillText(`${rate}%`, cx, cy - s * 0.035);

    ctx.font = `${s * 0.065}px 'Noto Sans JP', sans-serif`;
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillText("今週", cx, cy + s * 0.085);

  }, [weeklyStats, schedule, size, dpr]);

  return (
    <div className="flex flex-col items-center gap-1">
      <canvas ref={canvasRef} style={{ display: "block" }} aria-label="週間理想vs実績比較ドーナツ" />
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
        {CATS.map(cat => {
          const labels: Record<string, string> = {
            wakeup: "起床", pre_work: "出勤前", commute_learn: "通勤",
            break: "休憩", return_learn: "帰宅", pre_sleep: "就寝前",
          };
          return (
            <div key={cat} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: CAT_COLORS[cat] }} />
              <span style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.38)", fontSize: "0.55rem" }}>
                {labels[cat]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
