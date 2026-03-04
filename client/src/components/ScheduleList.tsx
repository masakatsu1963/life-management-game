/**
 * ScheduleList.tsx
 * Design: Pastel Kawaii Life Manager
 * タスク達成ポイント付きスケジュールリスト
 */

import type { ScheduleItem } from "@/hooks/useScoreEngine";

interface Props {
  schedule: ScheduleItem[];
  currentTime: Date;
  onToggle: (id: string) => void;
}

// タスク1件あたりのポイント（均等配分）
function getPointPerTask(total: number): number {
  if (total === 0) return 0;
  return Math.round(100 / total);
}

export default function ScheduleList({ schedule, currentTime, onToggle }: Props) {
  const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();

  const sorted = [...schedule].sort((a, b) => {
    const [ah, am] = a.time.split(":").map(Number);
    const [bh, bm] = b.time.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });

  const completedCount = schedule.filter(s => s.completed).length;
  const totalCount = schedule.length;
  const pointPerTask = getPointPerTask(totalCount);
  const earnedPoints = completedCount * pointPerTask;
  const achievementRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      {/* 達成サマリーバー */}
      {totalCount > 0 && (
        <div
          className="rounded-2xl px-3 py-2.5 mb-1"
          style={{ background: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(52,211,153,0.20)" }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🎯</span>
              <span className="text-xs font-bold" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)" }}>
                タスク達成
              </span>
              <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.30)" }}>
                {completedCount}/{totalCount} 完了
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "'Shippori Mincho', serif", color: completedCount === totalCount ? "#34d399" : "#c084f5" }}
              >
                {earnedPoints}
              </span>
              <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.35)" }}>
                / 100 pt
              </span>
            </div>
          </div>
          {/* 達成率バー */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${achievementRate}%`,
                background: completedCount === totalCount
                  ? "linear-gradient(90deg, #34d39988, #34d399)"
                  : "linear-gradient(90deg, #c084f588, #c084f5)",
                boxShadow: completedCount === totalCount ? "0 0 6px rgba(52,211,153,0.5)" : "0 0 6px rgba(192,132,245,0.5)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.28)", fontSize: "0.6rem" }}>
              1件 = {pointPerTask}pt
            </span>
            <span className="text-xs font-bold" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: completedCount === totalCount ? "#34d399" : "#c084f5", fontSize: "0.6rem" }}>
              {achievementRate}%
            </span>
          </div>
        </div>
      )}

      {/* スケジュールアイテム */}
      {sorted.map((item) => {
        const [h, m] = item.time.split(":").map(Number);
        const itemMin = h * 60 + m;
        const isPast = itemMin < currentMin;
        const isCurrent = Math.abs(itemMin - currentMin) <= 30;

        let accent = "#c084f5";
        let accentBg = "rgba(192,132,245,0.08)";
        let accentBorder = "rgba(192,132,245,0.18)";
        let statusEmoji = "○";
        let statusLabel = "予定";

        if (item.completed) {
          accent = "#34d399";
          accentBg = "rgba(52,211,153,0.08)";
          accentBorder = "rgba(52,211,153,0.20)";
          statusEmoji = "✓";
          statusLabel = "達成";
        } else if (isCurrent) {
          accent = "#c084f5";
          accentBg = "rgba(192,132,245,0.10)";
          accentBorder = "rgba(192,132,245,0.30)";
          statusEmoji = "★";
          statusLabel = "進行中";
        } else if (isPast) {
          accent = "#fca5a5";
          accentBg = "rgba(252,165,165,0.07)";
          accentBorder = "rgba(252,165,165,0.18)";
          statusEmoji = "△";
          statusLabel = "未達成";
        } else {
          accent = "#93c5fd";
          accentBg = "rgba(147,197,253,0.07)";
          accentBorder = "rgba(147,197,253,0.18)";
          statusEmoji = "○";
          statusLabel = "予定";
        }

        return (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: accentBg, border: `1.5px solid ${accentBorder}` }}
          >
            {/* Time */}
            <span
              className="text-xs font-bold shrink-0 w-10"
              style={{ fontFamily: "'Shippori Mincho', serif", color: accent }}
            >
              {item.time}
            </span>

            {/* Activity */}
            <div className="flex flex-col flex-1 min-w-0">
              <span
                className="text-sm font-medium truncate"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  color: item.completed ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.70)",
                  textDecoration: item.completed ? "line-through" : "none",
                }}
              >
                {item.activity}
              </span>
              <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.30)" }}>
                📍 {item.location}
              </span>
            </div>

            {/* ポイント表示 */}
            <div className="flex flex-col items-center shrink-0 gap-0.5">
              <div
                className="flex items-baseline gap-0.5"
                style={{ opacity: item.completed ? 1 : 0.4 }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: "'Shippori Mincho', serif", color: accent }}
                >
                  {item.completed ? `+${pointPerTask}` : `${pointPerTask}`}
                </span>
                <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.3)", fontSize: "0.55rem" }}>pt</span>
              </div>
              {/* Status circle */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                style={{
                  background: item.completed ? accent : "rgba(255,255,255,0.8)",
                  border: `1.5px solid ${accent}`,
                  color: item.completed ? "#fff" : accent,
                  boxShadow: item.completed ? `0 2px 8px ${accent}50` : "none",
                  fontSize: "0.6rem",
                }}
              >
                {statusEmoji}
              </div>
            </div>
          </button>
        );
      })}

      {/* 全完了メッセージ */}
      {totalCount > 0 && completedCount === totalCount && (
        <div
          className="rounded-2xl px-3 py-2.5 text-center"
          style={{ background: "rgba(52,211,153,0.08)", border: "1.5px solid rgba(52,211,153,0.25)" }}
        >
          <span className="text-sm" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#34d399" }}>
            🎉 全タスク達成！ +100pt 獲得
          </span>
        </div>
      )}
    </div>
  );
}
