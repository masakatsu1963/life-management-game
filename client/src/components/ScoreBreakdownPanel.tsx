/**
 * ScoreBreakdownPanel.tsx
 * Design: Pastel Kawaii Life Manager
 * わかりやすいスコア内訳：各要素のポイント・重み・状態を明確表示
 */

import type { ScoreBreakdown, ScheduleItem } from "@/hooks/useScoreEngine";

interface Props {
  breakdown: ScoreBreakdown;
  timeDeviation: number;
  spaceDeviation: number;
  schedule: ScheduleItem[];
}

function getColor(value: number) {
  if (value >= 70) return { main: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.25)" };
  if (value >= 40) return { main: "#c084f5", bg: "rgba(192,132,245,0.10)", border: "rgba(192,132,245,0.25)" };
  return { main: "#f472b6", bg: "rgba(244,114,182,0.10)", border: "rgba(244,114,182,0.25)" };
}

function StatusBadge({ value }: { value: number }) {
  if (value >= 70) return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", fontSize: "0.6rem" }}>◎ 良好</span>;
  if (value >= 40) return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(192,132,245,0.15)", color: "#c084f5", fontSize: "0.6rem" }}>△ 普通</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(244,114,182,0.15)", color: "#f472b6", fontSize: "0.6rem" }}>▽ 要改善</span>;
}

export default function ScoreBreakdownPanel({ breakdown, timeDeviation, spaceDeviation, schedule }: Props) {
  const completedCount = schedule.filter(s => s.completed).length;
  const totalCount = schedule.length;

  // 各要素の「重み×スコア」= 総合スコアへの貢献ポイント
  const timeContrib = Math.round(breakdown.timeScore * 0.4);
  const spaceContrib = Math.round(breakdown.spaceScore * 0.3);
  const activityContrib = Math.round(breakdown.activityScore * 0.2);
  const emotionContrib = Math.round(breakdown.emotionScore * 0.1);

  const items = [
    {
      icon: "⏰",
      label: "時間精度",
      weight: "×40%",
      rawScore: Math.round(breakdown.timeScore),
      contrib: timeContrib,
      detail: timeDeviation <= 5
        ? "スケジュール通り ✨"
        : timeDeviation <= 15
        ? `${timeDeviation}分ズレ`
        : `${timeDeviation}分ズレ ⚠️`,
      subDetail: "直近スケジュールとの時間差",
      ...getColor(breakdown.timeScore),
    },
    {
      icon: "📍",
      label: "空間精度",
      weight: "×30%",
      rawScore: Math.round(breakdown.spaceScore),
      contrib: spaceContrib,
      detail: spaceDeviation <= 0.1
        ? "理想の場所にいます ✨"
        : `${spaceDeviation.toFixed(1)}km 離れています`,
      subDetail: "理想スケジュールの場所との距離",
      ...getColor(breakdown.spaceScore),
    },
    {
      icon: "✅",
      label: "タスク達成",
      weight: "×20%",
      rawScore: Math.round(breakdown.activityScore),
      contrib: activityContrib,
      detail: totalCount > 0
        ? `${completedCount} / ${totalCount} 完了`
        : "タスクを設定してください",
      subDetail: "今日のスケジュール達成率",
      ...getColor(breakdown.activityScore),
    },
    {
      icon: "💕",
      label: "気分スコア",
      weight: "×10%",
      rawScore: Math.round(breakdown.emotionScore),
      contrib: emotionContrib,
      detail: ["", "😞 つらい", "😕 いまいち", "😊 ふつう", "😄 良い", "🌟 最高"][Math.round(breakdown.emotionScore / 20)] || "😊 ふつう",
      subDetail: "今日の気分（5段階入力）",
      main: "#f9a8d4",
      bg: "rgba(249,168,212,0.10)",
      border: "rgba(249,168,212,0.25)",
    },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      {/* ヘッダー：合計ポイント */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.45)" }}>
          スコア内訳
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.35)" }}>合計</span>
          <span className="text-base font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "#c084f5" }}>
            {Math.round(breakdown.total)}
          </span>
          <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.35)" }}>pt</span>
        </div>
      </div>

      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl px-3 py-2.5"
          style={{ background: item.bg, border: `1.5px solid ${item.border}` }}
        >
          {/* 上段：アイコン・ラベル・重み・ステータス・貢献ポイント */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs font-bold" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.60)" }}>
                {item.label}
              </span>
              <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.28)", fontSize: "0.6rem" }}>
                {item.weight}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge value={item.rawScore} />
              <div className="flex items-baseline gap-0.5">
                <span className="text-base font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: item.main }}>
                  {item.contrib}
                </span>
                <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.3)", fontSize: "0.6rem" }}>pt</span>
              </div>
            </div>
          </div>

          {/* プログレスバー */}
          <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(0,0,0,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${item.rawScore}%`,
                background: `linear-gradient(90deg, ${item.main}88, ${item.main})`,
                boxShadow: `0 0 6px ${item.main}50`,
              }}
            />
          </div>

          {/* 下段：詳細テキスト */}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.40)" }}>
              {item.detail}
            </span>
            <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.25)", fontSize: "0.6rem" }}>
              素点 {item.rawScore}/100
            </span>
          </div>
        </div>
      ))}

      {/* タスク達成サマリー（タスクが1件以上ある場合） */}
      {totalCount > 0 && (
        <div
          className="rounded-2xl px-3 py-2.5 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.7)", border: "1.5px dashed rgba(52,211,153,0.25)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🎯</span>
            <div>
              <div className="text-xs font-bold" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)" }}>
                今日のタスク達成状況
              </div>
              <div className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.35)" }}>
                残り {totalCount - completedCount} 件
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* ミニドット */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalCount, 7) }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i < completedCount ? "#34d399" : "rgba(0,0,0,0.10)",
                    boxShadow: i < completedCount ? "0 0 4px rgba(52,211,153,0.5)" : "none",
                  }}
                />
              ))}
              {totalCount > 7 && (
                <span className="text-xs" style={{ color: "rgba(0,0,0,0.3)", fontSize: "0.55rem" }}>+{totalCount - 7}</span>
              )}
            </div>
            <span className="text-sm font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: completedCount === totalCount ? "#34d399" : "#c084f5" }}>
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
