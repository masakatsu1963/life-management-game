/**
 * CheatPanel.tsx
 * Design: Dark Gaming Gauge - Cheat system panel
 * CP (Cheat Points) usage for game advantages
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
    {
      id: "alarm",
      icon: "🔕",
      label: "全アラーム無効",
      cost: 50,
      type: "alarm" as const,
      desc: "今日のアラームをすべてオフ",
    },
    {
      id: "space",
      icon: "📍",
      label: "空間条件解除",
      cost: 30,
      type: "space" as const,
      desc: "位置情報スコアを満点に",
    },
  ];

  const handleCheat = (cost: number, type: "alarm" | "space", label: string) => {
    if (cheatPoints < cost) {
      toast.error(`CPが足りません（必要: ${cost}CP）`, {
        style: { background: "#1a1a2e", border: "1px solid rgba(240,82,82,0.3)", color: "#f0f0f0" },
      });
      return;
    }
    const success = onUseCheat(cost, type);
    if (success) {
      toast.success(`${label} を使用しました！ (-${cost}CP)`, {
        style: { background: "#1a1a2e", border: "1px solid rgba(34,217,122,0.3)", color: "#f0f0f0" },
      });
    }
  };

  const streakProgress = Math.min(streak, 7);
  const nextReward = 7 - (streak % 7);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">💎</span>
          <span
            className="text-sm font-bold"
            style={{ fontFamily: "Orbitron, monospace", color: "#f0b429" }}
          >
            チート残: {cheatPoints}CP
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Streak badge */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: "rgba(240,180,41,0.15)", border: "1px solid rgba(240,180,41,0.3)" }}
          >
            <span className="text-xs">🔥</span>
            <span
              className="text-xs font-bold"
              style={{ fontFamily: "Orbitron, monospace", color: "#f0b429" }}
            >
              {streak}日
            </span>
          </div>
          <span
            className="text-xs transition-transform duration-200"
            style={{
              color: "rgba(255,255,255,0.4)",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              display: "inline-block",
            }}
          >
            ▼
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          {/* Streak progress */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span
                className="text-xs"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.4)" }}
              >
                連続80超: {streak}日 → あと{nextReward}日で50CP獲得
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(streakProgress / 7) * 100}%`,
                  background: "linear-gradient(90deg, #f0b429, #f05252)",
                  boxShadow: "0 0 6px rgba(240,180,41,0.5)",
                }}
              />
            </div>
            <div className="flex justify-between">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: i < streakProgress ? "rgba(240,180,41,0.3)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${i < streakProgress ? "rgba(240,180,41,0.5)" : "rgba(255,255,255,0.1)"}`,
                    color: i < streakProgress ? "#f0b429" : "rgba(255,255,255,0.2)",
                    fontSize: "0.55rem",
                    fontFamily: "Orbitron, monospace",
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
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: canAfford ? "rgba(240,180,41,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${canAfford ? "rgba(240,180,41,0.25)" : "rgba(255,255,255,0.06)"}`,
                    opacity: canAfford ? 1 : 0.5,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cheat.icon}</span>
                    <div className="flex flex-col">
                      <span
                        className="text-sm font-medium"
                        style={{ fontFamily: "'Noto Sans JP', sans-serif", color: canAfford ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}
                      >
                        {cheat.label}
                      </span>
                      <span
                        className="text-xs"
                        style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.3)" }}
                      >
                        {cheat.desc}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold px-2 py-1 rounded"
                    style={{
                      fontFamily: "Orbitron, monospace",
                      color: canAfford ? "#f0b429" : "rgba(255,255,255,0.2)",
                      background: canAfford ? "rgba(240,180,41,0.15)" : "rgba(255,255,255,0.05)",
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
