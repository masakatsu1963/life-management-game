/**
 * LocationLog.tsx
 * 移動ログタブ：isLocation=trueのイベントを一覧表示
 * 位置情報確認ボタン付き・達成状態を視覚的に表示
 */

import { useState } from "react";
import type { DailyEvent } from "@/hooks/useScoreEngine";

interface LocationLogProps {
  events: DailyEvent[];
  currentTime: Date;
  onToggle: (eventId: string, pointType: "time" | "location" | "task" | "relax") => void;
}

export default function LocationLog({ events, currentTime, onToggle }: LocationLogProps) {
  const [checkingId, setCheckingId] = useState<string | null>(null);

  // isLocation=trueのイベントのみ表示
  const locationEvents = events.filter(e => e.isLocation === true);

  const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();

  function scheduledMin(time: string) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  function getStatus(ev: DailyEvent): "done" | "current" | "upcoming" | "missed" {
    if (ev.locationAchieved || ev.timeAchieved) return "done";
    const sMin = scheduledMin(ev.scheduledTime);
    if (nowMin >= sMin + 30) return "missed";
    if (nowMin >= sMin - 10) return "current";
    return "upcoming";
  }

  async function handleLocationCheck(ev: DailyEvent) {
    setCheckingId(ev.id);
    try {
      if (!navigator.geolocation) {
        alert("位置情報が使えません");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        () => {
          // 位置取得成功 → 位置ポイント付与
          onToggle(ev.id, "location");
          setCheckingId(null);
        },
        () => {
          alert("位置情報の取得に失敗しました。設定を確認してください。");
          setCheckingId(null);
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    } catch {
      setCheckingId(null);
    }
  }

  const statusConfig = {
    done:     { bg: "rgba(134,239,172,0.2)", border: "rgba(134,239,172,0.6)", dot: "#22c55e", label: "✓ 完了" },
    current:  { bg: "rgba(251,207,232,0.3)", border: "rgba(244,114,182,0.6)", dot: "#f472b6", label: "● 今ここ" },
    upcoming: { bg: "rgba(255,255,255,0.6)", border: "rgba(0,0,0,0.08)", dot: "#d1d5db", label: "" },
    missed:   { bg: "rgba(254,202,202,0.2)", border: "rgba(252,165,165,0.4)", dot: "#f87171", label: "! 遅れ" },
  };

  if (locationEvents.length === 0) {
    return (
      <div className="text-center py-10" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "'Noto Sans JP', sans-serif" }}>
        <div className="text-3xl mb-2">📍</div>
        <p className="text-sm">移動ログはありません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* ヘッダー説明 */}
      <div
        className="rounded-xl px-4 py-2 text-xs mb-1"
        style={{
          background: "rgba(244,114,182,0.08)",
          color: "rgba(0,0,0,0.45)",
          fontFamily: "'Noto Sans JP', sans-serif",
          border: "1px solid rgba(244,114,182,0.15)",
        }}
      >
        📍 位置情報は自動取得されます。確認ボタンで手動チェックも可能です。
      </div>

      {/* 移動イベントリスト */}
      {locationEvents.map((ev) => {
        const status = getStatus(ev);
        const cfg = statusConfig[status];
        const isChecking = checkingId === ev.id;
        const totalPt = ev.timePoint + ev.locationPoint;

        return (
          <div
            key={ev.id}
            className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{
              background: cfg.bg,
              border: `1.5px solid ${cfg.border}`,
              transition: "all 0.2s",
            }}
          >
            {/* 状態ドット */}
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: cfg.dot, boxShadow: status === "current" ? `0 0 8px ${cfg.dot}` : "none" }}
            />

            {/* 絵文字 */}
            <span className="text-xl flex-shrink-0">{ev.emoji}</span>

            {/* 情報 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-sm"
                  style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.75)" }}
                >
                  {ev.label}
                </span>
                {cfg.label && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: status === "done" ? "rgba(134,239,172,0.3)" :
                                  status === "current" ? "rgba(244,114,182,0.2)" :
                                  status === "missed" ? "rgba(254,202,202,0.4)" : "transparent",
                      color: status === "done" ? "#16a34a" :
                             status === "current" ? "#db2777" :
                             status === "missed" ? "#dc2626" : "transparent",
                      fontFamily: "'Noto Sans JP', sans-serif",
                    }}
                  >
                    {cfg.label}
                  </span>
                )}
              </div>
              <div
                className="text-xs mt-0.5 flex items-center gap-2"
                style={{ color: "rgba(0,0,0,0.4)", fontFamily: "'Noto Sans JP', sans-serif" }}
              >
                <span>⏰ {ev.scheduledTime}</span>
                {ev.locationLabel && <span>📍 {ev.locationLabel}</span>}
                <span className="ml-auto font-bold" style={{ color: "#f472b6" }}>
                  +{totalPt}pt
                </span>
              </div>
            </div>

            {/* 位置確認ボタン */}
            {status !== "done" && ev.requiresLocation && (
              <button
                onClick={() => handleLocationCheck(ev)}
                disabled={isChecking}
                className="flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold"
                style={{
                  background: isChecking ? "rgba(0,0,0,0.08)" : "linear-gradient(135deg, #f9a8d4, #c084fc)",
                  color: isChecking ? "rgba(0,0,0,0.3)" : "white",
                  border: "none",
                  fontFamily: "'Noto Sans JP', sans-serif",
                  transition: "all 0.2s",
                  cursor: isChecking ? "not-allowed" : "pointer",
                }}
              >
                {isChecking ? "確認中…" : "📍 確認"}
              </button>
            )}

            {/* 退勤は手動チェック */}
            {ev.id === "leave_work" && status !== "done" && (
              <button
                onClick={() => onToggle(ev.id, "time")}
                className="flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #fde68a, #fca5a5)",
                  color: "rgba(0,0,0,0.7)",
                  border: "none",
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                退勤！
              </button>
            )}
          </div>
        );
      })}

      {/* 合計位置ポイント */}
      <div
        className="rounded-2xl px-4 py-3 mt-1 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, rgba(249,168,212,0.15), rgba(192,132,252,0.15))",
          border: "1.5px solid rgba(244,114,182,0.2)",
        }}
      >
        <span
          className="text-sm font-bold"
          style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}
        >
          📍 移動ポイント合計
        </span>
        <span
          className="text-lg font-bold"
          style={{ fontFamily: "'Orbitron', monospace", color: "#f472b6" }}
        >
          {locationEvents.reduce((sum, ev) =>
            sum + (ev.locationAchieved ? ev.locationPoint : 0) + (ev.timeAchieved ? ev.timePoint : 0), 0
          )}
          <span className="text-sm ml-1">pt</span>
        </span>
      </div>
    </div>
  );
}
