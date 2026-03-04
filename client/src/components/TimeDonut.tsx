/**
 * TimeDonut.tsx
 * Design: Pastel Kawaii Life Manager
 * 比較ドーナツチャート：
 *   左半分（上→左→下）= 理想バランス（カテゴリ均等配分）
 *   右半分（上→右→下）= 実績（今日の達成カウント）
 * 左右を見比べて傾向がわかる
 */

import { useEffect, useRef } from "react";
import type { ScheduleItem, ScheduleCategory } from "@/hooks/useScoreEngine";

interface TimeDonutProps {
  schedule: ScheduleItem[];
  currentTime: Date;
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

export default function TimeDonut({ schedule, size = 130 }: TimeDonutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

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

    // ── 左半分：理想バランス（均等 = 各1）
    // 左半円 = π/2 〜 3π/2（下→左→上）
    const idealSegments = CATS.map(cat => ({
      value: 1,
      color: CAT_COLORS[cat] + "bb",
    }));
    drawHalfDonut(ctx, cx, cy, outerR, innerR, Math.PI / 2, Math.PI, idealSegments, gapRad);

    // ── 右半分：実績（今日の達成数）
    // 右半円 = -π/2 〜 π/2（上→右→下）
    const actualSegments = CATS.map(cat => {
      const items = schedule.filter(s => s.category === cat);
      const completed = items.filter(s => s.completed).length;
      // タスクが設定されていない場合は薄いグレー
      if (items.length === 0) return { value: 1, color: "rgba(0,0,0,0.05)" };
      // 達成0でも薄く枠を表示
      return {
        value: Math.max(completed, 0.2),
        color: completed > 0 ? CAT_COLORS[cat] : CAT_COLORS[cat] + "28",
      };
    });
    drawHalfDonut(ctx, cx, cy, outerR, innerR, -Math.PI / 2, Math.PI, actualSegments, gapRad);

    // ── 中央の仕切り線（上下）
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR - 3);
    ctx.lineTo(cx, cy + outerR + 3);
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // ── 中央の白い円
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fill();

    // ── 中央テキスト
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 「理想」ラベル（左）
    ctx.font = `600 ${s * 0.072}px 'Noto Sans JP', sans-serif`;
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillText("理想", cx - outerR * 0.58, cy);

    // 「実績」ラベル（右）
    ctx.fillText("実績", cx + outerR * 0.58, cy);

    // 中央：今日の達成率
    const catItems = schedule.filter(s => CATS.includes(s.category as ScheduleCategory));
    const completedItems = catItems.filter(s => s.completed).length;
    const rate = catItems.length > 0 ? Math.round((completedItems / catItems.length) * 100) : 0;

    ctx.font = `bold ${s * 0.16}px 'Shippori Mincho', serif`;
    ctx.fillStyle = rate >= 70 ? "#34d399" : rate >= 40 ? "#c084f5" : "#f472b6";
    ctx.fillText(`${rate}%`, cx, cy - s * 0.035);

    ctx.font = `${s * 0.065}px 'Noto Sans JP', sans-serif`;
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillText("今日", cx, cy + s * 0.085);

  }, [schedule, size, dpr]);

  return (
    <div className="flex flex-col items-center gap-1">
      <canvas ref={canvasRef} style={{ display: "block" }} aria-label="理想vs実績比較ドーナツ" />
      {/* カテゴリ凡例 */}
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
