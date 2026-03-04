/**
 * TodayTimeline.tsx
 * デザイン: パステルかわいい × タスク選択型タイムライン
 *
 * 変更点:
 * - isAuto=trueのイベントは非表示（自動取得ポイント）
 * - isAuto=falseのイベントのみ表示（タスク選択型）
 * - ポイント軸: 📚タスク / 💆リラックス / 📍位置
 * - コンテンツ選択でポイントがリアルタイム変動
 */

import { useState, useEffect } from "react";
import type { DailyEvent, PointType } from "@/hooks/useScoreEngine";
import { TASK_CONTENTS, calcTimeBonus } from "@/hooks/useScoreEngine";

interface Props {
  events: DailyEvent[];
  currentTime: Date;
  onToggle: (eventId: string, pointType: PointType) => void;
  onContentChange: (eventId: string, contentId: string) => void;
  earnedPoints: number;
  totalPoints: number;
  bonusTotal?: number;
}

function nowStr(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getStatus(scheduledTime: string, currentTime: Date): "past" | "now" | "future" {
  const now = nowStr(currentTime);
  const [sh, sm] = scheduledTime.split(":").map(Number);
  const [nh, nm] = now.split(":").map(Number);
  const diff = (sh * 60 + sm) - (nh * 60 + nm);
  if (diff < -45) return "past";
  if (diff <= 20) return "now";
  return "future";
}

export default function TodayTimeline({
  events,
  currentTime,
  onToggle,
  onContentChange,
  earnedPoints,
  totalPoints,
  bonusTotal = 0,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // タスク選択型イベントのみ表示
  const visibleEvents = events.filter(e => !e.isAuto);
  const now = nowStr(currentTime);
  const currentIdx = visibleEvents.findIndex(e => e.scheduledTime > now);

  return (
    <div style={{ paddingBottom: 8 }}>
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
          {bonusTotal > 0 && (
            <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, marginTop: 2 }}>
              ⭐ 時間ボーナス +{bonusTotal}pt
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>達成率</div>
          <div style={{
            width: 80, height: 8,
            background: "rgba(0,0,0,0.08)",
            borderRadius: 99, overflow: "hidden",
          }}>
            <div style={{
              width: `${totalPoints > 0 ? Math.min(100, (earnedPoints / totalPoints) * 100) : 0}%`,
              height: "100%",
              background: "linear-gradient(90deg, #f9a8d4, #c084f5)",
              borderRadius: 99,
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ fontSize: 12, color: "#7c3aed", fontWeight: 600, marginTop: 2 }}>
            {totalPoints > 0 ? Math.round(Math.min(100, (earnedPoints / totalPoints) * 100)) : 0}%
          </div>
        </div>
      </div>

      {/* タイムライン */}
      <div style={{ position: "relative" }}>
        {/* 縦線 */}
        <div style={{
          position: "absolute",
          left: 28, top: 0, bottom: 0, width: 2,
          background: "linear-gradient(180deg, #f9a8d4 0%, #c084f5 50%, #6ee7b7 100%)",
          opacity: 0.2, borderRadius: 99,
        }} />

        {visibleEvents.map((event, idx) => {
          const status = getStatus(event.scheduledTime, currentTime);
          const isActive = idx === (currentIdx > 0 ? currentIdx - 1 : currentIdx === 0 ? -1 : visibleEvents.length - 1);
          const expanded = expandedId === event.id;
          const selectedContent = TASK_CONTENTS.find(c => c.id === event.selectedContent);

          const earnedEventPt =
            (event.taskAchieved ? event.taskPoint : 0) +
            (event.relaxAchieved ? (event.relaxPoint ?? 0) : 0) +
            (event.locationAchieved ? event.locationPoint : 0);
          const totalEventPt = event.taskPoint + (event.relaxPoint ?? 0) + event.locationPoint;
          const allDone = earnedEventPt > 0 && earnedEventPt >= totalEventPt;

          const showNowMarker = idx === currentIdx;

          return (
            <div key={event.id}>
              {/* 今ここマーカー */}
              {showNowMarker && (
                <div style={{
                  display: "flex", alignItems: "center",
                  marginLeft: 16, marginBottom: 6, marginTop: 4,
                }}>
                  <div style={{ width: 26, height: 2, background: "#f472b6", borderRadius: 99, marginRight: 8 }} />
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: "#f472b6",
                    background: "rgba(244,114,182,0.12)",
                    padding: "2px 8px", borderRadius: 99,
                  }}>
                    ▶ 今ここ {now}
                  </div>
                </div>
              )}

              {/* イベントカード */}
              <div
                onClick={() => setExpandedId(expanded ? null : event.id)}
                style={{
                  display: "flex", alignItems: "flex-start",
                  marginBottom: 8, cursor: "pointer",
                  opacity: status === "past" && !allDone ? 0.65 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {/* タイムラインドット */}
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: allDone
                    ? "linear-gradient(135deg, #f9a8d4, #c084f5)"
                    : isActive ? "rgba(192,132,245,0.3)" : "rgba(0,0,0,0.08)",
                  border: isActive ? "2px solid #c084f5" : "2px solid rgba(0,0,0,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, flexShrink: 0,
                  marginTop: 10, marginLeft: 19, marginRight: 12,
                  zIndex: 1, position: "relative",
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
                    : allDone ? "rgba(110,231,183,0.06)" : "rgba(255,255,255,0.7)",
                  borderRadius: 14, padding: "10px 12px",
                  border: isActive
                    ? "1px solid rgba(192,132,245,0.3)"
                    : allDone ? "1px solid rgba(110,231,183,0.3)" : "1px solid rgba(0,0,0,0.06)",
                  boxShadow: isActive ? "0 2px 12px rgba(192,132,245,0.15)" : "none",
                  transition: "all 0.3s ease",
                }}>
                  {/* ヘッダー行 */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{event.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600,
                          color: allDone ? "#059669" : isActive ? "#7c3aed" : "#374151",
                          lineHeight: 1.3,
                        }}>
                          {event.label}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                          <span>{event.scheduledTime}</span>
                          {selectedContent && (
                            <span style={{
                              background: "rgba(244,114,182,0.12)",
                              color: "#be185d", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 600,
                            }}>
                              {selectedContent.emoji} {selectedContent.label}
                            </span>
                          )}
                          {/* リアルタイムカウントダウン */}
                          {!event.taskAchieved && event.taskPoint > 0 && (() => {
                            const liveHHMM = `${String(liveTime.getHours()).padStart(2, "0")}:${String(liveTime.getMinutes()).padStart(2, "0")}`;
                            const [sh, sm] = event.scheduledTime.split(":").map(Number);
                            const diffSec = (sh * 60 + sm) * 60
                              - (liveTime.getHours() * 60 + liveTime.getMinutes()) * 60
                              - liveTime.getSeconds();
                            if (diffSec > 0 && diffSec <= 600) {
                              const preview = calcTimeBonus(event.scheduledTime, liveHHMM, liveTime);
                              const mm = Math.floor(diffSec / 60);
                              const ss = diffSec % 60;
                              return (
                                <span style={{ color: preview >= 4 ? "#f59e0b" : "#9ca3af", fontWeight: 600, fontSize: 10 }}>
                                  ⏱ {mm}:{String(ss).padStart(2, "0")} → +{preview}pt予測
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* ポイントバッジ */}
                    <div style={{ display: "flex", gap: 3, alignItems: "center", flexShrink: 0, marginLeft: 6 }}>
                      {event.taskPoint > 0 && (
                        <div style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 5px", borderRadius: 99,
                          background: event.taskAchieved ? "rgba(244,114,182,0.2)" : "rgba(0,0,0,0.05)",
                          color: event.taskAchieved ? "#be185d" : "#9ca3af",
                        }}>
                          📚{event.taskPoint}
                        </div>
                      )}
                      {(event.relaxPoint ?? 0) > 0 && (
                        <div style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 5px", borderRadius: 99,
                          background: event.relaxAchieved ? "rgba(167,139,250,0.2)" : "rgba(0,0,0,0.05)",
                          color: event.relaxAchieved ? "#7c3aed" : "#9ca3af",
                        }}>
                          💆{event.relaxPoint}
                        </div>
                      )}
                      {event.locationPoint > 0 && (
                        <div style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 5px", borderRadius: 99,
                          background: event.locationAchieved ? "rgba(96,165,250,0.2)" : "rgba(0,0,0,0.05)",
                          color: event.locationAchieved ? "#1d4ed8" : "#9ca3af",
                        }}>
                          📍{event.locationPoint}
                        </div>
                      )}
                      <span style={{ fontSize: 10, color: "#d1d5db", marginLeft: 2 }}>
                        {expanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* 展開パネル */}
                  {expanded && (
                    <div style={{ marginTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 10 }}>
                      {/* タスク内容セレクト */}
                      {event.requiresTask && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 6 }}>
                            タスク内容を選択（ポイントが変わります）
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {TASK_CONTENTS.map(c => (
                              <button
                                key={c.id}
                                onClick={(ev) => { ev.stopPropagation(); onContentChange(event.id, c.id); }}
                                style={{
                                  display: "flex", alignItems: "center", gap: 6,
                                  padding: "7px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500,
                                  cursor: "pointer", transition: "all 0.15s",
                                  background: event.selectedContent === c.id
                                    ? "rgba(244,114,182,0.15)" : "rgba(0,0,0,0.03)",
                                  border: event.selectedContent === c.id
                                    ? "1.5px solid rgba(244,114,182,0.5)" : "1px solid rgba(0,0,0,0.08)",
                                  color: event.selectedContent === c.id ? "#be185d" : "#6b7280",
                                }}
                              >
                                <span style={{ fontSize: 14 }}>{c.emoji}</span>
                                <span style={{ flex: 1, textAlign: "left" }}>{c.label}</span>
                                <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                                  <span style={{ fontSize: 10, color: "#f472b6", fontWeight: 700 }}>📚{c.taskPt}</span>
                                  {c.relaxPt > 0 && (
                                    <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700 }}>💆{c.relaxPt}</span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ポイント記録ボタン */}
                      <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 6 }}>
                        ポイントを記録
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {event.taskPoint > 0 && (
                          <button
                            onClick={(ev) => { ev.stopPropagation(); onToggle(event.id, "task"); }}
                            style={{
                              padding: "8px 14px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                              cursor: "pointer", transition: "all 0.15s",
                              background: event.taskAchieved
                                ? "linear-gradient(135deg, #f9a8d4, #f472b6)" : "rgba(244,114,182,0.08)",
                              border: event.taskAchieved ? "none" : "1px solid rgba(244,114,182,0.3)",
                              color: event.taskAchieved ? "#fff" : "#be185d",
                              boxShadow: event.taskAchieved ? "0 2px 8px rgba(244,114,182,0.3)" : "none",
                            }}
                          >
                            📚 タスク +{event.taskPoint}pt {event.taskAchieved ? "✓" : ""}
                          </button>
                        )}
                        {(event.relaxPoint ?? 0) > 0 && (
                          <button
                            onClick={(ev) => { ev.stopPropagation(); onToggle(event.id, "relax"); }}
                            style={{
                              padding: "8px 14px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                              cursor: "pointer", transition: "all 0.15s",
                              background: event.relaxAchieved
                                ? "linear-gradient(135deg, #c4b5fd, #a78bfa)" : "rgba(167,139,250,0.08)",
                              border: event.relaxAchieved ? "none" : "1px solid rgba(167,139,250,0.3)",
                              color: event.relaxAchieved ? "#fff" : "#7c3aed",
                              boxShadow: event.relaxAchieved ? "0 2px 8px rgba(167,139,250,0.3)" : "none",
                            }}
                          >
                            💆 リラックス +{event.relaxPoint}pt {event.relaxAchieved ? "✓" : ""}
                          </button>
                        )}
                        {event.locationPoint > 0 && (
                          <button
                            onClick={(ev) => { ev.stopPropagation(); onToggle(event.id, "location"); }}
                            style={{
                              padding: "8px 14px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                              cursor: "pointer", transition: "all 0.15s",
                              background: event.locationAchieved
                                ? "linear-gradient(135deg, #93c5fd, #60a5fa)" : "rgba(96,165,250,0.08)",
                              border: event.locationAchieved ? "none" : "1px solid rgba(96,165,250,0.3)",
                              color: event.locationAchieved ? "#fff" : "#1d4ed8",
                              boxShadow: event.locationAchieved ? "0 2px 8px rgba(96,165,250,0.3)" : "none",
                            }}
                          >
                            📍 位置 +{event.locationPoint}pt {event.locationAchieved ? "✓" : ""}
                          </button>
                        )}
                      </div>

                      {event.requiresLocation && event.locationLabel && (
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                          📍 場所: {event.locationLabel}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {visibleEvents.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 13 }}>
            <div>📋 タスクがありません</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>「理想設定」でスケジュールを確認してください</div>
          </div>
        )}
      </div>
    </div>
  );
}
