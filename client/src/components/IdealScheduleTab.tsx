/**
 * IdealScheduleTab.tsx
 * Design: Pastel Kawaii Life Manager
 *
 * 理想設定タブ（ポイント表準拠 UserProfile型対応）
 * - 今日のモード（通常/休日/出張/病欠）
 * - 基本プロフィール（名前・起床・就寝・アラーム）
 * - 通勤設定（自宅最寄駅・勤務先最寄駅・勤務先住所）
 * - 通勤中の学習内容
 * - 休日設定
 * - ポイントの仕組み説明
 */

import { useState } from "react";
import type { UserProfile, DayMode, TaskMode } from "@/hooks/useScoreEngine";
import { toast } from "sonner";

interface Props {
  profile: UserProfile;
  onSave: (p: Partial<UserProfile>) => void;
  dayMode: DayMode;
  onDayModeChange: (m: DayMode) => void;
  taskMode: TaskMode;
  onTaskModeChange: (m: TaskMode) => void;
}

const TASK_MODE_OPTIONS: { value: TaskMode; label: string; emoji: string; desc: string; tasks: string }[] = [
  { value: "easy",  label: "イージー",  emoji: "🚶", desc: "移動ログのみ", tasks: "移動イベントのみ自動記録" },
  { value: "half",  label: "ハーフ",   emoji: "🚆", desc: "通勤中・帰宅中のみ", tasks: "通勤中タスク＋帰宅中タスク" },
  { value: "hard",  label: "ハード",   emoji: "🌟", desc: "全タスク完全版", tasks: "全5タスク（出勤前・通勤・昂休・帰宅・就对前）" },
];

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

const LEARNING_OPTIONS = [
  { id: "英語学習（Duolingo）",    label: "英語（Duolingo）",    emoji: "🇬🇧" },
  { id: "英語学習（NotebookLM）",  label: "英語（NotebookLM）",  emoji: "📓" },
  { id: "読書（Kindle）",          label: "読書（Kindle）",       emoji: "📖" },
  { id: "ビジネス書（NotebookLM）",label: "ビジネス書",           emoji: "💼" },
  { id: "資格勉強（NotebookLM）",  label: "資格勉強",             emoji: "📝" },
  { id: "語学（ポッドキャスト）",  label: "語学ポッドキャスト",   emoji: "🎙️" },
  { id: "瞑想・マインドフルネス",  label: "瞑想・マインドフル",   emoji: "🧘" },
  { id: "音楽鑑賞",                label: "音楽鑑賞",             emoji: "🎵" },
  { id: "ニュース・情報収集",      label: "ニュース収集",         emoji: "📰" },
  { id: "その他",                  label: "その他",               emoji: "✨" },
];

const DAY_MODE_OPTIONS: { value: DayMode; label: string; emoji: string; desc: string }[] = [
  { value: "normal",        label: "通常モード",   emoji: "💼", desc: "通常の平日スケジュール" },
  { value: "holiday",       label: "休日モード",   emoji: "🌸", desc: "前日スコアを引き継ぎ" },
  { value: "business_trip", label: "出張モード",   emoji: "✈️", desc: "前日スコアを引き継ぎ" },
  { value: "sick",          label: "病欠モード",   emoji: "🤒", desc: "前日スコアを引き継ぎ" },
];

