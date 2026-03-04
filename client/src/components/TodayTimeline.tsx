/**
 * TodayTimeline.tsx
 * Design: Pastel Kawaii Life Manager
 *
 * 今日のタイムライン型UI
 * - 縦タイムラインで1日のイベントを表示
 * - 各イベントに 🕐時間 / 📍位置 / 📚タスク の3軸ポイントバッジ
 * - 達成済み=カラー、未達成=グレー
 * - 現在時刻の「今ここ」マーカー
 * - タップで達成トグル
 */

import { useState } from "react";
import type { DailyEvent, PointType } from "@/hooks/useScoreEngine";

interface Props {
  events: DailyEvent[];
  currentTime: Date;
  onToggle: (eventId: string, pointType: PointType) => void;
  earnedPoints: number;
  totalPoints: number;
}

function nowStr(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function isPast(scheduledTime: string, currentTime: Date): boolean {
  return scheduledTime <= nowStr(currentTime);
}

function isCurrent(scheduledTime: string, currentTime: Date): boolean {
  const now = nowStr(currentTime);
  const [sh, sm] = scheduledTime.split(":").map(Number);
  const [nh, nm] = now.split(":").map(Number);
  const diff = (sh * 60 + sm) - (nh * 60 + nm);
  return diff >= -30 && diff <= 30;
}

export default function TodayTimeline({ events, currentTime, onToggle, earnedPoints, totalPoints }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const now = nowStr(currentTime);

  // 現在時刻の前後イベントを特定
  const currentIdx = events.findIndex(e => e.scheduledTime > now);
  const activeIdx = currentIdx > 0 ? currentIdx - 1 : currentIdx === 0 ? -1 : events.length - 1;

  return (
    <div style={{ padding: "0 0 8px 0" }}>
      {/* ポイントサマリーバー */}
      <div style={{
        background: "linear-gradient(135deg, rgba(244,114,182,0.08) 0%, rgba(192,132,245,0.08) 100%)",
        borderRadius: 14,
        padding: "10px 16px",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid rgba(192,132,245,0.15)",
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, letterSpacing: "0.05em" }}>
            今日の獲得ポイント
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#7c3aed", lineHeight: 1.2 }}>
            {earnedPoints}
            <span style={{ fontSize: 13, color: "#a78bfa", fontWeight: 400 }}>/{totalPoints}pt</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>達成率</div>
          <div style={{
            width: 80,
            height: 8,
            background: "rgba(0,0,0,0.08)",
            borderRadius: 99,
            overflow: "hidden",
          }}>
            <div style={{
              width: `${totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0}%`,
              height: "100%",
              background: "linear-gradient(90deg, #f9a8d4, #c084f5)",
              borderRadius: 99,
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ fontSize: 12, color: "#7c3aed", fontWeight: 600, marginTop: 2 }}>
            {totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* タイムライン */}
      <div style={{ position: "relative" }}>
        {/* 縦線 */}
        <div style={{
          position: "absolute",
          left: 28,
          top: 0,
          bottom: 0,
          width: 2,
          background: "linear-gradient(180deg, #f9a8d4 0%, #c084f5 50%, #6ee7b7 100%)",
          opacity: 0.25,
          borderRadius: 99,
        }} />

        {events.map((event, idx) => {
          const past = isPast(event.scheduledTime, currentTime);
          const current = isCurrent(event.scheduledTime, currentTime);
          const isActive = idx === activeIdx;
          const totalEventPt = event.timePoint + event.locationPoint + event.taskPoint;
          const earnedEventPt =
            (event.timeAchieved ? event.timePoint : 0) +
            (event.locationAchieved ? event.locationPoint : 0) +
            (event.taskAchieved ? event.taskPoint : 0);
          const allDone = earnedEventPt === totalEventPt;
          const expanded = expandedId === event.id;

          // 「今ここ」マーカーの挿入位置
          const showNowMarker = idx === currentIdx;

          return (
            <div key={event.id}>
              {/* 今ここマーカー */}
              {showNowMarker && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: 16,
                  marginBottom: 6,
                  marginTop: 4,
                }}>
                  <div style={{
                    width: 26,
                    height: 2,
                    background: "#f472b6",
                    borderRadius: 99,
                    marginRight: 8,
                  }} />
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#f472b6",
                    background: "rgba(244,114,182,0.12)",
                    padding: "2px 8px",
                    borderRadius: 99,
                    letterSpacing: "0.05em",
                  }}>
                    ▶ 今ここ {now}
                  </div>
                </div>
              )}

              {/* イベントカード */}
              <div
                onClick={() => setExpandedId(expanded ? null : event.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: 8,
                  cursor: "pointer",
                  opacity: past && !allDone ? 0.65 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {/* タイムラインドット */}
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: allDone
                    ? "linear-gradient(135deg, #f9a8d4, #c084f5)"
                    : isActive
                    ? "rgba(192,132,245,0.3)"
                    : "rgba(0,0,0,0.08)",
                  border: isActive ? "2px solid #c084f5" : "2px solid rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  flexShrink: 0,
                  marginTop: 10,
                  marginLeft: 19,
                  marginRight: 12,
                  zIndex: 1,
                  position: "relative",
                  boxShadow: allDone ? "0 0 8px rgba(192,132,245,0.4)" : "none",
                  transition: "all 0.3s ease",
                }}>
                  {allDone ? "✓" : ""}
                </div>

                {/* カード本体 */}
                <div style={{
                  flex: 1,
                  background: isActive
                    ? "linear-gradient(135deg, rgba(244,114,182,0.08) 0%, rgba(192,132,245,0.08) 100%)"
                    : allDone
                    ? "rgba(110,231,183,0.06)"
                    : "rgba(255,255,255,0.7)",
                  borderRadius: 14,
                  padding: "10px 12px",
                  border: isActive
                    ? "1px solid rgba(192,132,245,0.3)"
                    : allDone
                    ? "1px solid rgba(110,231,183,0.3)"
                    : "1px solid rgba(0,0,0,0.06)",
                  boxShadow: isActive ? "0 2px 12px rgba(192,132,245,0.15)" : "none",
                  transition: "all 0.3s ease",
                }}>
                  {/* ヘッダー行 */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{event.emoji}</span>
                      <div>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: allDone ? "#059669" : isActive ? "#7c3aed" : "#374151",
                          lineHeight: 1.3,
                        }}>
                          {event.label}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                          {event.scheduledTime}
                          {event.achievedAt && (
                            <span style={{ color: "#34d399", marginLeft: 6 }}>✓ {event.achievedAt}達成</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* ポイントバッジ */}
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: allDone ? "#059669" : "#7c3aed",
                        background: allDone ? "rgba(52,211,153,0.12)" : "rgba(192,132,245,0.12)",
                        padding: "2px 8px",
                        borderRadius: 99,
                      }}>
                        {earnedEventPt}/{totalEventPt}pt
                      </span>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{expanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* 展開時: ポイントトグルボタン */}
                  {expanded && (
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {event.timePoint > 0 && (
                        <PointToggleBtn
                          icon="⏰"
                          label="時間"
                          achieved={event.timeAchieved}
                          onClick={(e) => { e.stopPropagation(); onToggle(event.id, "time"); }}
                        />
                      )}
                      {event.locationPoint > 0 && (
                        <PointToggleBtn
                          icon="📍"
                          label={event.locationLabel || "位置"}
                          achieved={event.locationAchieved}
                          onClick={(e) => { e.stopPropagation(); onToggle(event.id, "location"); }}
                        />
                      )}
                      {event.taskPoint > 0 && (
                        <PointToggleBtn
                          icon="📚"
                          label={event.taskLabel || "タスク"}
                          achieved={event.taskAchieved}
                          onClick={(e) => { e.stopPropagation(); onToggle(event.id, "task"); }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div style={{
        marginTop: 8,
        padding: "8px 12px",
        background: "rgba(0,0,0,0.03)",
        borderRadius: 10,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <LegendItem icon="⏰" label="時間ポイント" color="#f59e0b" />
        <LegendItem icon="📍" label="位置ポイント" color="#60a5fa" />
        <LegendItem icon="📚" label="タスクポイント" color="#a78bfa" />
      </div>
    </div>
  );
}

function PointToggleBtn({
  icon, label, achieved, onClick
}: {
  icon: string;
  label: string;
  achieved: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 10px",
        borderRadius: 99,
        border: achieved ? "1.5px solid #34d399" : "1.5px solid rgba(0,0,0,0.12)",
        background: achieved
          ? "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(110,231,183,0.15))"
          : "rgba(255,255,255,0.8)",
        fontSize: 12,
        fontWeight: 600,
        color: achieved ? "#059669" : "#6b7280",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: achieved ? "0 0 8px rgba(52,211,153,0.2)" : "none",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {achieved && <span style={{ fontSize: 10 }}>✓</span>}
    </button>
  );
}

function LegendItem({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#9ca3af" }}>
      <span>{icon}</span>
      <span style={{ color }}>{label}</span>
    </div>
  );
}
