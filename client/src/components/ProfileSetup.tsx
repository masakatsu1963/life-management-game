/**
 * ProfileSetup.tsx
 * Design: Pastel Kawaii Life Manager
 * 初回起動時のプロフィール入力画面（ステップ式）
 * 名前・アラーム・最寄駅・学習内容・勤務先・休日・モード
 */

import { useState } from "react";
import { toast } from "sonner";

export interface UserProfile {
  nickname: string;
  wakeTime: string;
  alarmEnabled: boolean;
  homeStation: string;
  workStation: string;
  learningContent: string;
  offDays: number[]; // 0=日, 1=月, ..., 6=土
  mode: "solo" | "battle" | "relax";
  setupDone: boolean;
}

export const DEFAULT_PROFILE: UserProfile = {
  nickname: "",
  wakeTime: "06:30",
  alarmEnabled: true,
  homeStation: "",
  workStation: "",
  learningContent: "podcast",
  offDays: [0, 6],
  mode: "solo",
  setupDone: false,
};

const LEARNING_OPTIONS = [
  { id: "podcast", label: "ポッドキャスト", emoji: "🎙️" },
  { id: "notebooklm", label: "NotebookLM", emoji: "📓" },
  { id: "audiobook", label: "オーディオブック", emoji: "📚" },
  { id: "language", label: "語学学習", emoji: "🌍" },
  { id: "music", label: "音楽・リラックス", emoji: "🎵" },
  { id: "none", label: "なし", emoji: "💤" },
];

const MODE_OPTIONS = [
  { id: "solo", label: "ソロモード", emoji: "🌸", desc: "自分のペースで理想生活を追う" },
  { id: "battle", label: "バトルモード", emoji: "⚔️", desc: "友達と対戦してスコアを競う" },
  { id: "relax", label: "リラックスモード", emoji: "🌿", desc: "スコアを気にせず記録だけ" },
];

