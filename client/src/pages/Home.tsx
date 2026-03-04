/**
 * Home.tsx - Main game screen
 * Design: Pastel Kawaii Life Manager
 *
 * タブ構成:
 *   フッター: 今日 / 今週 / 理想設定 / 使い方
 *   今日タブ: メーター + タイムライン型スケジュール
 *   今週タブ: 比較ドーナツ + 週間帯グラフ + チートパネル
 *   理想設定タブ: プロフィール・通勤設定・モード
 *   使い方タブ: ヘルプ
 */

import { useState, useEffect, useRef } from "react";
import GaugeMeter from "@/components/GaugeMeter";
import WeeklyDonut from "@/components/WeeklyDonut";
import DailyProgressBar from "@/components/DailyProgressBar";
import CheatPanel from "@/components/CheatPanel";
import TodayTimeline from "@/components/TodayTimeline";
import LocationLog from "@/components/LocationLog";
import IdealScheduleTab from "@/components/IdealScheduleTab";
import HelpPage from "@/components/HelpPage";
import { useScoreEngine } from "@/hooks/useScoreEngine";
import { toast } from "sonner";

type FootTab = "today" | "week" | "ideal" | "help";
type GraphTab = "today" | "week";
type TodaySubTab = "tasks" | "movement";

export default function Home() {
  const {
    profile,
    saveProfile,
    events,
    toggleEventPoint,
    updateEventContent,
    score,
    earnedPoints,
    totalPoints,
    bonusTotal,
    taskMode,
    setTaskMode,
    dayMode,
    setDayMode,
    currentTime,
    nextEvent,
    weeklyLogs,
    gameState,
    useCheat,
  } = useScoreEngine();

  const [activeTab, setActiveTab] = useState<FootTab>("today");
  const [graphTab, setGraphTab] = useState<GraphTab>("today");
  const [todaySubTab, setTodaySubTab] = useState<TodaySubTab>("tasks");
  const [showSetup, setShowSetup] = useState(() => !profile.name);
  const prevScoreRef = useRef(score);
  const [scoreFlash, setScoreFlash] = useState(false);

  useEffect(() => {
    const diff = Math.abs(score - prevScoreRef.current);
    if (diff >= 2) {
      setScoreFlash(true);
      setTimeout(() => setScoreFlash(false), 600);
      prevScoreRef.current = score;
    }
  }, [score]);

  // 初回セットアップ完了後に理想設定タブへ
  useEffect(() => {
    if (!showSetup && !profile.name) setShowSetup(true);
  }, [profile.name]);

  const scoreScheme = score >= 70
    ? { main: "#34d399", light: "#d1fae5", badge: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.3)", label: "絶好調！🌿" }
    : score >= 40
    ? { main: "#c084f5", light: "#f3e8ff", badge: "rgba(192,132,245,0.15)", border: "rgba(192,132,245,0.3)", label: "順調🌷" }
    : { main: "#f472b6", light: "#fce7f3", badge: "rgba(244,114,182,0.15)", border: "rgba(244,114,182,0.3)", label: "がんばろう🌸" };

  const FOOT_TABS: { id: FootTab; icon: string; label: string }[] = [
    { id: "today", icon: "📊", label: "今日" },
    { id: "week",  icon: "📈", label: "今週" },
    { id: "ideal", icon: "🌸", label: "理想設定" },
    { id: "help",  icon: "📖", label: "使い方" },
  ];

  const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663145989169/V3mzZwvpdi82dLMoVHx8Pr/hero-bg-JeDdhMmnmpUPNBZ3PigiRd.webp";

  // 初回セットアップ（名前未設定）
  if (showSetup) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fdf6ff",
          maxWidth: "430px",
          margin: "0 auto",
          fontFamily: "'Noto Sans JP', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Shippori Mincho', serif", color: "#374151", marginBottom: 6, textAlign: "center" }}>
          ようこそ！
        </h1>
        <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", marginBottom: 28, lineHeight: 1.7 }}>
          まずはあなたのプロフィールを<br />設定しましょう
        </p>
        <div style={{ width: "100%", background: "rgba(255,255,255,0.9)", borderRadius: 20, padding: 20, border: "1.5px solid rgba(192,132,245,0.2)", boxShadow: "0 4px 20px rgba(192,132,245,0.1)" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 6 }}>お名前（愛称でも可）</label>
            <input
              type="text"
              placeholder="例: みなみ"
              defaultValue={profile.name}
              id="setup-name"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid rgba(192,132,245,0.3)",
                background: "rgba(255,255,255,0.9)",
                fontSize: 14,
                color: "#374151",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 6 }}>起床時間</label>
            <input
              type="time"
              defaultValue={profile.wakeTime || "06:30"}
              id="setup-wake"
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid rgba(192,132,245,0.3)",
                background: "rgba(255,255,255,0.9)",
                fontSize: 14,
                color: "#374151",
                outline: "none",
              }}
            />
          </div>
          <button
            onClick={() => {
              const nameEl = document.getElementById("setup-name") as HTMLInputElement;
              const wakeEl = document.getElementById("setup-wake") as HTMLInputElement;
              const name = nameEl?.value.trim();
              if (!name) { toast.error("お名前を入力してください"); return; }
              saveProfile({ name, wakeTime: wakeEl?.value || "06:30" });
              setShowSetup(false);
              setActiveTab("ideal");
              toast.success(`${name}さん、はじめましょう！🌸`, {
                style: { background: "#fdf6ff", border: "1px solid rgba(192,132,245,0.3)", color: "#6b21a8" },
              });
            }}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #f9a8d4, #c084f5)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(192,132,245,0.3)",
            }}
          >
            はじめる 🌸
          </button>
        </div>
      </div>
    );
  }

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
          opacity: 0.25,
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
              {profile.name || "あなた"}さんのLife
            </div>
            <div className="text-xs" style={{ color: "rgba(0,0,0,0.3)", fontSize: "0.6rem" }}>
              {dayMode === "normal" ? "通常モード💼" : dayMode === "holiday" ? "休日モード🌸" : dayMode === "business_trip" ? "出張モード✈️" : "病欠モード🤒"}
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
          <div
            className="text-xs px-2 py-1 rounded-full font-bold"
            style={{ color: scoreScheme.main, background: scoreScheme.badge, border: `1px solid ${scoreScheme.border}` }}
          >
            {earnedPoints}/{totalPoints}pt
          </div>
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
            <span className="text-xs" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "'Noto Sans JP', sans-serif" }}>
              最大{totalPoints}pt
            </span>
          </div>

          <div className="px-2 pt-1 pb-2">
            <GaugeMeter score={score} size={340} animated />
          </div>

          {/* ポイント内訳バー */}
          <div
            className="flex items-center justify-around px-4 py-3"
            style={{ borderTop: `1px solid ${scoreScheme.border}30` }}
          >
            {[
              {
                icon: "⏰",
                value: `${events.filter(e => e.timeAchieved).length}/${events.filter(e => e.timePoint > 0).length}`,
                label: "時間",
                color: "#f59e0b",
              },
              {
                icon: "📍",
                value: `${events.filter(e => e.locationAchieved).length}/${events.filter(e => e.locationPoint > 0).length}`,
                label: "位置",
                color: "#60a5fa",
              },
              {
                icon: "📚",
                value: `${events.filter(e => e.taskAchieved).length}/${events.filter(e => e.taskPoint > 0).length}`,
                label: "タスク",
                color: "#a78bfa",
              },
              {
                icon: "💎",
                value: `${gameState.cheatPoints}CP`,
                label: "チート",
                color: "#a855f7",
              },
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



        {/* =============================================
            今日タブ: タスク / 移動ログ サブタブ
        ============================================= */}
        {activeTab === "today" && (
          <div className="flex flex-col gap-3">
            {/* サブタブ切り替え */}
            <div
              className="flex rounded-2xl overflow-hidden p-1"
              style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              {(["tasks", "movement"] as const).map((t) => {
                const active = todaySubTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTodaySubTab(t)}
                    className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      fontFamily: "'Noto Sans JP', sans-serif",
                      background: active ? "linear-gradient(135deg, #f9a8d4, #c084fc)" : "transparent",
                      color: active ? "white" : "rgba(0,0,0,0.4)",
                      boxShadow: active ? "0 2px 8px rgba(192,132,252,0.3)" : "none",
                    }}
                  >
                    {t === "tasks" ? "🌸 タスク" : "📍 移動ログ"}
                  </button>
                );
              })}
            </div>

            {/* タスクタイムライン */}
            {todaySubTab === "tasks" && (
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}>
                    🌸 今日のタスク
                  </span>
                  <span className="text-xs" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "'Noto Sans JP', sans-serif" }}>
                    タップで達成記録
                  </span>
                </div>
                <TodayTimeline
                  events={events}
                  currentTime={currentTime}
                  onToggle={toggleEventPoint}
                  onContentChange={updateEventContent}
                  earnedPoints={earnedPoints}
                  totalPoints={totalPoints}
                  bonusTotal={bonusTotal}
                  taskMode={taskMode}
                />
              </div>
            )}

            {/* 移動ログ */}
            {todaySubTab === "movement" && (
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}>
                    📍 移動ログ
                  </span>
                  <span className="text-xs" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "'Noto Sans JP', sans-serif" }}>
                    位置情報自動取得
                  </span>
                </div>
                <LocationLog
                  events={events}
                  currentTime={currentTime}
                  onToggle={toggleEventPoint}
                />
              </div>
            )}
          </div>
        )}

        {/* =============================================
            今週タブ: 比較ドーナツ + 帯グラフ
        ============================================= */}
        {activeTab === "week" && (
          <div className="flex flex-col gap-3">
            {/* グラフカード */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              {/* 今日/今週 切り替えタブ */}
              <div
                className="flex rounded-xl overflow-hidden mb-3 p-0.5"
                style={{ background: "rgba(0,0,0,0.04)", width: "fit-content" }}
              >
                {(["today", "week"] as const).map((t) => {
                  const isG = graphTab === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setGraphTab(t)}
                      className="px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200"
                      style={{
                        fontFamily: "'Noto Sans JP', sans-serif",
                        color: isG ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.3)",
                        background: isG ? "rgba(255,255,255,0.95)" : "transparent",
                        fontWeight: isG ? 700 : 400,
                        boxShadow: isG ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      {t === "today" ? "📊 今日のポイント" : "📈 今週のポイント"}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-start gap-3">
                {/* 左：比較ドーナツ */}
                <div className="shrink-0">
                  <WeeklyDonut schedule={gameState.schedule} size={130} />
                </div>
                {/* 右：帯グラフ */}
                <div className="flex-1 min-w-0">
                  <DailyProgressBar schedule={gameState.schedule} />
                </div>
              </div>
            </div>

            {/* 週間ログサマリー */}
            {weeklyLogs.length > 0 && (
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              >
                <div className="text-sm font-bold mb-3" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}>
                  📅 今週のスコア推移
                </div>
                <div className="flex gap-1 items-end" style={{ height: 60 }}>
                  {weeklyLogs.slice(-7).map((log, i) => {
                    const h = Math.max(4, (log.score / 100) * 52);
                    const day = new Date(log.date).getDay();
                    const dayLabels = ["日","月","火","水","木","金","土"];
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          style={{
                            width: "100%",
                            height: h,
                            borderRadius: "4px 4px 0 0",
                            background: log.score >= 70 ? "#34d399" : log.score >= 40 ? "#c084f5" : "#f9a8d4",
                            transition: "height 0.5s ease",
                          }}
                        />
                        <span style={{ fontSize: "0.55rem", color: "rgba(0,0,0,0.3)" }}>{dayLabels[day]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
            onSave={saveProfile}
            dayMode={dayMode}
            onDayModeChange={setDayMode}
            taskMode={taskMode}
            onTaskModeChange={setTaskMode}
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
