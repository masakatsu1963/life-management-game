/**
 * DailyProgressBar.tsx
 * Design: Pastel Kawaii Life Manager
 * 6カテゴリの達成度を縦並び帯グラフで表示
 * 左の円グラフと並べてダッシュボードに配置する
 */

import type { ScheduleItem, ScheduleCategory } from "@/hooks/useScoreEngine";

interface Props {
  schedule: ScheduleItem[];
}

interface CategoryDef {
  key: ScheduleCategory;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  trackColor: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "wakeup",
    label: "起床",
    shortLabel: "起床",
    icon: "🌅",
    color: "#fbbf24",
    trackColor: "rgba(251,191,36,0.15)",
  },
  {
    key: "pre_work",
    label: "出勤前",
    shortLabel: "出勤前",
    icon: "🌸",
    color: "#f472b6",
    trackColor: "rgba(244,114,182,0.15)",
  },
  {
    key: "commute_learn",
    label: "通勤学習",
    shortLabel: "通勤",
    icon: "📚",
    color: "#60a5fa",
    trackColor: "rgba(96,165,250,0.15)",
  },
  {
    key: "break",
    label: "休憩活用",
    shortLabel: "休憩",
    icon: "☕",
    color: "#34d399",
    trackColor: "rgba(52,211,153,0.15)",
  },
  {
    key: "return_learn",
    label: "帰宅学習",
    shortLabel: "帰宅",
    icon: "🎧",
    color: "#a78bfa",
    trackColor: "rgba(167,139,250,0.15)",
  },
  {
    key: "pre_sleep",
    label: "就寝前",
    shortLabel: "就寝前",
    icon: "🌙",
    color: "#c084f5",
    trackColor: "rgba(192,132,245,0.15)",
  },
];

export default function DailyProgressBar({ schedule }: Props) {
  // カテゴリごとの達成率を計算
  const categoryStats = CATEGORIES.map((cat) => {
    const items = schedule.filter((s) => s.category === cat.key);
    const total = items.length;
    const completed = items.filter((s) => s.completed).length;
    const rate = total > 0 ? completed / total : null; // nullは未設定
    return { ...cat, total, completed, rate };
  });

  // 全体の達成率
  const allItems = schedule.filter((s) => CATEGORIES.some((c) => c.key === s.category));
  const totalAll = allItems.length;
  const completedAll = allItems.filter((s) => s.completed).length;
  const overallRate = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5 h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs font-bold" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.45)", fontSize: "0.65rem" }}>
          カテゴリ達成
        </span>
        <span className="text-xs font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "#c084f5", fontSize: "0.7rem" }}>
          {overallRate}%
        </span>
      </div>

      {/* 帯グラフ：6カテゴリ */}
      {categoryStats.map((cat) => {
        const pct = cat.rate !== null ? Math.round(cat.rate * 100) : 0;
        const hasItems = cat.total > 0;

        return (
          <div key={cat.key} className="flex flex-col gap-0.5">
            {/* ラベル行 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span style={{ fontSize: "0.7rem" }}>{cat.icon}</span>
                <span
                  className="text-xs"
                  style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    color: hasItems ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.25)",
                    fontSize: "0.6rem",
                    fontWeight: hasItems ? 600 : 400,
                  }}
                >
                  {cat.shortLabel}
                </span>
              </div>
              <span
                className="text-xs font-bold"
                style={{
                  fontFamily: "'Shippori Mincho', serif",
                  color: hasItems ? cat.color : "rgba(0,0,0,0.18)",
                  fontSize: "0.6rem",
                }}
              >
                {hasItems ? `${cat.completed}/${cat.total}` : "—"}
              </span>
            </div>

            {/* 帯グラフ本体 */}
            <div
              className="h-3 rounded-full overflow-hidden relative"
              style={{ background: hasItems ? cat.trackColor : "rgba(0,0,0,0.04)" }}
            >
              {hasItems && (
                <div
                  className="h-full rounded-full transition-all duration-700 relative"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${cat.color}88, ${cat.color})`,
                    boxShadow: pct > 0 ? `0 0 6px ${cat.color}60` : "none",
                    minWidth: pct > 0 ? "0.75rem" : "0",
                  }}
                />
              )}
              {/* 未設定の場合 */}
              {!hasItems && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ fontSize: "0.5rem", color: "rgba(0,0,0,0.2)", fontFamily: "'Noto Sans JP', sans-serif" }}
                >
                  未設定
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* 全体達成バー */}
      <div className="mt-1 pt-1.5" style={{ borderTop: "1px dashed rgba(0,0,0,0.08)" }}>
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.35)", fontSize: "0.6rem" }}>
            全体
          </span>
          <span className="text-xs font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: overallRate >= 70 ? "#34d399" : overallRate >= 40 ? "#c084f5" : "#f472b6", fontSize: "0.65rem" }}>
            {overallRate}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${overallRate}%`,
              background: overallRate >= 70
                ? "linear-gradient(90deg, #34d39988, #34d399)"
                : overallRate >= 40
                ? "linear-gradient(90deg, #c084f588, #c084f5)"
                : "linear-gradient(90deg, #f472b688, #f472b6)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
