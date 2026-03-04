/**
 * EmotionSelector.tsx
 * Design: Pastel Kawaii Life Manager
 * Cute emoji mood selector with soft card style
 */

interface Props {
  value: number; // 1-5
  onChange: (level: number) => void;
}

const EMOTIONS = [
  { level: 1, emoji: "😞", label: "つらい", color: "#fca5a5" },
  { level: 2, emoji: "😕", label: "いまいち", color: "#fdba74" },
  { level: 3, emoji: "😐", label: "ふつう", color: "#c084f5" },
  { level: 4, emoji: "😊", label: "いい感じ", color: "#6ee7b7" },
  { level: 5, emoji: "🥰", label: "最高！", color: "#f9a8d4" },
];

export default function EmotionSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
        💕 今の気分
      </span>
      <div className="flex justify-between gap-1.5">
        {EMOTIONS.map((e) => {
          const isActive = e.level === value;
          return (
            <button
              key={e.level}
              onClick={() => onChange(e.level)}
              className="flex flex-col items-center gap-1 flex-1 py-2.5 rounded-2xl transition-all duration-200"
              style={{
                background: isActive ? `${e.color}22` : "rgba(0,0,0,0.03)",
                border: `1.5px solid ${isActive ? e.color + "60" : "rgba(0,0,0,0.06)"}`,
                transform: isActive ? "scale(1.08)" : "scale(1)",
                boxShadow: isActive ? `0 4px 12px ${e.color}30` : "none",
              }}
            >
              <span className="text-xl">{e.emoji}</span>
              <span
                className="text-xs"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  color: isActive ? e.color : "rgba(0,0,0,0.3)",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: "0.58rem",
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
