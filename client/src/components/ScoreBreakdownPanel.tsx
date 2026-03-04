/**
 * ScoreBreakdownPanel.tsx
 * Design: Pastel Kawaii Life Manager
 * Soft progress bars with pastel colors
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
  trackColor: string;
  detail: string;
}

export default function ScoreBreakdownPanel({ breakdown, timeDeviation, spaceDeviation }: Props) {
  const bars: BarItem[] = [
    {
      label: "時間精度",
      icon: "⏰",
      value: breakdown.timeScore,
      weight: "40%",
      color: breakdown.timeScore >= 70 ? "#34d399" : breakdown.timeScore >= 40 ? "#c084f5" : "#f472b6",
      trackColor: breakdown.timeScore >= 70 ? "rgba(52,211,153,0.15)" : breakdown.timeScore >= 40 ? "rgba(192,132,245,0.15)" : "rgba(244,114,182,0.15)",
      detail: timeDeviation <= 5 ? "±5分以内 ✨" : `${timeDeviation}分ズレ`,
    },
    {
      label: "空間精度",
      icon: "📍",
      value: breakdown.spaceScore,
      weight: "30%",
      color: breakdown.spaceScore >= 70 ? "#34d399" : breakdown.spaceScore >= 40 ? "#c084f5" : "#f472b6",
      trackColor: breakdown.spaceScore >= 70 ? "rgba(52,211,153,0.15)" : breakdown.spaceScore >= 40 ? "rgba(192,132,245,0.15)" : "rgba(244,114,182,0.15)",
      detail: spaceDeviation <= 0.1 ? "100m以内 ✨" : `${spaceDeviation.toFixed(1)}km`,
    },
    {
      label: "活動達成",
      icon: "✅",
      value: breakdown.activityScore,
      weight: "20%",
      color: breakdown.activityScore >= 70 ? "#34d399" : breakdown.activityScore >= 40 ? "#c084f5" : "#f472b6",
      trackColor: breakdown.activityScore >= 70 ? "rgba(52,211,153,0.15)" : breakdown.activityScore >= 40 ? "rgba(192,132,245,0.15)" : "rgba(244,114,182,0.15)",
      detail: `${Math.round(breakdown.activityScore)}%達成`,
    },
    {
      label: "気分スコア",
      icon: "💕",
      value: breakdown.emotionScore,
      weight: "10%",
      color: "#f9a8d4",
      trackColor: "rgba(249,168,212,0.2)",
      detail: `気分 ${Math.round(breakdown.emotionScore / 20)}/5`,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{bar.icon}</span>
              <span className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)" }}>
                {bar.label}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.3)", background: "rgba(0,0,0,0.05)", fontSize: "0.6rem" }}
              >
                {bar.weight}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.35)" }}>
                {bar.detail}
              </span>
              <span className="text-sm font-bold" style={{ color: bar.color, minWidth: "2rem", textAlign: "right", fontFamily: "'Shippori Mincho', serif" }}>
                {Math.round(bar.value)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: bar.trackColor }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${bar.value}%`,
                background: `linear-gradient(90deg, ${bar.color}88, ${bar.color})`,
                boxShadow: `0 0 6px ${bar.color}60`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
