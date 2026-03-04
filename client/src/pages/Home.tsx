/**
 * Home.tsx - Main game screen
 * Design: Dark Gaming Gauge
 * - Deep blue-black background, neon accents
 * - Orbitron for numbers, Noto Sans JP for labels
 * - Mobile-first 390px single column layout
 * - Real-time needle meter + 24h donut chart
 */

import { useState, useEffect, useRef } from "react";
import GaugeMeter from "@/components/GaugeMeter";
import TimeDonut from "@/components/TimeDonut";
import DifficultySlider from "@/components/DifficultySlider";
import ScoreBreakdownPanel from "@/components/ScoreBreakdownPanel";
import ScheduleList from "@/components/ScheduleList";
import CheatPanel from "@/components/CheatPanel";
import EmotionSelector from "@/components/EmotionSelector";
import { useScoreEngine } from "@/hooks/useScoreEngine";
import ScheduleEditor from "@/components/ScheduleEditor";
import LocationPanel from "@/components/LocationPanel";
import { toast } from "sonner";

export default function Home() {
  const {
    gameState,
    difficulty,
    changeDifficulty,
    toggleActivity,
    changeEmotion,
    useCheat,
    forceUpdateScore,
    saveSchedule,
    setSpaceDeviation,
  } = useScoreEngine();

  const [showEditor, setShowEditor] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"dashboard" | "schedule" | "settings">("dashboard");
  const prevScoreRef = useRef(gameState.score.total);
  const [scoreFlash, setScoreFlash] = useState(false);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Flash effect when score changes significantly
  useEffect(() => {
    const diff = Math.abs(gameState.score.total - prevScoreRef.current);
    if (diff >= 2) {
      setScoreFlash(true);
      setTimeout(() => setScoreFlash(false), 600);
      prevScoreRef.current = gameState.score.total;
    }
  }, [gameState.score.total]);

  const score = gameState.score.total;
  const scoreColor = score >= 70 ? "#22d97a" : score >= 40 ? "#f0b429" : "#f05252";
  const scoreLabel = score >= 80 ? "絶好調！" : score >= 60 ? "順調" : score >= 40 ? "要注意" : "ピンチ！";

  // Background glow based on score
  const bgGlow = score >= 70
    ? "radial-gradient(ellipse at 50% 0%, rgba(34,217,122,0.08) 0%, transparent 60%)"
    : score >= 40
    ? "radial-gradient(ellipse at 50% 0%, rgba(240,180,41,0.08) 0%, transparent 60%)"
    : "radial-gradient(ellipse at 50% 0%, rgba(240,82,82,0.10) 0%, transparent 60%)";

  const handleDemoTick = () => {
    forceUpdateScore();
    toast.info("スコアを更新しました", {
      style: { background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" },
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "oklch(0.12 0.025 265)",
        fontFamily: "'Noto Sans JP', sans-serif",
        maxWidth: "430px",
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Score-based glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{ background: bgGlow }}
      />

      {/* Flash overlay */}
      {scoreFlash && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `${scoreColor}15`,
            animation: "pulse 0.6s ease-out",
          }}
        />
      )}

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: `${scoreColor}22`, border: `1px solid ${scoreColor}44` }}
          >
            ⚡
          </div>
          <div>
            <div
              className="text-xs font-bold"
              style={{ fontFamily: "Orbitron, monospace", color: scoreColor, lineHeight: 1.2 }}
            >
              LIFE MANAGER
            </div>
            <div
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem" }}
            >
              ソロモード
            </div>
          </div>
        </div>

        {/* Current time */}
        <div className="flex items-center gap-3">
          <div
            className="text-xs"
            style={{ fontFamily: "Orbitron, monospace", color: "rgba(255,255,255,0.5)" }}
          >
            {currentTime.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>

          {/* Warning indicator */}
          {gameState.isWarning && (
            <div
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{
                fontFamily: "Orbitron, monospace",
                color: "#f05252",
                background: "rgba(240,82,82,0.15)",
                border: "1px solid rgba(240,82,82,0.3)",
                animation: "pulse-red 0.8s ease-in-out infinite",
              }}
            >
              ⚠ 遅延
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">

        {/* === GAUGE SECTION === */}
        <div
          className="mt-3 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${scoreColor}33`,
            boxShadow: `0 0 30px ${scoreColor}15`,
          }}
        >
          {/* Score label */}
          <div className="flex items-center justify-between px-4 pt-3">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                color: scoreColor,
                background: `${scoreColor}20`,
                border: `1px solid ${scoreColor}44`,
              }}
            >
              {scoreLabel}
            </span>
            <button
              onClick={handleDemoTick}
              className="text-xs px-2 py-0.5 rounded transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Noto Sans JP', sans-serif" }}
            >
              更新
            </button>
          </div>

          {/* Needle meter */}
          <div className="px-2 pb-1">
            <GaugeMeter score={score} size={340} animated />
          </div>

          {/* Status row */}
          <div
            className="flex items-center justify-around px-4 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base">⏰</span>
              <span
                className="text-xs font-bold"
                style={{
                  fontFamily: "Orbitron, monospace",
                  color: gameState.timeDeviation <= 5 ? "#22d97a" : "#f05252",
                }}
              >
                {gameState.timeDeviation === 0 ? "±0分" : `-${gameState.timeDeviation}分`}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem" }}>
                時間ズレ
              </span>
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base">📍</span>
              <span
                className="text-xs font-bold"
                style={{
                  fontFamily: "Orbitron, monospace",
                  color: gameState.spaceDeviation <= 0.1 ? "#22d97a" : "#f0b429",
                }}
              >
                {gameState.spaceDeviation.toFixed(1)}km
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem" }}>
                距離
              </span>
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base">💎</span>
              <span
                className="text-xs font-bold"
                style={{ fontFamily: "Orbitron, monospace", color: "#f0b429" }}
              >
                {gameState.cheatPoints}CP
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem" }}>
                チート残
              </span>
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base">🔥</span>
              <span
                className="text-xs font-bold"
                style={{ fontFamily: "Orbitron, monospace", color: "#f0b429" }}
              >
                {gameState.streak}日
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem" }}>
                連続
              </span>
            </div>
          </div>
        </div>

        {/* === NEXT EVENT BANNER === */}
        {gameState.nextEvent && (
          <div
            className="mt-3 px-4 py-2.5 rounded-xl flex items-center gap-3"
            style={{
              background: "rgba(240,180,41,0.08)",
              border: "1px solid rgba(240,180,41,0.2)",
            }}
          >
            <span className="text-lg">⏱</span>
            <div className="flex-1">
              <span
                className="text-xs"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.5)" }}
              >
                次のイベントまで{gameState.minutesUntilNext}分
              </span>
              <div
                className="text-sm font-bold"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.85)" }}
              >
                {gameState.nextEvent.time} {gameState.nextEvent.activity}
              </div>
            </div>
            {gameState.minutesUntilNext <= 14 && (
              <span
                className="text-xs font-bold px-2 py-1 rounded"
                style={{
                  fontFamily: "Orbitron, monospace",
                  color: "#f0b429",
                  background: "rgba(240,180,41,0.15)",
                }}
              >
                挽回可能
              </span>
            )}
          </div>
        )}

        {/* === TABS === */}
        <div
          className="mt-4 flex rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {(["dashboard", "schedule", "settings"] as const).map((tab) => {
            const labels = { dashboard: "📊 ダッシュボード", schedule: "📋 スケジュール", settings: "⚙️ 設定" };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 text-xs font-medium transition-all duration-200"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.35)",
                  background: isActive ? `${scoreColor}22` : "transparent",
                  borderBottom: isActive ? `2px solid ${scoreColor}` : "2px solid transparent",
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* === DASHBOARD TAB === */}
        {activeTab === "dashboard" && (
          <div className="mt-3 flex flex-col gap-3">
            {/* 24h donut + breakdown */}
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-start gap-4">
                {/* Donut */}
                <div className="flex flex-col items-center gap-2">
                  <TimeDonut
                    schedule={gameState.schedule}
                    currentTime={currentTime}
                    size={140}
                  />
                  {/* Legend */}
                  <div className="flex flex-col gap-1">
                    {[
                      { color: "#22d97a", label: "達成" },
                      { color: "#60a5fa", label: "予定" },
                      { color: "#f05252", label: "未達" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem" }}>
                          {l.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="flex-1">
                  <div
                    className="text-xs font-medium mb-2"
                    style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.5)" }}
                  >
                    スコア内訳
                  </div>
                  <ScoreBreakdownPanel
                    breakdown={gameState.score}
                    timeDeviation={gameState.timeDeviation}
                    spaceDeviation={gameState.spaceDeviation}
                  />
                </div>
              </div>
            </div>

            {/* Difficulty slider */}
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <DifficultySlider value={difficulty} onChange={changeDifficulty} />
            </div>

            {/* Emotion selector */}
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <EmotionSelector value={gameState.emotionLevel} onChange={changeEmotion} />
            </div>

            {/* Cheat panel */}
            <CheatPanel
              cheatPoints={gameState.cheatPoints}
              streak={gameState.streak}
              onUseCheat={useCheat}
            />

            {/* Battle placeholder */}
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity: 0.6,
              }}
              onClick={() => toast.info("2人対戦は Week3 実装予定です", {
                style: { background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" },
              })}
            >
              <span className="text-xl">⚔️</span>
              <div className="flex-1">
                <div
                  className="text-sm font-bold"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.5)" }}
                >
                  2人対戦モード
                </div>
                <div
                  className="text-xs"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.25)" }}
                >
                  招待コードで友達と対戦（Coming Soon）
                </div>
              </div>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  fontFamily: "Orbitron, monospace",
                  color: "rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                SOON
              </span>
            </div>
          </div>
        )}

        {/* === SCHEDULE TAB === */}
        {activeTab === "schedule" && (
          <div className="mt-3 flex flex-col gap-3">
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.7)" }}
                >
                  今日のスケジュール
                </span>
                <button
                  onClick={() => setShowEditor(true)}
                  className="text-xs px-2 py-1 rounded-lg transition-all hover:bg-white/10"
                  style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    color: "#22d97a",
                    background: "rgba(34,217,122,0.1)",
                    border: "1px solid rgba(34,217,122,0.25)",
                  }}
                >
                  ✏️ 編集
                </button>
              </div>
              <ScheduleList
                schedule={gameState.schedule}
                currentTime={currentTime}
                onToggle={toggleActivity}
              />
            </div>
          </div>
        )}

        {/* Schedule Editor Modal */}
        {showEditor && (
          <ScheduleEditor
            schedule={gameState.schedule}
            onSave={saveSchedule}
            onClose={() => setShowEditor(false)}
          />
        )}

        {/* === SETTINGS TAB === */}
        {activeTab === "settings" && (
          <div className="mt-3 flex flex-col gap-3">
            {/* Difficulty */}
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div
                className="text-sm font-bold mb-3"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.7)" }}
              >
                ゲーム設定
              </div>
              <DifficultySlider value={difficulty} onChange={changeDifficulty} />
            </div>

            {/* Score formula info */}
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div
                className="text-sm font-bold mb-3"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.7)" }}
              >
                スコア計算式
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: "時間精度", weight: "40%", icon: "⏰" },
                  { label: "空間精度", weight: "30%", icon: "📍" },
                  { label: "活動達成度", weight: "20%", icon: "✅" },
                  { label: "感情スコア", weight: "10%", icon: "💭" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span
                        className="text-sm"
                        style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.6)" }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ fontFamily: "Orbitron, monospace", color: scoreColor }}
                    >
                      {item.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location panel */}
            <LocationPanel
              onDistanceUpdate={setSpaceDeviation}
              currentDistance={gameState.spaceDeviation}
            />

            {/* Coming soon features */}
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div
                className="text-sm font-bold mb-3"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.7)" }}
              >
                今後の実装予定
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { week: "Week2", label: "GPS位置情報連携", icon: "🗺️" },
                  { week: "Week2", label: "プッシュ通知", icon: "🔔" },
                  { week: "Week3", label: "招待コード2人対戦", icon: "⚔️" },
                  { week: "Week4", label: "課金UI・AIコーチ", icon: "🤖" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span
                      className="text-sm flex-1"
                      style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.4)" }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        fontFamily: "Orbitron, monospace",
                        color: "rgba(255,255,255,0.25)",
                        background: "rgba(255,255,255,0.06)",
                        fontSize: "0.6rem",
                      }}
                    >
                      {item.week}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex items-center justify-around px-4 py-3 z-20"
        style={{
          background: "rgba(13,16,32,0.95)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        {(["dashboard", "schedule", "settings"] as const).map((tab) => {
          const icons = { dashboard: "📊", schedule: "📋", settings: "⚙️" };
          const labels = { dashboard: "ダッシュ", schedule: "スケジュール", settings: "設定" };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200"
              style={{
                background: isActive ? `${scoreColor}18` : "transparent",
              }}
            >
              <span className="text-lg">{icons[tab]}</span>
              <span
                className="text-xs"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  color: isActive ? scoreColor : "rgba(255,255,255,0.3)",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: "0.6rem",
                }}
              >
                {labels[tab]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
