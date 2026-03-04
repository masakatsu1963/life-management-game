/**
 * Home.tsx - Main game screen
 * Design: Pastel Kawaii Life Manager
 * タブ構成:
 *   フッター: 今日 / 今週 / 理想設定 / 使い方
 *   「今日のポイント」= 今日の比較ドーナツ（左:理想/右:今日実績）+ 今日のタスクリスト
 *   「今週のポイント」= 週間比較ドーナツ（左:理想/右:7日累積）+ 7日間積算帯グラフ
 */

import { useState, useEffect, useRef } from "react";
import GaugeMeter from "@/components/GaugeMeter";
import TimeDonut from "@/components/TimeDonut";
import WeeklyDonut from "@/components/WeeklyDonut";
import DailyProgressBar from "@/components/DailyProgressBar";
import ScheduleList from "@/components/ScheduleList";
import CheatPanel from "@/components/CheatPanel";
import EmotionSelector from "@/components/EmotionSelector";
import LocationPanel from "@/components/LocationPanel";
import { useScoreEngine } from "@/hooks/useScoreEngine";
import ProfileSetup, { type UserProfile } from "@/components/ProfileSetup";
import IdealScheduleTab from "@/components/IdealScheduleTab";
import HelpPage from "@/components/HelpPage";
import { toast } from "sonner";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663145989169/V3mzZwvpdi82dLMoVHx8Pr/hero-bg-JeDdhMmnmpUPNBZ3PigiRd.webp";

function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem("lifemanager_profile");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    return parsed.setupDone ? parsed : null;
  } catch {
    return null;
  }
}

type FootTab = "today" | "week" | "ideal" | "help";

