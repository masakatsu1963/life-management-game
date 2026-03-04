/**
 * TodayTimeline.tsx
 * デザイン: パステルかわいい × タスク選択型タイムライン
 *
 * UX:
 * - カードをタップ → コンテンツ選択が展開
 * - コンテンツを選択 → 「OK ✓」ボタンが出現
 * - OKボタン1タップ → タスク+リラックスポイントを一括加算
 */

import { useState, useEffect } from "react";
import type { DailyEvent, PointType } from "@/hooks/useScoreEngine";
import { TASK_CONTENTS, calcTimeBonus } from "@/hooks/useScoreEngine";
import { toast } from "sonner";

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

  // タスク選択型イベントのみ表示（isAuto=falseかつisLocation=false）
  const visibleEvents = events.filter(e => !e.isAuto && !e.isLocation);
  const now = nowStr(currentTime);
  const currentIdx = visibleEvents.findIndex(e => e.scheduledTime > now);

  // OKボタン：タスク＋リラックスを一括加算
  function handleOK(event: DailyEvent, e: React.MouseEvent) {
    e.stopPropagation();
    const content = TASK_CONTENTS.find(c => c.id === event.selectedContent);
    const pts: string[] = [];

    if (event.taskPoint > 0 && !event.taskAchieved) {
      onToggle(event.id, "task");
      pts.push(`📚 +${event.taskPoint}pt`);
    }
    if ((event.relaxPoint ?? 0) > 0 && !event.relaxAchieved) {
      onToggle(event.id, "relax");
      pts.push(`💆 +${event.relaxPoint}pt`);
    }

    const label = content ? `${content.emoji} ${content.label}` : event.label;
    if (pts.length > 0) {
      toast.success(`${label} 達成！ ${pts.join(" ")} 🌸`, { duration: 2500 });
    }
    setExpandedId(null);
  }

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
            (event.relaxAchieved ? (event.relaxPoint ?? 0) : 0);
          const totalEventPt = event.taskPoint + (event.relaxPoint ?? 0);
          const allDone = earnedEventPt > 0 && earnedEventPt >= totalEventPt;

          const showNowMarker = idx === currentIdx;

          // OKボタンを表示する条件：コンテンツが選択済み、かつ未達成
          const canOK = !allDone;

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
                onClick={() => !allDone && setExpandedId(expanded ? null : event.id)}
                style={{
                  display: "flex", alignItems: "flex-start",
                  marginBottom: 8,
                  cursor: allDone ? "default" : "pointer",
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
                  color: "white",
                }}>
                  {allDone ? "✓" : ""}
                </div>

                {/* カード本体 */}
                <div style={{
                  flex: 1,
                  background: allDone
                    ? "rgba(110,231,183,0.08)"
                    : isActive
                    ? "linear-gradient(135deg, rgba(244,114,182,0.08) 0%, rgba(192,132,245,0.08) 100%)"
                    : "rgba(255,255,255,0.7)",
                  borderRadius: 14, padding: "10px 12px",
                  border: allDone
                    ? "1px solid rgba(110,231,183,0.3)"
                    : isActive ? "1px solid rgba(192,132,245,0.3)" : "1px solid rgba(0,0,0,0.06)",
                  boxShadow: isActive && !allDone ? "0 2px 12px rgba(192,132,245,0.15)" : "none",
                  transition: "all 0.3s ease",
                }}>
                  {/* ヘッダー行 */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{event.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600,
                          color: allDone ? "#059669" : isActive ? "#7c3aed" : "#374151",
                          lineHeight: 1.3,
                        }}>
                          {event.label}
                          {allDone && <span style={{ marginLeft: 6, fontSize: 11, color: "#10b981" }}>✓ 完了</span>}
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
                          {/* リアルタイムカウントダウン（10分前から表示） */}
                          {!allDone && (() => {
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

                    {/* 右側：ポイントバッジ or OKボタン */}
                    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0, marginLeft: 8 }}>
                      {/* 達成済みバッジ */}
                      {allDone ? (
                        <div style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                          background: "rgba(110,231,183,0.2)", color: "#059669",
                        }}>
                          +{earnedEventPt}pt
                        </div>
                      ) : (
                        <>
                          {/* ポイント合計バッジ */}
                          <div style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 99,
                            background: "rgba(0,0,0,0.04)", color: "#9ca3af",
                          }}>
                            最大+{totalEventPt}pt
                          </div>
                          {/* 展開矢印 */}
                          {!expanded && (
                            <span style={{ fontSize: 10, color: "#d1d5db" }}>▼</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* 展開パネル：コンテンツ選択 + OKボタン */}
                  {expanded && !allDone && (
                    <div
                      style={{ marginTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 10 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* タスク内容セレクト */}
                      {event.requiresTask && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 8 }}>
                            何をしましたか？
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {TASK_CONTENTS.map(c => (
                              <button
                                key={c.id}
                                onClick={() => onContentChange(event.id, c.id)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 6,
                                  padding: "8px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500,
                                  cursor: "pointer", transition: "all 0.15s",
                                  background: event.selectedContent === c.id
                                    ? "linear-gradient(135deg, rgba(244,114,182,0.2), rgba(192,132,245,0.2))"
                                    : "rgba(0,0,0,0.03)",
                                  border: event.selectedContent === c.id
                                    ? "1.5px solid rgba(244,114,182,0.5)" : "1px solid rgba(0,0,0,0.08)",
                                  color: event.selectedContent === c.id ? "#be185d" : "#6b7280",
                                  boxShadow: event.selectedContent === c.id ? "0 2px 6px rgba(244,114,182,0.2)" : "none",
                                }}
                              >
                                <span style={{ fontSize: 16 }}>{c.emoji}</span>
                                <span style={{ flex: 1, textAlign: "left" }}>{c.label}</span>
                                <span style={{ fontSize: 10, color: "#f472b6", fontWeight: 700, flexShrink: 0 }}>
                                  +{c.taskPt + (c.relaxPt ?? 0)}pt
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* OKボタン */}
                      {canOK && (
                        <button
                          onClick={(e) => handleOK(event, e)}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: 14,
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: "pointer",
                            border: "none",
                            background: "linear-gradient(135deg, #f9a8d4, #c084fc)",
                            color: "white",
                            boxShadow: "0 4px 14px rgba(192,132,252,0.4)",
                            letterSpacing: "0.05em",
                            transition: "all 0.2s",
                          }}
                        >
                          ✓ OK！ポイント加算
                        </button>
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
