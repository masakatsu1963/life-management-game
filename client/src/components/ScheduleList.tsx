/**
 * ScheduleList.tsx
 * Design: Pastel Kawaii Life Manager
 * Soft card-style schedule items with cute status indicators
 */

import type { ScheduleItem } from "@/hooks/useScoreEngine";

interface Props {
  schedule: ScheduleItem[];
  currentTime: Date;
  onToggle: (id: string) => void;
}

export default function ScheduleList({ schedule, currentTime, onToggle }: Props) {
  const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();

  const sorted = [...schedule].sort((a, b) => {
    const [ah, am] = a.time.split(":").map(Number);
    const [bh, bm] = b.time.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((item) => {
        const [h, m] = item.time.split(":").map(Number);
        const itemMin = h * 60 + m;
        const isPast = itemMin < currentMin;
        const isCurrent = Math.abs(itemMin - currentMin) <= 30;

        let accent = "#c084f5";
        let accentBg = "rgba(192,132,245,0.08)";
        let accentBorder = "rgba(192,132,245,0.18)";
        let statusEmoji = "○";

        if (item.completed) {
          accent = "#34d399";
          accentBg = "rgba(52,211,153,0.08)";
          accentBorder = "rgba(52,211,153,0.20)";
          statusEmoji = "✓";
        } else if (isCurrent) {
          accent = "#c084f5";
          accentBg = "rgba(192,132,245,0.10)";
          accentBorder = "rgba(192,132,245,0.25)";
          statusEmoji = "★";
        } else if (isPast) {
          accent = "#fca5a5";
          accentBg = "rgba(252,165,165,0.07)";
          accentBorder = "rgba(252,165,165,0.18)";
          statusEmoji = "△";
        } else {
          accent = "#93c5fd";
          accentBg = "rgba(147,197,253,0.07)";
          accentBorder = "rgba(147,197,253,0.18)";
          statusEmoji = "○";
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

            {/* Status circle */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200"
              style={{
                background: item.completed ? accent : "rgba(255,255,255,0.8)",
                border: `1.5px solid ${accent}`,
                color: item.completed ? "#fff" : accent,
                boxShadow: item.completed ? `0 2px 8px ${accent}50` : "none",
                fontSize: "0.65rem",
              }}
            >
              {statusEmoji}
            </div>
          </button>
        );
      })}
    </div>
  );
}