export default function IdealScheduleTab({ profile, onSave, dayMode, onDayModeChange, taskMode, onTaskModeChange }: Props) {
  const [local, setLocal] = useState<UserProfile>({ ...profile });
  const [gpsLoading, setGpsLoading] = useState<"home" | "work" | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setLocal(prev => ({ ...prev, [key]: value }));
  }

  function toggleOffDay(day: number) {
    const next = local.offDays.includes(day)
      ? local.offDays.filter(d => d !== day)
      : [...local.offDays, day];
    update("offDays", next);
  }

  function handleSave() {
    onSave(local);
    setSaved(true);
    toast.success("設定を保存しました ✨", {
      style: { background: "#fdf6ff", border: "1px solid rgba(192,132,245,0.3)", color: "#6b21a8" },
    });
    setTimeout(() => setSaved(false), 2000);
  }

  function getGPS(type: "home" | "work") {
    if (!navigator.geolocation) {
      toast.error("位置情報がサポートされていません");
      return;
    }
    setGpsLoading(type);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        const label = `現在地 (${lat}, ${lng})`;
        if (type === "home") update("homeStation", label);
        else update("workStation", label);
        setGpsLoading(null);
        toast.success("位置情報を取得しました 📍");
      },
      () => {
        toast.error("位置情報の取得に失敗しました。手動で入力してください。");
        setGpsLoading(null);
      }
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: "1.5px solid rgba(192,132,245,0.25)",
    background: "rgba(255,255,255,0.9)",
    fontSize: 13,
    color: "#374151",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Noto Sans JP', sans-serif",
  };

  return (
    <div style={{ paddingBottom: 80 }}>

      {/* タスクモード選択 */}
      <SectionCard title="タスクモード" emoji="🎮">
        <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10, fontFamily: "'Noto Sans JP', sans-serif" }}>
          タイムラインに表示するタスクの量を選びましょう
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TASK_MODE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onTaskModeChange(opt.value)}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: taskMode === opt.value
                  ? "2px solid #c084f5"
                  : "1.5px solid rgba(0,0,0,0.08)",
                background: taskMode === opt.value
                  ? "linear-gradient(135deg, rgba(244,114,182,0.12), rgba(192,132,245,0.12))"
                  : "rgba(255,255,255,0.7)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 22 }}>{opt.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: taskMode === opt.value ? "#7c3aed" : "#374151", fontFamily: "'Noto Sans JP', sans-serif" }}>
                  {opt.label}
                  {taskMode === opt.value && <span style={{ marginLeft: 6, fontSize: 10, background: "#c084f5", color: "#fff", borderRadius: 6, padding: "1px 6px" }}>選択中</span>}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, fontFamily: "'Noto Sans JP', sans-serif" }}>{opt.tasks}</div>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* 今日のモード */}
      <SectionCard title="今日のモード" emoji="🌤️">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {DAY_MODE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onDayModeChange(opt.value)}
              style={{
                padding: "10px 8px",
                borderRadius: 12,
                border: dayMode === opt.value
                  ? "2px solid #c084f5"
                  : "1.5px solid rgba(0,0,0,0.08)",
                background: dayMode === opt.value
                  ? "linear-gradient(135deg, rgba(244,114,182,0.1), rgba(192,132,245,0.1))"
                  : "rgba(255,255,255,0.7)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 2 }}>{opt.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: dayMode === opt.value ? "#7c3aed" : "#374151", fontFamily: "'Noto Sans JP', sans-serif" }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, fontFamily: "'Noto Sans JP', sans-serif" }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* 基本プロフィール */}
      <SectionCard title="基本プロフィール" emoji="🌸">
        <FieldRow label="名前（愛称でも可）">
          <input
            type="text"
            value={local.name}
            onChange={e => update("name", e.target.value)}
            placeholder="例: みなみ"
            style={inputStyle}
          />
        </FieldRow>
        <FieldRow label="起床時間">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="time"
              value={local.wakeTime}
              onChange={e => update("wakeTime", e.target.value)}
              style={{ ...inputStyle, width: "auto", colorScheme: "light" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'Noto Sans JP', sans-serif" }}>アラーム</span>
              <button
                onClick={() => update("alarmEnabled", !local.alarmEnabled)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 99,
                  border: "none",
                  background: local.alarmEnabled
                    ? "linear-gradient(90deg, #f9a8d4, #c084f5)"
                    : "rgba(0,0,0,0.15)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.3s",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: 3,
                  left: local.alarmEnabled ? 23 : 3,
                  transition: "left 0.3s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }} />
              </button>
              <span style={{ fontSize: 12, color: local.alarmEnabled ? "#7c3aed" : "#9ca3af", fontWeight: 600, fontFamily: "'Noto Sans JP', sans-serif" }}>
                {local.alarmEnabled ? "ON 🔔" : "OFF 🔕"}
              </span>
            </div>
          </div>
        </FieldRow>
        <FieldRow label="就寝時間">
          <input
            type="time"
            value={local.bedTime}
            onChange={e => update("bedTime", e.target.value)}
            style={{ ...inputStyle, width: "auto", colorScheme: "light" }}
          />
        </FieldRow>
      </SectionCard>

      {/* 通勤設定 */}
      <SectionCard title="通勤設定" emoji="🚉">
        <FieldRow label="自宅最寄駅">
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              value={local.homeStation}
              onChange={e => update("homeStation", e.target.value)}
              placeholder="例: 前橋駅"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={() => getGPS("home")}
              disabled={gpsLoading === "home"}
              style={{
                padding: "9px 10px",
                borderRadius: 10,
                border: "1.5px solid rgba(192,132,245,0.4)",
                background: "rgba(192,132,245,0.08)",
                color: "#7c3aed",
                fontSize: 12,
                cursor: gpsLoading === "home" ? "wait" : "pointer",
                whiteSpace: "nowrap",
                fontWeight: 600,
                fontFamily: "'Noto Sans JP', sans-serif",
                flexShrink: 0,
              }}
            >
              {gpsLoading === "home" ? "取得中..." : "📍 現在地"}
            </button>
          </div>
        </FieldRow>
        <FieldRow label="勤務先最寄駅">
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              value={local.workStation}
              onChange={e => update("workStation", e.target.value)}
              placeholder="例: 高崎駅"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={() => getGPS("work")}
              disabled={gpsLoading === "work"}
              style={{
                padding: "9px 10px",
                borderRadius: 10,
                border: "1.5px solid rgba(192,132,245,0.4)",
                background: "rgba(192,132,245,0.08)",
                color: "#7c3aed",
                fontSize: 12,
                cursor: gpsLoading === "work" ? "wait" : "pointer",
                whiteSpace: "nowrap",
                fontWeight: 600,
                fontFamily: "'Noto Sans JP', sans-serif",
                flexShrink: 0,
              }}
            >
              {gpsLoading === "work" ? "取得中..." : "📍 現在地"}
            </button>
          </div>
        </FieldRow>
        <FieldRow label="勤務先（住所・名称）">
          <input
            type="text"
            value={local.workAddress}
            onChange={e => update("workAddress", e.target.value)}
            placeholder="例: ○○株式会社"
            style={inputStyle}
          />
        </FieldRow>
      </SectionCard>

      {/* 通勤中の学習 */}
      <SectionCard title="通勤中の学習内容" emoji="📚">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {LEARNING_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => update("learningContent", opt.id)}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: local.learningContent === opt.id
                  ? "2px solid #c084f5"
                  : "1.5px solid rgba(0,0,0,0.08)",
                background: local.learningContent === opt.id
                  ? "linear-gradient(135deg, rgba(192,132,245,0.12), rgba(244,114,182,0.08))"
                  : "rgba(255,255,255,0.7)",
                fontSize: 12,
                color: local.learningContent === opt.id ? "#7c3aed" : "#374151",
                fontWeight: local.learningContent === opt.id ? 700 : 400,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              <span style={{ fontSize: 15 }}>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* 休日設定 */}
      <SectionCard title="休日設定" emoji="🌿">
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {DAY_LABELS.map((label, idx) => (
            <button
              key={idx}
              onClick={() => toggleOffDay(idx)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: local.offDays.includes(idx)
                  ? "2px solid #c084f5"
                  : "1.5px solid rgba(0,0,0,0.1)",
                background: local.offDays.includes(idx)
                  ? "linear-gradient(135deg, #f9a8d4, #c084f5)"
                  : "rgba(255,255,255,0.7)",
                fontSize: 13,
                fontWeight: 700,
                color: local.offDays.includes(idx) ? "#fff" : "#6b7280",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Shippori Mincho', serif",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 8, fontFamily: "'Noto Sans JP', sans-serif" }}>
          選択した曜日は休日モード扱い（前日スコアを引き継ぎ）
        </div>
      </SectionCard>

      {/* ポイントの仕組み */}
      <SectionCard title="ポイントの仕組み" emoji="💎">
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.8, fontFamily: "'Noto Sans JP', sans-serif" }}>
          {[
            { emoji: "⏰", label: "時間ポイント", desc: "スケジュール通りに行動 (+1pt)" },
            { emoji: "📍", label: "位置ポイント", desc: "指定場所への到達 (+1pt)" },
            { emoji: "📚", label: "タスクポイント", desc: "学習・タスクの実行 (+1pt)" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji}</span>
              <div>
                <span style={{ fontWeight: 700, color: "#374151" }}>{item.label}</span>
                <span style={{ marginLeft: 6 }}>{item.desc}</span>
              </div>
            </div>
          ))}
          <div style={{
            marginTop: 10,
            padding: "10px 12px",
            background: "linear-gradient(135deg, rgba(244,114,182,0.06), rgba(192,132,245,0.08))",
            borderRadius: 10,
            fontSize: 11,
            border: "1px solid rgba(192,132,245,0.15)",
          }}>
            <strong>1日最大13ポイント。</strong>獲得ポイント÷13×100がスコアになります。<br />
            休日・出張・病欠モードは前日スコアを引き継ぎます。
          </div>
        </div>
      </SectionCard>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 14,
          border: "none",
          background: saved
            ? "linear-gradient(135deg, #34d399, #6ee7b7)"
            : "linear-gradient(135deg, #f9a8d4, #c084f5)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(192,132,245,0.3)",
          transition: "all 0.3s ease",
          letterSpacing: "0.05em",
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        {saved ? "✓ 保存しました！" : "💾 設定を保存する"}
      </button>
    </div>
  );
}

// ─── サブコンポーネント ───────────────────────────────────────────────

function SectionCard({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.82)",
      borderRadius: 16,
      padding: "14px 16px",
      marginBottom: 12,
      border: "1px solid rgba(0,0,0,0.06)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: "#7c3aed",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "'Shippori Mincho', serif",
      }}>
        <span>{emoji}</span>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 5, fontFamily: "'Noto Sans JP', sans-serif" }}>{label}</div>
      {children}
    </div>
  );
}
