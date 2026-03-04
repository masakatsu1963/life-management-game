/**
 * DifficultySlider.tsx
 * Design: Pastel Kawaii Life Manager
 * Soft pill-style difficulty selector
 */

import type { Difficulty } from "@/hooks/useScoreEngine";

interface DifficultySliderProps {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

const LEVELS: { key: Difficulty; label: string; emoji: string; color: string; bg: string; border: string; desc: string }[] = [
  { key: "easy",   label: "やさしい", emoji: "🌸", color: "#f472b6", bg: "rgba(244,114,182,0.10)", border: "rgba(244,114,182,0.35)", desc: "±15分" },
  { key: "normal", label: "ふつう",   emoji: "🌷", color: "#c084f5", bg: "rgba(192,132,245,0.10)", border: "rgba(192,132,245,0.35)", desc: "±10分" },
  { key: "hard",   label: "がんばる", emoji: "🌿", color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.35)",  desc: "±5分" },
];

export default function DifficultySlider({ value, onChange }: DifficultySliderProps) {
  const active = LEVELS.find((l) => l.key === value)!;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
          難易度
        </span>
        <span className="text-xs font-semibold" style={{ color: active.color, fontFamily: "'Noto Sans JP', sans-serif" }}>
          {active.desc}許容
        </span>
      </div>

      <div className="flex gap-2">
        {LEVELS.map((level) => {
          const isActive = level.key === value;
          return (
            <button
              key={level.key}
              onClick={() => onChange(level.key)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all duration-200"
              style={{
                background: isActive ? level.bg : "rgba(0,0,0,0.03)",
                border: `1.5px solid ${isActive ? level.border : "rgba(0,0,0,0.06)"}`,
                transform: isActive ? "scale(1.04)" : "scale(1)",
                boxShadow: isActive ? `0 4px 12px ${level.color}25` : "none",
              }}
            >
              <span className="text-lg">{level.emoji}</span>
              <span
                className="text-xs font-medium"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  color: isActive ? level.color : "rgba(0,0,0,0.35)",
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {level.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
