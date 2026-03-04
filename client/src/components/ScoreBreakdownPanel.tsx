/**
 * ScoreBreakdownPanel.tsx
 * Design: Dark Gaming Gauge - Score breakdown display
 * Shows the 4 score components with mini progress bars
 */

import type { ScoreBreakdown } from "@/hooks/useScoreEngine";

interface Props {
  breakdown: ScoreBreakdown;
  timeDeviation: number;
  spaceDeviation: number;
}

interface BarItem {
  label: string;
  icon: string;
  value: number;
  weight: string;
  color: string;
  detail: string;
}

export default function ScoreBreakdownPanel({ breakdown, timeDeviation, spaceDeviation }: Props) {
  const bars: BarItem[] = [
    {
      label: "時間精度",
      icon: "⏰",
      value: breakdown.timeScore,
      weight: "40%",
      color: breakdown.timeScore >= 70 ? "#22d97a" : breakdown.timeScore >= 40 ? "#f0b429" : "#f05252",
      detail: timeDeviation <= 5 ? "±5分以内" : `${timeDeviation}分ズレ`,
    },
    {
      label: "空間精度",
      icon: "📍",
      value: breakdown.spaceScore,
      weight: "30%",
      color: breakdown.spaceScore >= 70 ? "#22d97a" : breakdown.spaceScore >= 40 ? "#f0b429" : "#f05252",
      detail: spaceDeviation <= 0.1 ? "100m以内" : `${spaceDeviation.toFixed(1)}km`,
    },
    {
      label: "活動達成",
      icon: "✅",
      value: breakdown.activityScore,
      weight: "20%",
      color: breakdown.activityScore >= 70 ? "#22d97a" : breakdown.activityScore >= 40 ? "#f0b429" : "#f05252",
      detail: `${Math.round(breakdown.activityScore)}%達成`,
    },
    {
      label: "感情スコア",
      icon: "💭",
      value: breakdown.emotionScore,
      weight: "10%",
      color: breakdown.emotionScore >= 70 ? "#22d97a" : breakdown.emotionScore >= 40 ? "#f0b429" : "#f05252",
      detail: `気分 ${Math.round(breakdown.emotionScore / 20)}/5`,
    },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{bar.icon}</span>
              <span
                className="text-xs font-medium"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.7)" }}
              >
                {bar.label}
              </span>
              <span
                className="text-xs px-1 rounded"
                style={{
                  fontFamily: "Orbitron, monospace",
                  color: "rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.06)",
                  fontSize: "0.6rem",
                }}
              >
                {bar.weight}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.4)" }}
              >
                {bar.detail}
              </span>
              <span
                className="text-sm font-bold"
                style={{ fontFamily: "Orbitron, monospace", color: bar.color, minWidth: "2.5rem", textAlign: "right" }}
              >
                {Math.round(bar.value)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${bar.value}%`,
                background: bar.color,
                boxShadow: `0 0 6px ${bar.color}88`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
