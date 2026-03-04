/**
 * Home.tsx - Main game screen
 * Design: Pastel Kawaii Life Manager
 * - Soft blush pink / lavender / mint cream palette
 * - Shippori Mincho for headings, Noto Sans JP for body
 * - Watercolor hero background with floral gauge decoration
 * - Mobile-first 390px single column layout
 */

import { useState, useEffect, useRef } from "react";
import GaugeMeter from "@/components/GaugeMeter";
import TimeDonut from "@/components/TimeDonut";
import DifficultySlider from "@/components/DifficultySlider";
import ScoreBreakdownPanel from "@/components/ScoreBreakdownPanel";
import ScheduleList from "@/components/ScheduleList";
import CheatPanel from "@/components/CheatPanel";
import EmotionSelector from "@/components/EmotionSelector";
import LocationPanel from "@/components/LocationPanel";
import { useScoreEngine } from "@/hooks/useScoreEngine";
import ScheduleEditor from "@/components/ScheduleEditor";
import { toast } from "sonner";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663145989169/V3mzZwvpdi82dLMoVHx8Pr/hero-bg-JeDdhMmnmpUPNBZ3PigiRd.webp";
const FLOWER_DECO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663145989169/V3mzZwvpdi82dLMoVHx8Pr/gauge-deco-EE7ciXtuBtnWH5NUxLfPi4.png";

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

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const diff = Math.abs(gameState.score.total - prevScoreRef.current);
    if (diff >= 2) {
      setScoreFlash(true);
      setTimeout(() => setScoreFlash(false), 600);
      prevScoreRef.current = gameState.score.total;
    }
  }, [gameState.score.total]);

  const score = gameState.score.total;

  // Score-based color scheme
  const scoreScheme = score >= 70
    ? { main: "#34d399", light: "#d1fae5", badge: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.3)", label: "絶好調！🌿" }
    : score >= 40
    ? { main: "#c084f5", light: "#f3e8ff", badge: "rgba(192,132,245,0.15)", border: "rgba(192,132,245,0.3)", label: "順調🌷" }
    : { main: "#f472b6", light: "#fce7f3", badge: "rgba(244,114,182,0.15)", border: "rgba(244,114,182,0.3)", label: "がんばろう🌸" };

  const handleRefresh = () => {
    forceUpdateScore();
    toast.success("スコアを更新しました ✨", {
      style: { background: "#fdf6ff", border: "1px solid rgba(192,132,245,0.3)", color: "#6b21a8" },
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#fdf6ff", maxWidth: "430px", margin: "0 auto", fontFamily: "'Noto Sans JP', sans-serif" }}
    >
      {/* Hero background (top section only) */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "340px",
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
          opacity: 0.35,
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Score flash */}
      {scoreFlash && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: `${scoreScheme.main}10`, animation: "shimmer-in 0.6s ease-out" }}
        />
      )}

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-4 pt-5 pb-3"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-2xl flex items-center justify-center text-base"
            style={{ background: "rgba(255,255,255,0.85)", boxShadow: "0 2px 8px rgba(244,114,182,0.2)", border: "1.5px solid rgba(244,114,182,0.2)" }}
          >
            🌸
          </div>
          <div>
            <div className="text-sm font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.65)", lineHeight: 1.2 }}>
              Life Manager
            </div>
            <div className="text-xs" style={{ color: "rgba(0,0,0,0.3)", fontSize: "0.6rem" }}>
              ソロモード
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="text-xs px-2 py-1 rounded-full"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)", background: "rgba(255,255,255,0.7)" }}
          >
            {currentTime.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
          </div>
          {gameState.isWarning && (
            <div
              className="px-2 py-0.5 rounded-full text-xs font-bold pulse-warn"
              style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#dc2626", background: "rgba(252,165,165,0.2)", border: "1px solid rgba(252,165,165,0.4)" }}
            >
              ⚠ 遅延
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 pb-28">

        {/* === GAUGE CARD === */}
        <div
          className="rounded-3xl overflow-hidden mb-3"
          style={{
            background: "rgba(255,255,255,0.82)",
            border: `1.5px solid ${scoreScheme.border}`,
            boxShadow: `0 8px 32px ${scoreScheme.main}18, 0 2px 8px rgba(0,0,0,0.06)`,
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Score label row */}
          <div className="flex items-center justify-between px-4 pt-4">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ fontFamily: "'Noto Sans JP', sans-serif", color: scoreScheme.main, background: scoreScheme.badge, border: `1px solid ${scoreScheme.border}` }}
            >
              {scoreScheme.label}
            </span>
            <button
              onClick={handleRefresh}
              className="text-xs px-2 py-1 rounded-full transition-all hover:bg-pink-50"
              style={{ color: "rgba(0,0,0,0.3)", fontFamily: "'Noto Sans JP', sans-serif" }}
            >
              更新
            </button>
          </div>

          {/* Needle meter */}
          <div className="px-2 pt-1 pb-2">
            <GaugeMeter
              score={score}
              size={340}
              animated
              flowerDecoUrl={FLOWER_DECO}
            />
          </div>

          {/* Status row */}
          <div
            className="flex items-center justify-around px-4 py-3"
            style={{ borderTop: `1px solid ${scoreScheme.border}30` }}
          >
            {[
              { icon: "⏰", value: gameState.timeDeviation === 0 ? "±0分" : `-${gameState.timeDeviation}分`, label: "時間ズレ", color: gameState.timeDeviation <= 5 ? "#34d399" : "#f472b6" },
              { icon: "📍", value: `${gameState.spaceDeviation.toFixed(1)}km`, label: "距離", color: gameState.spaceDeviation <= 0.1 ? "#34d399" : "#c084f5" },
              { icon: "💎", value: `${gameState.cheatPoints}CP`, label: "チート残", color: "#a855f7" },
              { icon: "🔥", value: `${gameState.streak}日`, label: "連続", color: "#f59e0b" },
            ].map((item, i, arr) => (
              <div key={item.label} className="flex items-center">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: item.color }}>
                    {item.value}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(0,0,0,0.3)", fontSize: "0.58rem" }}>
                    {item.label}
                  </span>
                </div>
                {i < arr.length - 1 && <div className="w-px h-8 mx-3" style={{ background: "rgba(0,0,0,0.07)" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* === NEXT EVENT BANNER === */}
        {gameState.nextEvent && (
          <div
            className="mb-3 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.75)", border: "1.5px solid rgba(192,132,245,0.2)", boxShadow: "0 2px 10px rgba(192,132,245,0.08)" }}
          >
            <span className="text-xl float-gentle">⏱</span>
            <div className="flex-1">
              <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
                次のイベントまで {gameState.minutesUntilNext}分
              </span>
              <div className="text-sm font-bold" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.65)" }}>
                {gameState.nextEvent.time} {gameState.nextEvent.activity}
              </div>
            </div>
            {gameState.minutesUntilNext <= 14 && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#a855f7", background: "rgba(192,132,245,0.15)" }}
              >
                挽回可能✨
              </span>
            )}
          </div>
        )}

        {/* === TABS === */}
        <div
          className="mb-3 flex rounded-2xl overflow-hidden p-1"
          style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)" }}
        >
          {(["dashboard", "schedule", "settings"] as const).map((tab) => {
            const labels = { dashboard: "📊 ダッシュ", schedule: "📋 スケジュール", settings: "⚙️ 設定" };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 text-xs font-medium transition-all duration-200 rounded-xl"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  color: isActive ? scoreScheme.main : "rgba(0,0,0,0.35)",
                  background: isActive ? "rgba(255,255,255,0.95)" : "transparent",
                  fontWeight: isActive ? 700 : 400,
                  boxShadow: isActive ? `0 2px 8px ${scoreScheme.main}20` : "none",
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* === DASHBOARD TAB === */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-3">
            {/* 24h donut + breakdown */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2">
                  <TimeDonut schedule={gameState.schedule} currentTime={currentTime} size={140} />
                  <div className="flex flex-col gap-1">
                    {[
                      { color: "#6ee7b7", label: "達成" },
                      { color: "#93c5fd", label: "予定" },
                      { color: "#fca5a5", label: "未達" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                        <span className="text-xs" style={{ color: "rgba(0,0,0,0.4)", fontSize: "0.6rem" }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium mb-2" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
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

            {/* Difficulty */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <DifficultySlider value={difficulty} onChange={changeDifficulty} />
            </div>

            {/* Emotion */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <EmotionSelector value={gameState.emotionLevel} onChange={changeEmotion} />
            </div>

            {/* Cheat panel */}
            <CheatPanel cheatPoints={gameState.cheatPoints} streak={gameState.streak} onUseCheat={useCheat} />

            {/* Battle placeholder */}
            <button
              className="rounded-2xl p-4 flex items-center gap-3 w-full text-left transition-all hover:opacity-80"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1.5px dashed rgba(192,132,245,0.25)",
                opacity: 0.7,
              }}
              onClick={() => toast.info("2人対戦は Week3 実装予定です 🎮", {
                style: { background: "#fdf6ff", border: "1px solid rgba(192,132,245,0.3)", color: "#6b21a8" },
              })}
            >
              <span className="text-xl">⚔️</span>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.45)" }}>
                  2人対戦モード
                </div>
                <div className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.25)" }}>
                  招待コードで友達と対戦（Coming Soon）
                </div>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(192,132,245,0.6)", background: "rgba(192,132,245,0.08)" }}
              >
                SOON
              </span>
            </button>
          </div>
        )}

        {/* === SCHEDULE TAB === */}
        {activeTab === "schedule" && (
          <div className="flex flex-col gap-3">
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}>
                  🌸 今日のスケジュール
                </span>
                <button
                  onClick={() => setShowEditor(true)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
                  style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    color: "#a855f7",
                    background: "rgba(192,132,245,0.12)",
                    border: "1.5px solid rgba(192,132,245,0.3)",
                  }}
                >
                  ✏️ 編集
                </button>
              </div>
              <ScheduleList schedule={gameState.schedule} currentTime={currentTime} onToggle={toggleActivity} />
            </div>
          </div>
        )}

        {/* Schedule Editor Modal */}
        {showEditor && (
          <ScheduleEditor schedule={gameState.schedule} onSave={saveSchedule} onClose={() => setShowEditor(false)} />
        )}

        {/* === SETTINGS TAB === */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-3">
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="text-sm font-bold mb-3" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}>
                ゲーム設定
              </div>
              <DifficultySlider value={difficulty} onChange={changeDifficulty} />
            </div>

            {/* Score formula */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="text-sm font-bold mb-3" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}>
                スコア計算式
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: "時間精度", weight: "40%", icon: "⏰", color: "#c084f5" },
                  { label: "空間精度", weight: "30%", icon: "📍", color: "#34d399" },
                  { label: "活動達成度", weight: "20%", icon: "✅", color: "#f472b6" },
                  { label: "感情スコア", weight: "10%", icon: "💕", color: "#f9a8d4" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-sm" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)" }}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: item.color }}>
                      {item.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <LocationPanel onDistanceUpdate={setSpaceDeviation} currentDistance={gameState.spaceDeviation} />

            {/* Roadmap */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="text-sm font-bold mb-3" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}>
                今後の実装予定
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { week: "Week2", label: "GPS位置情報連携", icon: "🗺️", color: "#34d399" },
                  { week: "Week2", label: "プッシュ通知", icon: "🔔", color: "#c084f5" },
                  { week: "Week3", label: "招待コード2人対戦", icon: "⚔️", color: "#f472b6" },
                  { week: "Week4", label: "課金UI・AIコーチ", icon: "🤖", color: "#f59e0b" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-sm flex-1" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
                      {item.label}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ fontFamily: "'Noto Sans JP', sans-serif", color: item.color, background: `${item.color}15`, fontSize: "0.6rem" }}
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
          background: "rgba(255,255,255,0.92)",
          borderTop: "1px solid rgba(244,114,182,0.15)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 -4px 20px rgba(244,114,182,0.08)",
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
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all duration-200"
              style={{ background: isActive ? `${scoreScheme.main}15` : "transparent" }}
            >
              <span className="text-lg">{icons[tab]}</span>
              <span
                className="text-xs"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  color: isActive ? scoreScheme.main : "rgba(0,0,0,0.3)",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: "0.58rem",
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
