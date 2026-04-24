/**
 * SetupScreen.tsx
 * Design: Pastel Kawaii Life Manager
 *
 * 初期設定画面（4ステップ）
 * STEP 1: タスクモード選択（イージー/ハーフ/ハード）
 * STEP 2: 名前・起床時間・就寝時間
 * STEP 3: 自宅最寄駅・勤務先最寄駅・出社時間・昼休憩・退社時間
 * STEP 4: 休日設定 → 保存でメイン画面へ即ジャンプ
 */

import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile, TaskMode, UserType } from "@/hooks/useScoreEngine";
import { USER_TYPE_LABELS } from "@/hooks/useScoreEngine";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

const TASK_MODE_OPTIONS: {
  value: TaskMode;
  label: string;
  emoji: string;
  desc: string;
  detail: string;
  max: number;
  color: string;
}[] = [
  {
    value: "easy",
    label: "イージー",
    emoji: "🚶",
    desc: "移動ログのみ",
    detail: "起床・通勤移動だけを記録。タスクなし。",
    max: 30,
    color: "#60a5fa",
  },
  {
    value: "half",
    label: "ハーフ",
    emoji: "🚆",
    desc: "通勤中・帰宅中タスク",
    detail: "電車の中だけタスクを実行。無理なく続けられる。",
    max: 50,
    color: "#c084f5",
  },
  {
    value: "hard",
    label: "ハード",
    emoji: "🌟",
    desc: "全タスク完全版",
    detail: "出勤前・通勤・昼休み・帰宅・就寝前の全5タスク。",
    max: 100,
    color: "#f472b6",
  },
];

const LUNCH_DURATION_OPTIONS = [30, 45, 60, 90, 120];

interface Props {
  onComplete: (profile: Partial<UserProfile>, taskMode: TaskMode) => void;
}

