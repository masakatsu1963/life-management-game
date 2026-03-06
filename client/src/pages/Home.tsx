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
import WeeklyProgress from "@/components/WeeklyProgress";
import TodayTimeline from "@/components/TodayTimeline";
import LocationLog from "@/components/LocationLog";
import IdealScheduleTab from "@/components/IdealScheduleTab";
import HelpPage from "@/components/HelpPage";
import SetupScreen from "@/components/SetupScreen";
import SmallGauge from "@/components/SmallGauge";
import { useScoreEngine, calcEarlyRiseBonus, getEarlyRiseLabel } from "@/hooks/useScoreEngine";
import type { DayMode } from "@/hooks/useScoreEngine";
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
    timePoints,
    timePointsMax,
    studyPoints,
    studyPointsMax,
    relaxPoints,
    relaxPointsMax,
  } = useScoreEngine();

  const [activeTab, setActiveTab] = useState<FootTab>("today");
  const [graphTab, setGraphTab] = useState<GraphTab>("today");
  const [todaySubTab, setTodaySubTab] = useState<TodaySubTab>("tasks");
  const [showSetup, setShowSetup] = useState(() => !profile.name);
  const prevScoreRef = useRef(score);
  const [scoreFlash, setScoreFlash] = useState(false);

  // 早起きポイント状態
  const todayKey = new Date().toISOString().slice(0, 10);
  const [earlyRiseTapped, setEarlyRiseTapped] = useState<boolean>(() => {
    return localStorage.getItem(`lgm_early_rise_${todayKey}`) === "1";
  });
  const [earlyRiseBonus, setEarlyRiseBonus] = useState<number>(() => {
    return parseInt(localStorage.getItem(`lgm_early_rise_bonus_${todayKey}`) || "0");
  });
  const [earlyRiseAnim, setEarlyRiseAnim] = useState(false);

  // 早起きボタン表示条件: 起床時間から+3時間以内の朝
  const isEarlyRiseWindow = (() => {
    const [wh, wm] = (profile.wakeTime || "06:30").split(":").map(Number);
    const wakeMinutes = wh * 60 + wm;
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return nowMinutes >= wakeMinutes - 60 && nowMinutes <= wakeMinutes + 180;
  })();

  // 現在時刻と理想起床時間の差分（リアルタイム）
  const currentDiff = (() => {
    const [wh, wm] = (profile.wakeTime || "06:30").split(":").map(Number);
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return (wh * 60 + wm) - nowMinutes;
  })();
  const previewBonus = calcEarlyRiseBonus(profile.wakeTime || "06:30",
    `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}`);
  const previewLabel = getEarlyRiseLabel(currentDiff);

  const handleEarlyRiseTap = () => {
    if (earlyRiseTapped) return;
    const nowHHMM = `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}`;
    const bonus = calcEarlyRiseBonus(profile.wakeTime || "06:30", nowHHMM);
    const diff = currentDiff;
    const lbl = getEarlyRiseLabel(diff);
    setEarlyRiseTapped(true);
    setEarlyRiseBonus(bonus);
    setEarlyRiseAnim(true);
    localStorage.setItem(`lgm_early_rise_${todayKey}`, "1");
    localStorage.setItem(`lgm_early_rise_bonus_${todayKey}`, String(bonus));
    setTimeout(() => setEarlyRiseAnim(false), 1200);
    if (diff >= 0) {
      toast.success(`${lbl.emoji} ${lbl.label} +${bonus}ptボーナス！`, {
        style: { background: "#fffbeb", border: "1px solid #fbbf24", color: "#92400e" },
      });
    } else {
      toast(`${lbl.emoji} ${lbl.label} +${bonus}pt獲得`, {
        style: { background: "#f0f9ff", border: "1px solid #7dd3fc", color: "#0c4a6e" },
      });
    }
  };

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

  const scoreScheme = score > 100
    ? { main: "#f59e0b", light: "#fef3c7", badge: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", label: "超過達成！⭐" }
    : score >= 70
    ? { main: "#34d399", light: "#d1fae5", badge: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.3)", label: "絶好調！🌿" }
    : score >= 40
    ? { main: "#c084f5", light: "#f3e8ff", badge: "rgba(192,132,245,0.15)", border: "rgba(192,132,245,0.3)", label: "順調🌷" }
    : { main: "#f472b6", light: "#fce7f3", badge: "rgba(244,114,182,0.15)", border: "rgba(244,114,182,0.3)", label: "がんばろう🌸" };

  const FOOT_TABS: { id: FootTab; icon: string; label: string }[] = [
    { id: "today", icon: "📊", label: "今日" },
    { id: "week",  icon: "📈", label: "今週の経過" },
    { id: "ideal", icon: "🌸", label: "理想設定" },
    { id: "help",  icon: "📖", label: "使い方" },
  ];

  const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663145989169/V3mzZwvpdi82dLMoVHx8Pr/hero-bg-JeDdhMmnmpUPNBZ3PigiRd.webp";

  // 初回セットアップ（名前未設定）
  if (showSetup) {
    return (
      <SetupScreen
        onComplete={(profileData, mode) => {
          saveProfile(profileData);
          setTaskMode(mode);
          setShowSetup(false);
          // 保存後はメイン画面（今日タブ）へ即ジャンプ
          setActiveTab("today");
        }}
      />
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

        {/* === 早起きポイント 大型タップボタン === */}
        {activeTab === "today" && (isEarlyRiseWindow || earlyRiseTapped) && (
          <div
            className="mb-3"
            style={{
              background: earlyRiseTapped
                ? "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))"
                : "linear-gradient(135deg, rgba(255,236,153,0.6), rgba(251,191,36,0.3))",
              borderRadius: 24,
              border: earlyRiseTapped ? "1.5px solid rgba(245,158,11,0.3)" : "2px solid rgba(251,191,36,0.6)",
              boxShadow: earlyRiseTapped ? "none" : "0 4px 20px rgba(251,191,36,0.35)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* 未タップ時: 大型ボタン */}
            {!earlyRiseTapped ? (
              <button
                onClick={handleEarlyRiseTap}
                style={{
                  width: "100%",
                  padding: "20px 16px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  animation: earlyRiseAnim ? "earlyRisePop 0.4s ease-out" : "earlyRisePulse 2s ease-in-out infinite",
                }}
              >
                <div style={{ fontSize: 48, lineHeight: 1 }}>{previewLabel.emoji}</div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 900,
                  fontFamily: "'Shippori Mincho', serif",
                  color: "#92400e",
                  letterSpacing: "0.02em",
                }}>
                  おはよう！早起きポイント
                </div>
                {/* リアルタイムプレビュー */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 16px",
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: 12,
                  border: `1.5px solid ${previewLabel.color}60`,
                }}>
                  <span style={{ fontSize: 12, color: "#92400e", fontFamily: "'Noto Sans JP', sans-serif" }}>
                    {previewLabel.label}
                  </span>
                  <span style={{
                    fontSize: 18,
                    fontWeight: 900,
                    fontFamily: "'Shippori Mincho', serif",
                    color: previewLabel.color,
                  }}>
                    +{previewBonus}pt
                  </span>
                </div>
                {/* 段階表 */}
                <div style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: 2,
                }}>
                  {[
                    { label: "1h以上", pt: 30, min: 60 },
                    { label: "1h", pt: 25, min: 45 },
                    { label: "30分", pt: 20, min: 30 },
                    { label: "15分", pt: 15, min: 15 },
                    { label: "1分", pt: 10, min: 1 },
                    { label: "ちょうど", pt: 5, min: 0 },
                  ].map(tier => (
                    <div
                      key={tier.label}
                      style={{
                        padding: "2px 7px",
                        borderRadius: 99,
                        fontSize: 10,
                        fontFamily: "'Noto Sans JP', sans-serif",
                        background: currentDiff >= tier.min
                          ? "rgba(245,158,11,0.85)"
                          : "rgba(0,0,0,0.08)",
                        color: currentDiff >= tier.min ? "#fff" : "rgba(0,0,0,0.35)",
                        fontWeight: currentDiff >= tier.min ? 700 : 400,
                        transition: "all 0.3s",
                      }}
                    >
                      {tier.label} +{tier.pt}pt
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "#b45309", fontFamily: "'Noto Sans JP', sans-serif", marginTop: 2 }}>
                  理想起床 {profile.wakeTime} → 早いほどボーナス大！
                </div>
              </button>
            ) : (
              /* タップ済み時: 小さい確認表示 */
              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>☀️</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", fontFamily: "'Shippori Mincho', serif" }}>
                      早起きポイント獲得済み
                    </div>
                    <div style={{ fontSize: 11, color: "#b45309", fontFamily: "'Noto Sans JP', sans-serif" }}>
                      本日の起床ボーナス
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: 22,
                  fontWeight: 900,
                  fontFamily: "'Shippori Mincho', serif",
                  color: "#f59e0b",
                }}>
                  +{earlyRiseBonus}pt
                </div>
              </div>
            )}
          </div>
        )}

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
            {/* チートポイント（右上） */}
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "'Noto Sans JP', sans-serif" }}>
                最大{totalPoints}pt
              </span>
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}
              >
                <span style={{ fontSize: 12 }}>💎</span>
                <span className="text-xs font-bold" style={{ color: "#a855f7", fontFamily: "'Shippori Mincho', serif" }}>
                  {gameState.cheatPoints}CP
                </span>
              </div>
            </div>
          </div>

          <div className="px-2 pt-1 pb-0">
            <GaugeMeter score={score} size={340} animated earnedPoints={earnedPoints} totalPoints={totalPoints} />
          </div>

          {/* 3サブメーター（時間・勉強・リラックス） */}
          <div
            className="flex items-stretch px-3 pb-3 pt-0"
            style={{ borderTop: `1px solid ${scoreScheme.border}30`, gap: 4 }}
          >
            <SmallGauge
              label="時間pt"
              emoji="⏰"
              earned={timePoints}
              max={timePointsMax}
              color="#f59e0b"
              bgColor="rgba(245,158,11,0.12)"
            />
            <div style={{ width: 1, background: "rgba(0,0,0,0.07)", margin: "8px 0" }} />
            <SmallGauge
              label="勉強pt"
              emoji="📚"
              earned={studyPoints}
              max={studyPointsMax}
              color="#6366f1"
              bgColor="rgba(99,102,241,0.12)"
            />
            <div style={{ width: 1, background: "rgba(0,0,0,0.07)", margin: "8px 0" }} />
            <SmallGauge
              label="リラックスpt"
              emoji="🌿"
              earned={relaxPoints}
              max={relaxPointsMax}
              color="#34d399"
              bgColor="rgba(52,211,153,0.12)"
            />
          </div>
        </div>



        {/* =============================================
            今日のモード選択（1列）3種類
        ============================================= */}
        {activeTab === "today" && (
          <div
            className="flex rounded-2xl overflow-hidden mb-1"
            style={{ background: "rgba(255,255,255,0.72)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 3, gap: 3 }}
          >
            {([
              { value: "normal" as DayMode, emoji: "💼", label: "通常", color: "#c084f5" },
              { value: "holiday" as DayMode, emoji: "🌸", label: "休日", color: "#f472b6" },
              { value: "business_trip" as DayMode, emoji: "✈️", label: "出張・病欠", color: "#60a5fa" },
            ] as const).map(opt => {
              const isActive = dayMode === opt.value || (opt.value === "business_trip" && (dayMode === "business_trip" || dayMode === "sick"));
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value === "business_trip") {
                      // 出張・病欠はトグル
                      setDayMode(dayMode === "business_trip" ? "sick" : "business_trip");
                    } else {
                      setDayMode(opt.value);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "5px 4px",
                    borderRadius: 12,
                    border: "none",
                    background: isActive
                      ? `linear-gradient(135deg, ${opt.color}22, ${opt.color}11)`
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    outline: isActive ? `2px solid ${opt.color}60` : "none",
                  }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{opt.value === "business_trip" && dayMode === "sick" ? "🤒" : opt.emoji}</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? opt.color : "rgba(0,0,0,0.35)",
                    fontFamily: "'Noto Sans JP', sans-serif",
                    whiteSpace: "nowrap",
                  }}>
                    {opt.value === "business_trip" && dayMode === "sick" ? "病欠" : opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

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
                  taskMode={taskMode}
                  dayMode={dayMode}
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
            今週の経過タブ: WeeklyProgress
        ============================================= */}
        {activeTab === "week" && (
          <WeeklyProgress weeklyLogs={weeklyLogs} />
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