export default function Home() {
  const {
    gameState,
    toggleActivity,
    changeEmotion,
    useCheat,
    forceUpdateScore,
    saveSchedule,
    setSpaceDeviation,
  } = useScoreEngine();

  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<FootTab>("today");
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

  if (!profile) {
    return <ProfileSetup onComplete={(p) => setProfile(p)} />;
  }

  const score = gameState.score.total;

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

  const FOOT_TABS: { id: FootTab; icon: string; label: string }[] = [
    { id: "today", icon: "📊", label: "今日" },
    { id: "week",  icon: "📈", label: "今週" },
    { id: "ideal", icon: "🌸", label: "理想設定" },
    { id: "help",  icon: "📖", label: "使い方" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#fdf6ff", maxWidth: "430px", margin: "0 auto", fontFamily: "'Noto Sans JP', sans-serif" }}
    >
      {/* Hero background */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "320px",
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
          opacity: 0.3,
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
      <header className="relative z-10 flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-2xl flex items-center justify-center text-base"
            style={{ background: "rgba(255,255,255,0.85)", boxShadow: "0 2px 8px rgba(244,114,182,0.2)", border: "1.5px solid rgba(244,114,182,0.2)" }}
          >
            🌸
          </div>
          <div>
            <div className="text-sm font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.65)", lineHeight: 1.2 }}>
              {profile.nickname}さんのLife
            </div>
            <div className="text-xs" style={{ color: "rgba(0,0,0,0.3)", fontSize: "0.6rem" }}>
              {profile.mode === "solo" ? "ソロモード🌸" : profile.mode === "battle" ? "バトルモード⚔️" : "リラックス🌿"}
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

          <div className="px-2 pt-1 pb-2">
            <GaugeMeter score={score} size={340} animated />
          </div>

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

        {/* =============================================
            今日のポイント タブ
        ============================================= */}
        {activeTab === "today" && (
          <div className="flex flex-col gap-3">
            {/* グラフカード */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="text-xs font-bold mb-3" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.5)" }}>
                📊 今日のポイント
              </div>
              <div className="flex items-start gap-3">
                {/* 左：今日の比較ドーナツ */}
                <div className="shrink-0">
                  <TimeDonut schedule={gameState.schedule} currentTime={currentTime} size={130} />
                </div>
                {/* 右：今日のカテゴリ達成状況 */}
                <div className="flex-1 min-w-0">
                  <TodayCategoryBars schedule={gameState.schedule} />
                </div>
              </div>
            </div>

            {/* 今日のスケジュール */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}>
                  🌸 今日のスケジュール
                </span>
              </div>
              <ScheduleList schedule={gameState.schedule} currentTime={currentTime} onToggle={toggleActivity} />
            </div>

            {/* 感情セレクター */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <EmotionSelector value={gameState.emotionLevel} onChange={changeEmotion} />
            </div>

            {/* 位置情報 */}
            <LocationPanel onDistanceUpdate={setSpaceDeviation} currentDistance={gameState.spaceDeviation} />
          </div>
        )}

        {/* =============================================
            今週のポイント タブ
        ============================================= */}
        {activeTab === "week" && (
          <div className="flex flex-col gap-3">
            {/* 週間グラフカード */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="text-xs font-bold mb-3" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.5)" }}>
                📈 今週のポイント（7日間累積）
              </div>
              <div className="flex items-start gap-3">
                {/* 左：週間比較ドーナツ */}
                <div className="shrink-0">
                  <WeeklyDonut schedule={gameState.schedule} size={130} />
                </div>
                {/* 右：7日間積算帯グラフ */}
                <div className="flex-1 min-w-0">
                  <DailyProgressBar schedule={gameState.schedule} />
                </div>
              </div>
            </div>

            {/* チートパネル */}
            <CheatPanel cheatPoints={gameState.cheatPoints} streak={gameState.streak} onUseCheat={useCheat} />

            {/* 2人対戦Coming Soon */}
            <button
              className="rounded-2xl p-4 flex items-center gap-3 w-full text-left transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.6)", border: "1.5px dashed rgba(192,132,245,0.25)", opacity: 0.7 }}
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
              <span className="text-xs px-2 py-1 rounded-full" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(192,132,245,0.6)", background: "rgba(192,132,245,0.08)" }}>
                SOON
              </span>
            </button>
          </div>
        )}

        {/* === IDEAL SCHEDULE TAB === */}
        {activeTab === "ideal" && (
          <IdealScheduleTab
            profile={profile}
            schedule={gameState.schedule}
            onSaveSchedule={saveSchedule}
            onUpdateProfile={(updated) => setProfile(updated)}
          />
        )}

        {/* === HELP TAB === */}
        {activeTab === "help" && <HelpPage />}
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
        {FOOT_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all duration-200"
              style={{ background: isActive ? `${scoreScheme.main}15` : "transparent" }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span
                className="text-xs"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  color: isActive ? scoreScheme.main : "rgba(0,0,0,0.3)",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: "0.58rem",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ─── 今日のカテゴリ達成状況（帯グラフ・今日のみ） ───────────────────────
import type { ScheduleItem, ScheduleCategory } from "@/hooks/useScoreEngine";

const CATS: ScheduleCategory[] = ["wakeup","pre_work","commute_learn","break","return_learn","pre_sleep"];
const CAT_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  wakeup:        { label: "起床",   icon: "🌅", color: "#fbbf24", bg: "rgba(251,191,36,0.10)" },
  pre_work:      { label: "出勤前", icon: "🌸", color: "#f472b6", bg: "rgba(244,114,182,0.10)" },
  commute_learn: { label: "通勤学習", icon: "📚", color: "#60a5fa", bg: "rgba(96,165,250,0.10)" },
  break:         { label: "休憩活用", icon: "☕", color: "#34d399", bg: "rgba(52,211,153,0.10)" },
  return_learn:  { label: "帰宅学習", icon: "🎧", color: "#a78bfa", bg: "rgba(167,139,250,0.10)" },
  pre_sleep:     { label: "就寝前",  icon: "🌙", color: "#c084f5", bg: "rgba(192,132,245,0.10)" },
};

function TodayCategoryBars({ schedule }: { schedule: ScheduleItem[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="text-xs font-semibold mb-0.5"
        style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.38)", fontSize: "0.62rem" }}
      >
        今日の達成状況
      </div>
      {CATS.map(cat => {
        const meta = CAT_META[cat];
        const items = schedule.filter(s => s.category === cat);
        const completed = items.filter(s => s.completed).length;
        const total = items.length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <div
            key={cat}
            className="rounded-xl px-2 py-1.5"
            style={{ background: meta.bg }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <span style={{ fontSize: "0.72rem" }}>{meta.icon}</span>
                <span
                  className="font-medium"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)", fontSize: "0.63rem" }}
                >
                  {meta.label}
                </span>
              </div>
              <span
                className="font-bold tabular-nums"
                style={{ fontFamily: "'Shippori Mincho', serif", color: meta.color, fontSize: "0.72rem" }}
              >
                {total > 0 ? `${completed}/${total}` : "—"}
              </span>
            </div>
            {/* 帯グラフ */}
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: "5px", background: "rgba(0,0,0,0.07)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
                  minWidth: pct > 0 ? "5px" : "0",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