export default function SetupScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  const [taskMode, setTaskMode] = useState<TaskMode>("hard");
  const [userType, setUserType] = useState<UserType>("worker");
  const [name, setName] = useState("");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [bedTime, setBedTime] = useState("22:30");
  const [homeStation, setHomeStation] = useState("");
  const [workStation, setWorkStation] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [lunchTime, setLunchTime] = useState("12:00");
  const [lunchDuration, setLunchDuration] = useState(60);
  const [endTime, setEndTime] = useState("18:00");
  const [offDays, setOffDays] = useState<number[]>([0, 6]);

  const toggleOffDay = (day: number) => {
    setOffDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const canNext = () => {
    if (step === 1 && !name.trim()) return false;
    return true;
  };

  const handleNext = () => {
    if (!canNext()) {
      toast.error("お名前を入力してください", {
        style: { background: "#fff0f6", border: "1px solid #fca5a5", color: "#7f1d1d" },
      });
      return;
    }
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      // 完了 → 初日日付を保存（サンプル日判定用）
      const todayKey = new Date().toISOString().slice(0, 10);
      if (!localStorage.getItem("lgm_start_date")) {
        localStorage.setItem("lgm_start_date", todayKey);
      }
      onComplete(
        {
          name: name.trim(),
          userType,
          wakeTime,
          bedTime,
          homeStation,
          workStation,
          startTime,
          lunchTime,
          lunchDuration,
          endTime,
          offDays,
          workAddress: "",
          learningContent: "英語学習",
          mode: "normal",
        },
        taskMode
      );
      toast.success(`${name.trim()}さん、はじめましょう！🌸`, {
        style: { background: "#fdf6ff", border: "1px solid rgba(192,132,245,0.3)", color: "#6b21a8" },
      });
    }
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1.5px solid rgba(192,132,245,0.3)",
    background: "rgba(255,255,255,0.9)",
    fontSize: 14,
    color: "#374151",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Noto Sans JP', sans-serif",
    colorScheme: "light",
  };

  const timeInputStyle: React.CSSProperties = {
    ...inputStyle,
    width: "auto",
    fontFamily: "'Shippori Mincho', serif",
    fontWeight: 700,
    color: "#a855f7",
    fontSize: 16,
  };

  const lbl = USER_TYPE_LABELS[userType];
  const stepTitles = [
    { emoji: "🎮", title: "タスクモードを選んでください", sub: "後から変更できます" },
    { emoji: "🌸", title: "あなたのことを教えてください", sub: "名前・タイプ・起床・就寝時間" },
    { emoji: "🚉", title: `${lbl.commute}設定`, sub: `駅名と${lbl.startTimeLabel}・${lbl.endTimeLabel}` },
    { emoji: "🌿", title: "休日設定", sub: "休みの曜日を選んでください" },
  ];

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
      }}
    >
      {/* Hero gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          background: "linear-gradient(160deg, rgba(249,168,212,0.35) 0%, rgba(216,180,254,0.25) 50%, rgba(167,243,208,0.2) 100%)",
          pointerEvents: "none",
          maxWidth: 430,
          margin: "0 auto",
        }}
      />

      {/* Progress bar */}
      <div style={{ position: "relative", zIndex: 10, padding: "48px 20px 16px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 99,
                background: i <= step
                  ? "linear-gradient(90deg, #f9a8d4, #c084f5)"
                  : "rgba(0,0,0,0.08)",
                transition: "background 0.4s",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", marginBottom: 4 }}>
          STEP {step + 1} / {totalSteps}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.65)", margin: 0, lineHeight: 1.3 }}>
          {stepTitles[step].emoji} {stepTitles[step].title}
        </h2>
        <p style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 4 }}>
          {stepTitles[step].sub}
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 120px", position: "relative", zIndex: 10 }}>

        {/* ─── STEP 0: タスクモード ─── */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TASK_MODE_OPTIONS.map(opt => {
              const selected = taskMode === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTaskMode(opt.value)}
                  style={{
                    padding: "16px 16px",
                    borderRadius: 16,
                    border: selected ? `2px solid ${opt.color}` : "1.5px solid rgba(0,0,0,0.08)",
                    background: selected
                      ? `linear-gradient(135deg, ${opt.color}18, ${opt.color}0a)`
                      : "rgba(255,255,255,0.85)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    boxShadow: selected ? `0 4px 16px ${opt.color}30` : "0 2px 6px rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{opt.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: selected ? opt.color : "#374151", fontFamily: "'Shippori Mincho', serif" }}>
                        {opt.label}
                      </span>
                      <span style={{ fontSize: 11, color: selected ? opt.color : "#9ca3af", fontWeight: 600 }}>
                        満点 {opt.max}pt
                      </span>
                      {selected && (
                        <span style={{ marginLeft: "auto", fontSize: 10, background: opt.color, color: "#fff", borderRadius: 6, padding: "2px 8px" }}>
                          選択中
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{opt.desc}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{opt.detail}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ─── STEP 1: 名前・タイプ・起床・就寝 ─── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* ユーザータイプ選択 */}
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 8 }}>
                あなたは？
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {(["worker", "student"] as UserType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setUserType(type)}
                    style={{
                      flex: 1,
                      padding: "14px 10px",
                      borderRadius: 14,
                      border: userType === type
                        ? "2px solid #c084f5"
                        : "1.5px solid rgba(0,0,0,0.08)",
                      background: userType === type
                        ? "linear-gradient(135deg, rgba(244,114,182,0.12), rgba(192,132,245,0.12))"
                        : "rgba(255,255,255,0.85)",
                      cursor: "pointer",
                      textAlign: "center" as const,
                      transition: "all 0.2s",
                      boxShadow: userType === type ? "0 4px 12px rgba(192,132,245,0.25)" : "0 2px 6px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{type === "worker" ? "💼" : "🎓"}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: userType === type ? "#7c3aed" : "#374151", fontFamily: "'Shippori Mincho', serif" }}>
                      {type === "worker" ? "会社員" : "学生"}
                    </div>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
                      {type === "worker" ? "出勤・通勤・退勤" : "登校・通学・下校"}
                    </div>
                    {userType === type && (
                      <div style={{ marginTop: 4, fontSize: 10, background: "#c084f5", color: "#fff", borderRadius: 6, padding: "1px 8px", display: "inline-block" }}>選択中</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 6 }}>
                お名前（愛称でも可）
              </label>
              <input
                type="text"
                placeholder="例: みなみ、ゆい..."
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
                autoFocus
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 6 }}>
                起床時間 🌅
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={e => setWakeTime(e.target.value)}
                style={timeInputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 6 }}>
                就寝時間 🌙
              </label>
              <input
                type="time"
                value={bedTime}
                onChange={e => setBedTime(e.target.value)}
                style={timeInputStyle}
              />
            </div>
          </div>
        )}

        {/* ─── STEP 2: 通勤設定 ─── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 6 }}>
                自宅最寄駅 🏠
              </label>
              <input
                type="text"
                placeholder="例: 前橋駅"
                value={homeStation}
                onChange={e => setHomeStation(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 6 }}>
                {lbl.workStation} {userType === "student" ? "🏫" : "🏢"}
              </label>
              <input
                type="text"
                placeholder={`例: ${userType === "student" ? "学校最寄駅" : "高崎駅"}`}
                value={workStation}
                onChange={e => setWorkStation(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* 時間設定 */}
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: 14,
                padding: "14px 16px",
                border: "1.5px solid rgba(192,132,245,0.15)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{lbl.startTimeLabel} {userType === "student" ? "🎓" : "💼"}</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  style={{ ...timeInputStyle, width: "auto" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{lbl.lunchLabel}開始 ☕</label>
                <input
                  type="time"
                  value={lunchTime}
                  onChange={e => setLunchTime(e.target.value)}
                  style={{ ...timeInputStyle, width: "auto" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 8 }}>
                  昼休憩時間
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {LUNCH_DURATION_OPTIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setLunchDuration(d)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 99,
                        border: lunchDuration === d ? "2px solid #c084f5" : "1.5px solid rgba(0,0,0,0.1)",
                        background: lunchDuration === d ? "linear-gradient(135deg, #f9a8d4, #c084f5)" : "rgba(255,255,255,0.7)",
                        color: lunchDuration === d ? "#fff" : "#6b7280",
                        fontSize: 12,
                        fontWeight: lunchDuration === d ? 700 : 400,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {d}分
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{lbl.endTimeLabel} 👋</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  style={{ ...timeInputStyle, width: "auto" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: 休日設定 ─── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, lineHeight: 1.7 }}>
                休みの曜日を選んでください。<br />
                休日は「勉強・読書・散歩・ストレッチ・デトックス」などのリラックスタスクでポイントを稼げます。
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
                {DAY_LABELS.map((label, idx) => {
                  const isOff = offDays.includes(idx);
                  const isSun = idx === 0;
                  const isSat = idx === 6;
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleOffDay(idx)}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        border: isOff ? "2px solid #c084f5" : "1.5px solid rgba(0,0,0,0.1)",
                        background: isOff
                          ? "linear-gradient(135deg, #f9a8d4, #c084f5)"
                          : "rgba(255,255,255,0.85)",
                        fontSize: 14,
                        fontWeight: 700,
                        color: isOff ? "#fff" : isSun ? "#ef4444" : isSat ? "#3b82f6" : "#6b7280",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "'Shippori Mincho', serif",
                        boxShadow: isOff ? "0 4px 12px rgba(192,132,245,0.3)" : "none",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
                選択した曜日（ピンク）が休日モードになります
              </p>
            </div>

            {/* 休日モードのポイント説明 */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(249,168,212,0.08), rgba(192,132,245,0.08))",
                borderRadius: 14,
                padding: "14px 16px",
                border: "1.5px solid rgba(192,132,245,0.2)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", marginBottom: 10, fontFamily: "'Shippori Mincho', serif" }}>
                🌸 休日モードのポイント
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { emoji: "📖", label: "勉強", pt: 15 },
                  { emoji: "📚", label: "読書", pt: 12 },
                  { emoji: "🧘", label: "ストレッチ", pt: 12 },
                  { emoji: "🚶", label: "散歩", pt: 10 },
                  { emoji: "🌿", label: "デトックス", pt: 10 },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{item.emoji}</span>
                    <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#c084f5" }}>{item.pt}pt</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 10 }}>
                満点50pt。タスクを選んで自由にポイントを稼げます。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          padding: "12px 20px 28px",
          background: "rgba(253,246,255,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(192,132,245,0.15)",
          display: "flex",
          gap: 10,
          zIndex: 50,
        }}
      >
        {step > 0 && (
          <button
            onClick={handleBack}
            style={{
              flex: "0 0 80px",
              padding: "14px",
              borderRadius: 14,
              border: "1.5px solid rgba(192,132,245,0.3)",
              background: "rgba(255,255,255,0.9)",
              color: "#7c3aed",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            ← 戻る
          </button>
        )}
        <button
          onClick={handleNext}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #f9a8d4, #c084f5)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(192,132,245,0.35)",
            fontFamily: "'Noto Sans JP', sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          {step === totalSteps - 1 ? "はじめる 🌸" : "次へ →"}
        </button>
      </div>
    </div>
  );
}