export const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
export const LEARNING_OPTIONS_MAP: Record<string, string> = {
  podcast: "ポッドキャスト",
  notebooklm: "NotebookLM",
  audiobook: "オーディオブック",
  language: "語学学習",
  music: "音楽・リラックス",
  none: "なし",
};

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function ProfileSetup({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({ ...DEFAULT_PROFILE });

  const totalSteps = 5;

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleOffDay = (day: number) => {
    setProfile((prev) => ({
      ...prev,
      offDays: prev.offDays.includes(day)
        ? prev.offDays.filter((d) => d !== day)
        : [...prev.offDays, day],
    }));
  };

  const canNext = () => {
    if (step === 0 && !profile.nickname.trim()) return false;
    return true;
  };

  const handleNext = () => {
    if (!canNext()) {
      toast.error("入力してください", { style: { background: "#fff0f6", border: "1px solid #fca5a5", color: "#7f1d1d" } });
      return;
    }
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      const done: UserProfile = { ...profile, setupDone: true };
      localStorage.setItem("lifemanager_profile", JSON.stringify(done));
      onComplete(done);
      toast.success(`${profile.nickname}さん、はじめましょう！✨`, {
        style: { background: "#fdf6ff", border: "1px solid rgba(192,132,245,0.3)", color: "#6b21a8" },
      });
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const inputStyle = {
    fontFamily: "'Noto Sans JP', sans-serif",
    background: "rgba(255,255,255,0.9)",
    border: "1.5px solid rgba(192,132,245,0.25)",
    borderRadius: "0.875rem",
    padding: "0.75rem 1rem",
    fontSize: "0.9rem",
    color: "rgba(0,0,0,0.7)",
    width: "100%",
    outline: "none",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#fdf6ff", maxWidth: "430px", margin: "0 auto" }}
    >
      {/* Hero gradient */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "220px",
          background: "linear-gradient(160deg, rgba(249,168,212,0.35) 0%, rgba(216,180,254,0.25) 50%, rgba(167,243,208,0.2) 100%)",
        }}
      />

      {/* Progress bar */}
      <div className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center gap-1.5 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-all duration-400"
              style={{
                background: i <= step ? "linear-gradient(90deg, #f9a8d4, #c084f5)" : "rgba(0,0,0,0.08)",
              }}
            />
          ))}
        </div>

        <div className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.35)" }}>
          STEP {step + 1} / {totalSteps}
        </div>
      </div>

      {/* Step content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-4">

        {/* STEP 0: 名前 */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.65)" }}>
                はじめまして🌸
              </h2>
              <p className="text-sm" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
                あなたのことを教えてください
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)" }}>
                お名前（愛称でも可）
              </label>
              <input
                type="text"
                placeholder="例：みなみ、ゆい、さくら..."
                value={profile.nickname}
                onChange={(e) => update("nickname", e.target.value)}
                style={inputStyle}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)" }}>
                起床時間
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={profile.wakeTime}
                  onChange={(e) => update("wakeTime", e.target.value)}
                  style={{ ...inputStyle, width: "auto", colorScheme: "light", fontFamily: "'Shippori Mincho', serif", fontWeight: 700, color: "#a855f7" }}
                />
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)" }}>
                    アラーム
                  </span>
                  <button
                    onClick={() => update("alarmEnabled", !profile.alarmEnabled)}
                    className="relative w-12 h-6 rounded-full transition-all duration-200"
                    style={{ background: profile.alarmEnabled ? "linear-gradient(90deg, #f9a8d4, #c084f5)" : "rgba(0,0,0,0.12)" }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                      style={{
                        left: profile.alarmEnabled ? "calc(100% - 1.375rem)" : "0.125rem",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      }}
                    />
                  </button>
                  <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: profile.alarmEnabled ? "#a855f7" : "rgba(0,0,0,0.3)" }}>
                    {profile.alarmEnabled ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: 自宅最寄駅 */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.65)" }}>
                おうちの近く🏠
              </h2>
              <p className="text-sm" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
                自宅最寄駅を登録すると最終電車をお知らせします
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)" }}>
                自宅最寄駅
              </label>
              <input
                type="text"
                placeholder="例：新宿、渋谷、横浜..."
                value={profile.homeStation}
                onChange={(e) => update("homeStation", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "rgba(167,243,208,0.15)", border: "1.5px solid rgba(52,211,153,0.2)" }}
            >
              <span className="text-xl mt-0.5">📍</span>
              <div>
                <div className="text-sm font-medium mb-1" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#059669" }}>
                  位置情報との連携
                </div>
                <div className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.45)" }}>
                  GPS位置情報を使って、自宅エリアにいるかどうかを自動判定します。位置情報の許可はメイン画面で設定できます。
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "rgba(249,168,212,0.1)", border: "1.5px solid rgba(244,114,182,0.2)" }}
            >
              <span className="text-xl mt-0.5">🚃</span>
              <div>
                <div className="text-sm font-medium mb-1" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#db2777" }}>
                  最終電車お知らせ（Coming Soon）
                </div>
                <div className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.45)" }}>
                  最終電車の30分前にプッシュ通知でお知らせします。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: 通勤学習・勤務先 */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.65)" }}>
                お仕事・学習🎓
              </h2>
              <p className="text-sm" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
                通勤中の学習と勤務先を設定します
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)" }}>
                勤務先最寄駅
              </label>
              <input
                type="text"
                placeholder="例：大手町、品川、梅田..."
                value={profile.workStation}
                onChange={(e) => update("workStation", e.target.value)}
                style={inputStyle}
              />
              <div
                className="rounded-xl px-3 py-2 flex items-center gap-2"
                style={{ background: "rgba(167,243,208,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}
              >
                <span className="text-sm">🚨</span>
                <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
                  遅延情報取得・到着通知（Coming Soon）
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)" }}>
                通勤中の学習コンテンツ
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LEARNING_OPTIONS.map((opt) => {
                  const isActive = profile.learningContent === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => update("learningContent", opt.id)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-left transition-all duration-200"
                      style={{
                        background: isActive ? "rgba(192,132,245,0.12)" : "rgba(255,255,255,0.8)",
                        border: `1.5px solid ${isActive ? "rgba(192,132,245,0.4)" : "rgba(0,0,0,0.07)"}`,
                        boxShadow: isActive ? "0 2px 8px rgba(192,132,245,0.15)" : "none",
                        transform: isActive ? "scale(1.02)" : "scale(1)",
                      }}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      <span
                        className="text-xs font-medium"
                        style={{
                          fontFamily: "'Noto Sans JP', sans-serif",
                          color: isActive ? "#a855f7" : "rgba(0,0,0,0.55)",
                          fontWeight: isActive ? 700 : 400,
                        }}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {profile.learningContent === "notebooklm" && (
                <div
                  className="rounded-xl px-3 py-2.5 flex items-start gap-2"
                  style={{ background: "rgba(249,168,212,0.1)", border: "1px solid rgba(244,114,182,0.2)" }}
                >
                  <span className="text-sm mt-0.5">📓</span>
                  <div className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)" }}>
                    <span className="font-medium" style={{ color: "#db2777" }}>NotebookLM連携</span>は今後実装予定です。現在は学習リマインダーとして機能します。
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: 休日設定 */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.65)" }}>
                お休みの日📅
              </h2>
              <p className="text-sm" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
                休日はスコア計算が「リラックスモード」になります
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)" }}>
                定休日を選択（複数可）
              </label>
              <div className="flex gap-2">
                {DAY_LABELS.map((label, i) => {
                  const isSelected = profile.offDays.includes(i);
                  const isWeekend = i === 0 || i === 6;
                  return (
                    <button
                      key={i}
                      onClick={() => toggleOffDay(i)}
                      className="flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all duration-200"
                      style={{
                        background: isSelected ? "rgba(192,132,245,0.15)" : "rgba(255,255,255,0.8)",
                        border: `1.5px solid ${isSelected ? "rgba(192,132,245,0.4)" : "rgba(0,0,0,0.07)"}`,
                        transform: isSelected ? "scale(1.06)" : "scale(1)",
                        boxShadow: isSelected ? "0 3px 10px rgba(192,132,245,0.2)" : "none",
                      }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{
                          fontFamily: "'Shippori Mincho', serif",
                          color: isSelected ? "#a855f7" : isWeekend ? "#f472b6" : "rgba(0,0,0,0.5)",
                        }}
                      >
                        {label}
                      </span>
                      {isSelected && <span className="text-xs">🌸</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(0,0,0,0.06)" }}
            >
              <div className="text-xs font-medium mb-2" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
                休日スコアの仕組み
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { icon: "🌸", label: "時間精度", desc: "±30分まで許容（通常の2倍）" },
                  { icon: "🌿", label: "空間精度", desc: "自動的に解除" },
                  { icon: "✅", label: "活動達成", desc: "休日スケジュールに切り替え" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)", minWidth: "4rem" }}>
                      {item.label}
                    </span>
                    <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.35)" }}>
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: モード選択 */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.65)" }}>
                どのモードで始める？🎮
              </h2>
              <p className="text-sm" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
                あとからいつでも変更できます
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {MODE_OPTIONS.map((mode) => {
                const isActive = profile.mode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => update("mode", mode.id as UserProfile["mode"])}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all duration-200"
                    style={{
                      background: isActive ? "rgba(192,132,245,0.10)" : "rgba(255,255,255,0.8)",
                      border: `2px solid ${isActive ? "rgba(192,132,245,0.45)" : "rgba(0,0,0,0.07)"}`,
                      boxShadow: isActive ? "0 4px 16px rgba(192,132,245,0.18)" : "none",
                      transform: isActive ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    <span className="text-3xl">{mode.emoji}</span>
                    <div className="flex-1">
                      <div
                        className="text-base font-bold mb-0.5"
                        style={{ fontFamily: "'Shippori Mincho', serif", color: isActive ? "#a855f7" : "rgba(0,0,0,0.65)" }}
                      >
                        {mode.label}
                      </div>
                      <div className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
                        {mode.desc}
                      </div>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: isActive ? "#a855f7" : "rgba(0,0,0,0.15)",
                        background: isActive ? "#a855f7" : "transparent",
                      }}
                    >
                      {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(249,168,212,0.08)", border: "1.5px solid rgba(244,114,182,0.2)" }}
            >
              <div className="text-xs font-medium mb-2" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#db2777" }}>
                設定内容の確認 ✨
              </div>
              <div className="flex flex-col gap-1">
                {[
                  { label: "お名前", value: profile.nickname || "未入力" },
                  { label: "起床時間", value: `${profile.wakeTime}（アラーム: ${profile.alarmEnabled ? "ON" : "OFF"}）` },
                  { label: "自宅最寄駅", value: profile.homeStation || "未設定" },
                  { label: "勤務先最寄駅", value: profile.workStation || "未設定" },
                  { label: "通勤学習", value: LEARNING_OPTIONS.find((o) => o.id === profile.learningContent)?.label || "" },
                  { label: "休日", value: profile.offDays.map((d) => DAY_LABELS[d]).join("・") || "なし" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)", minWidth: "5.5rem" }}>
                      {item.label}
                    </span>
                    <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.6)" }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div
        className="relative z-10 px-5 py-4 flex gap-3"
        style={{ borderTop: "1px solid rgba(192,132,245,0.12)", background: "rgba(253,246,255,0.95)" }}
      >
        {step > 0 && (
          <button
            onClick={handleBack}
            className="flex-1 py-3.5 rounded-2xl text-sm font-medium transition-all hover:bg-gray-50"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)", border: "1.5px solid rgba(0,0,0,0.08)" }}
          >
            もどる
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            background: canNext() ? "linear-gradient(135deg, #f9a8d4, #c084f5)" : "rgba(0,0,0,0.08)",
            color: canNext() ? "#fff" : "rgba(0,0,0,0.25)",
            boxShadow: canNext() ? "0 4px 14px rgba(192,132,245,0.35)" : "none",
          }}
        >
          {step < totalSteps - 1 ? "つぎへ →" : "はじめる 🌸"}
        </button>
      </div>
    </div>
  );
}
