/**
 * DailyProgressBar.tsx
 * Design: Pastel Kawaii Life Manager
 * 6カテゴリの1週間積算達成率を帯グラフで表示
 * LocalStorageの週間ログを読み込んで集計
 */

import { useEffect, useState } from "react";
import type { ScheduleItem, ScheduleCategory } from "@/hooks/useScoreEngine";
import { loadWeeklyLog, calcWeeklyStats } from "@/hooks/useScoreEngine";

interface Props {
  schedule: ScheduleItem[];
}

const CATS: ScheduleCategory[] = ["wakeup","pre_work","commute_learn","break","return_learn","pre_sleep"];

const CAT_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  wakeup:        { label: "起床",   icon: "🌅", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  pre_work:      { label: "出勤前", icon: "🌸", color: "#f472b6", bg: "rgba(244,114,182,0.12)" },
  commute_learn: { label: "通勤学習", icon: "📚", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  break:         { label: "休憩活用", icon: "☕", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  return_learn:  { label: "帰宅学習", icon: "🎧", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  pre_sleep:     { label: "就寝前",  icon: "🌙", color: "#c084f5", bg: "rgba(192,132,245,0.12)" },
};

export default function DailyProgressBar({ schedule }: Props) {
  const [weeklyStats, setWeeklyStats] = useState<
    Record<string, { totalItems: number; completedItems: number; rate: number }>
  >({});

  // スケジュールが変わるたびに週間ログを再集計
  useEffect(() => {
    const logs = loadWeeklyLog();
    const stats = calcWeeklyStats(logs);
    setWeeklyStats(stats);
  }, [schedule]);

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="text-xs font-semibold mb-0.5"
        style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.38)", fontSize: "0.62rem" }}
      >
        7日間 達成率
      </div>
      {CATS.map(cat => {
        const meta = CAT_META[cat];
        const stat = weeklyStats[cat];
        // 今日の達成状況も加味（リアルタイム）
        const todayItems = schedule.filter(s => s.category === cat);
        const todayCompleted = todayItems.filter(s => s.completed).length;

        // 週間ログに今日分が含まれていない場合は今日分を加算
        const totalItems = (stat?.totalItems ?? 0) + (stat ? 0 : todayItems.length);
        const completedItems = (stat?.completedItems ?? 0) + (stat ? 0 : todayCompleted);
        const rate = totalItems > 0 ? completedItems / totalItems : 0;
        const pct = Math.round(rate * 100);

        return (
          <div
            key={cat}
            className="rounded-xl px-2 py-1.5"
            style={{ background: meta.bg }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <span style={{ fontSize: "0.75rem" }}>{meta.icon}</span>
                <span
                  className="font-medium"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)", fontSize: "0.65rem" }}
                >
                  {meta.label}
                </span>
              </div>
              <span
                className="font-bold tabular-nums"
                style={{ fontFamily: "'Shippori Mincho', serif", color: meta.color, fontSize: "0.75rem" }}
              >
                {pct}%
              </span>
            </div>
            {/* 帯グラフ */}
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: "6px", background: "rgba(0,0,0,0.07)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})`,
                  minWidth: pct > 0 ? "6px" : "0",
                }}
              />
            </div>
            {/* 件数表示 */}
            {totalItems > 0 && (
              <div
                className="text-right mt-0.5"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.25)", fontSize: "0.55rem" }}
              >
                {completedItems}/{totalItems}件
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
