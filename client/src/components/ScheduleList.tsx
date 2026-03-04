/**
 * ScheduleList.tsx
 * Design: Dark Gaming Gauge - Schedule activity list
 * Shows today's schedule with completion toggles
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
    <div className="flex flex-col gap-1.5">
      {sorted.map((item) => {
        const [h, m] = item.time.split(":").map(Number);
        const itemMin = h * 60 + m;
        const isPast = itemMin < currentMin;
        const isCurrent = Math.abs(itemMin - currentMin) <= 30;

        let statusColor = "rgba(255,255,255,0.2)";
        let borderColor = "rgba(255,255,255,0.08)";
        if (item.completed) {
          statusColor = "#22d97a";
          borderColor = "rgba(34,217,122,0.25)";
        } else if (isCurrent) {
          statusColor = "#f0b429";
          borderColor = "rgba(240,180,41,0.25)";
        } else if (isPast) {
          statusColor = "#f05252";
          borderColor = "rgba(240,82,82,0.15)";
        }

        return (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 hover:bg-white/5 active:scale-98"
            style={{
              background: isCurrent ? "rgba(240,180,41,0.06)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${borderColor}`,
            }}
          >
            {/* Time */}
            <span
              className="text-xs font-bold shrink-0 w-10"
              style={{ fontFamily: "Orbitron, monospace", color: statusColor }}
            >
              {item.time}
            </span>

            {/* Activity info */}
            <div className="flex flex-col flex-1 min-w-0">
              <span
                className="text-sm font-medium truncate"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  color: item.completed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.85)",
                  textDecoration: item.completed ? "line-through" : "none",
                }}
              >
                {item.activity}
              </span>
              <span
                className="text-xs"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.3)" }}
              >
                📍 {item.location}
              </span>
            </div>

            {/* Status indicator */}
            <div
              className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200"
              style={{
                borderColor: statusColor,
                background: item.completed ? statusColor : "transparent",
                boxShadow: item.completed ? `0 0 8px ${statusColor}66` : "none",
              }}
            >
              {item.completed && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#0d1020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
