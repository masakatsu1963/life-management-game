/**
 * DifficultySlider.tsx
 * Design: Dark Gaming Gauge - Difficulty selector
 * Three-stage slider: Easy / Normal / Hard
 */

import type { Difficulty } from "@/hooks/useScoreEngine";

interface DifficultySliderProps {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

const LEVELS: { key: Difficulty; label: string; color: string; desc: string }[] = [
  { key: "easy", label: "イージー", color: "#22d97a", desc: "±15分許容" },
  { key: "normal", label: "ノーマル", color: "#f0b429", desc: "±10分許容" },
  { key: "hard", label: "ハード", color: "#f05252", desc: "±5分許容" },
];

export default function DifficultySlider({ value, onChange }: DifficultySliderProps) {
  const activeIndex = LEVELS.findIndex((l) => l.key === value);
  const active = LEVELS[activeIndex];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/40 font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
          難易度
        </span>
        <span className="text-xs font-bold" style={{ color: active.color, fontFamily: "Orbitron, monospace" }}>
          {active.desc}
        </span>
      </div>

      {/* Slider track */}
      <div className="relative h-10 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/10" />

        {/* Active fill */}
        <div
          className="absolute h-1.5 rounded-full transition-all duration-300"
          style={{
            left: 0,
            width: `${(activeIndex / 2) * 100}%`,
            background: `linear-gradient(90deg, #22d97a, ${active.color})`,
            boxShadow: `0 0 8px ${active.color}88`,
          }}
        />

        {/* Buttons */}
        <div className="relative flex justify-between w-full">
          {LEVELS.map((level, idx) => {
            const isActive = level.key === value;
            return (
              <button
                key={level.key}
                onClick={() => onChange(level.key)}
                className="flex flex-col items-center gap-1 group"
                style={{ width: "33.33%" }}
              >
                {/* Dot */}
                <div
                  className="w-4 h-4 rounded-full border-2 transition-all duration-200"
                  style={{
                    borderColor: isActive ? level.color : "rgba(255,255,255,0.2)",
                    background: isActive ? level.color : "transparent",
                    boxShadow: isActive ? `0 0 10px ${level.color}88` : "none",
                    transform: isActive ? "scale(1.3)" : "scale(1)",
                  }}
                />
                {/* Label */}
                <span
                  className="text-xs transition-all duration-200"
                  style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    color: isActive ? level.color : "rgba(255,255,255,0.35)",
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
    </div>
  );
}
