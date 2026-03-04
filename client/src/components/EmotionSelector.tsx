/**
 * EmotionSelector.tsx
 * Design: Dark Gaming Gauge - Emotion level selector (1-5)
 */

interface Props {
  value: number; // 1-5
  onChange: (level: number) => void;
}

const EMOTIONS = [
  { level: 1, emoji: "😞", label: "最悪" },
  { level: 2, emoji: "😕", label: "悪い" },
  { level: 3, emoji: "😐", label: "普通" },
  { level: 4, emoji: "😊", label: "良い" },
  { level: 5, emoji: "😄", label: "最高" },
];

export default function EmotionSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-xs font-medium"
        style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.4)" }}
      >
        💭 今の気分
      </span>
      <div className="flex justify-between gap-1">
        {EMOTIONS.map((e) => {
          const isActive = e.level === value;
          return (
            <button
              key={e.level}
              onClick={() => onChange(e.level)}
              className="flex flex-col items-center gap-1 flex-1 py-2 rounded-lg transition-all duration-200"
              style={{
                background: isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.06)"}`,
                transform: isActive ? "scale(1.08)" : "scale(1)",
              }}
            >
              <span className="text-xl">{e.emoji}</span>
              <span
                className="text-xs"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  color: isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                  fontSize: "0.6rem",
                }}
              >
                {e.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
