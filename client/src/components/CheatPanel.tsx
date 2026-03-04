/**
 * CheatPanel.tsx
 * Design: Pastel Kawaii Life Manager
 * Cute CP (Cheat Points) panel with soft gold accents
 */

import { useState } from "react";
import { toast } from "sonner";

interface Props {
  cheatPoints: number;
  streak: number;
  onUseCheat: (cost: number, type: "alarm" | "space") => boolean;
}

export default function CheatPanel({ cheatPoints, streak, onUseCheat }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cheats = [
    { id: "alarm", icon: "🔕", label: "全アラーム無効", cost: 50, type: "alarm" as const, desc: "今日のアラームをすべてオフ" },
    { id: "space", icon: "🗺️", label: "空間条件解除",   cost: 30, type: "space" as const, desc: "位置スコアを満点に" },
  ];

  const handleCheat = (cost: number, type: "alarm" | "space", label: string) => {
    if (cheatPoints < cost) {
      toast.error(`CPが足りません（必要: ${cost}CP）`, {
        style: { background: "#fff0f6", border: "1px solid #fca5a5", color: "#7f1d1d" },
      });
      return;
    }
    const success = onUseCheat(cost, type);
    if (success) {
      toast.success(`${label} を使いました！ (-${cost}CP) ✨`, {
        style: { background: "#f0fdf4", border: "1px solid #6ee7b7", color: "#064e3b" },
      });
    }
  };

  const streakProgress = Math.min(streak, 7);
  const nextReward = 7 - (streak % 7);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(251,243,255,0.8)", border: "1.5px solid rgba(192,132,245,0.25)" }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">💎</span>
          <span className="text-sm font-bold" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#a855f7" }}>
            チートポイント: {cheatPoints}CP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)" }}
          >
            <span className="text-xs">🔥</span>
            <span className="text-xs font-bold" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#d97706" }}>
              {streak}日連続
            </span>
          </div>
          <span
            className="text-xs text-gray-400 transition-transform duration-200"
            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}
          >
            ▼
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          {/* Streak progress */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
              あと{nextReward}日で 50CP プレゼント🎁
            </span>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(251,191,36,0.15)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(streakProgress / 7) * 100}%`,
                  background: "linear-gradient(90deg, #fcd34d, #f59e0b)",
                  boxShadow: "0 0 6px rgba(245,158,11,0.4)",
                }}
              />
            </div>
            <div className="flex justify-between">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: i < streakProgress ? "rgba(251,191,36,0.25)" : "rgba(0,0,0,0.04)",
                    border: `1.5px solid ${i < streakProgress ? "rgba(251,191,36,0.6)" : "rgba(0,0,0,0.08)"}`,
                    color: i < streakProgress ? "#d97706" : "rgba(0,0,0,0.2)",
                    fontSize: "0.6rem",
                    fontFamily: "'Noto Sans JP', sans-serif",
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Cheat buttons */}
          <div className="flex flex-col gap-2">
            {cheats.map((cheat) => {
              const canAfford = cheatPoints >= cheat.cost;
              return (
                <button
                  key={cheat.id}
                  onClick={() => handleCheat(cheat.cost, cheat.type, cheat.label)}
                  disabled={!canAfford}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: canAfford ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.03)",
                    border: `1.5px solid ${canAfford ? "rgba(192,132,245,0.3)" : "rgba(0,0,0,0.06)"}`,
                    opacity: canAfford ? 1 : 0.5,
                    boxShadow: canAfford ? "0 2px 8px rgba(192,132,245,0.12)" : "none",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cheat.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: canAfford ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0.3)" }}>
                        {cheat.label}
                      </span>
                      <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.3)" }}>
                        {cheat.desc}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold px-2 py-1 rounded-lg"
                    style={{
                      fontFamily: "'Noto Sans JP', sans-serif",
                      color: canAfford ? "#a855f7" : "rgba(0,0,0,0.2)",
                      background: canAfford ? "rgba(192,132,245,0.12)" : "rgba(0,0,0,0.04)",
                    }}
                  >
                    {cheat.cost}CP
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
