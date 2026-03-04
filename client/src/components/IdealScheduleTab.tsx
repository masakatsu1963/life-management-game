/**
 * IdealScheduleTab.tsx
 * Design: Pastel Kawaii Life Manager
 * 「理想のスケジュール」タブ画面
 * プロフィール確認・スケジュール編集・モード変更
 */

import { useState } from "react";
import type { UserProfile } from "./ProfileSetup";
import { LEARNING_OPTIONS_MAP, DAY_LABELS } from "./ProfileSetup";
import type { ScheduleItem } from "@/hooks/useScoreEngine";
import ScheduleEditor from "./ScheduleEditor";
import { toast } from "sonner";

interface Props {
  profile: UserProfile;
  schedule: ScheduleItem[];
  onSaveSchedule: (items: ScheduleItem[]) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function IdealScheduleTab({ profile, schedule, onSaveSchedule, onUpdateProfile }: Props) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [localProfile, setLocalProfile] = useState<UserProfile>({ ...profile });

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setLocalProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleOffDay = (day: number) => {
    setLocalProfile((prev) => ({
      ...prev,
      offDays: prev.offDays.includes(day)
        ? prev.offDays.filter((d) => d !== day)
        : [...prev.offDays, day],
    }));
  };

  const saveProfile = () => {
    const updated = { ...localProfile };
    localStorage.setItem("lifemanager_profile", JSON.stringify(updated));
    onUpdateProfile(updated);
    setEditingProfile(false);
    toast.success("設定を保存しました ✨", {
      style: { background: "#fdf6ff", border: "1px solid rgba(192,132,245,0.3)", color: "#6b21a8" },
    });
  };

  const inputStyle = {
    fontFamily: "'Noto Sans JP', sans-serif",
    background: "rgba(255,255,255,0.9)",
    border: "1.5px solid rgba(192,132,245,0.25)",
    borderRadius: "0.875rem",
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    color: "rgba(0,0,0,0.7)",
    width: "100%",
    outline: "none",
  };

  const MODES = [
    { id: "solo", label: "ソロモード", emoji: "🌸" },
    { id: "battle", label: "バトルモード", emoji: "⚔️" },
    { id: "relax", label: "リラックス", emoji: "🌿" },
  ];

  const LEARNING_OPTIONS = [
    { id: "podcast", label: "ポッドキャスト", emoji: "🎙️" },
    { id: "notebooklm", label: "NotebookLM", emoji: "📓" },
    { id: "audiobook", label: "オーディオブック", emoji: "📚" },
    { id: "language", label: "語学学習", emoji: "🌍" },
    { id: "music", label: "音楽・リラックス", emoji: "🎵" },
    { id: "none", label: "なし", emoji: "💤" },
  ];

  return (
    <div className="flex flex-col gap-3">

      {/* Profile card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(192,132,245,0.2)", boxShadow: "0 2px 12px rgba(192,132,245,0.08)" }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(192,132,245,0.1)" }}>
          <span className="text-sm font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}>
            🌸 プロフィール
          </span>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              color: editingProfile ? "#dc2626" : "#a855f7",
              background: editingProfile ? "rgba(252,165,165,0.15)" : "rgba(192,132,245,0.12)",
              border: `1.5px solid ${editingProfile ? "rgba(252,165,165,0.4)" : "rgba(192,132,245,0.3)"}`,
            }}
          >
            {editingProfile ? "✕ キャンセル" : "✏️ 編集"}
          </button>
        </div>

        <div className="px-4 py-3 flex flex-col gap-3">
          {!editingProfile ? (
            /* View mode */
            <div className="flex flex-col gap-2">
              {[
                { icon: "👤", label: "お名前", value: profile.nickname },
                { icon: "⏰", label: "起床時間", value: `${profile.wakeTime}（アラーム: ${profile.alarmEnabled ? "ON 🔔" : "OFF 🔕"}）` },
                { icon: "🏠", label: "自宅最寄駅", value: profile.homeStation || "未設定" },
                { icon: "🏢", label: "勤務先最寄駅", value: profile.workStation || "未設定" },
                { icon: "📓", label: "通勤学習", value: LEARNING_OPTIONS.find((o) => o.id === profile.learningContent)?.label || "" },
                { icon: "📅", label: "休日", value: profile.offDays.length > 0 ? profile.offDays.map((d) => DAY_LABELS[d]).join("・") : "なし" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{item.icon}</span>
                  <span className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)", minWidth: "5.5rem" }}>
                    {item.label}
                  </span>
                  <span className="text-sm" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.65)" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Edit mode */
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)" }}>お名前</label>
                <input type="text" value={localProfile.nickname} onChange={(e) => update("nickname", e.target.value)} style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)" }}>起床時間</label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={localProfile.wakeTime}
                    onChange={(e) => update("wakeTime", e.target.value)}
                    style={{ ...inputStyle, width: "auto", colorScheme: "light", fontFamily: "'Shippori Mincho', serif", fontWeight: 700, color: "#a855f7" }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)" }}>アラーム</span>
                    <button
                      onClick={() => update("alarmEnabled", !localProfile.alarmEnabled)}
                      className="relative w-10 h-5 rounded-full transition-all duration-200"
                      style={{ background: localProfile.alarmEnabled ? "linear-gradient(90deg, #f9a8d4, #c084f5)" : "rgba(0,0,0,0.12)" }}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
                        style={{ left: localProfile.alarmEnabled ? "calc(100% - 1.125rem)" : "0.125rem", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                      />
                    </button>
                    <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: localProfile.alarmEnabled ? "#a855f7" : "rgba(0,0,0,0.3)" }}>
                      {localProfile.alarmEnabled ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)" }}>自宅最寄駅</label>
                <input type="text" placeholder="例：新宿" value={localProfile.homeStation} onChange={(e) => update("homeStation", e.target.value)} style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)" }}>勤務先最寄駅</label>
                <input type="text" placeholder="例：大手町" value={localProfile.workStation} onChange={(e) => update("workStation", e.target.value)} style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)" }}>通勤中の学習</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {LEARNING_OPTIONS.map((opt) => {
                    const isActive = localProfile.learningContent === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => update("learningContent", opt.id)}
                        className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
                        style={{
                          background: isActive ? "rgba(192,132,245,0.12)" : "rgba(0,0,0,0.03)",
                          border: `1.5px solid ${isActive ? "rgba(192,132,245,0.4)" : "rgba(0,0,0,0.06)"}`,
                        }}
                      >
                        <span className="text-base">{opt.emoji}</span>
                        <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: isActive ? "#a855f7" : "rgba(0,0,0,0.45)", fontSize: "0.6rem", fontWeight: isActive ? 700 : 400 }}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)" }}>休日</label>
                <div className="flex gap-1.5">
                  {DAY_LABELS.map((label: string, i: number) => {
                    const isSelected = localProfile.offDays.includes(i);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleOffDay(i)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          fontFamily: "'Shippori Mincho', serif",
                          background: isSelected ? "rgba(192,132,245,0.15)" : "rgba(0,0,0,0.03)",
                          border: `1.5px solid ${isSelected ? "rgba(192,132,245,0.4)" : "rgba(0,0,0,0.06)"}`,
                          color: isSelected ? "#a855f7" : "rgba(0,0,0,0.4)",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={saveProfile}
                className="w-full py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  background: "linear-gradient(135deg, #f9a8d4, #c084f5)",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(192,132,245,0.35)",
                }}
              >
                保存する ✨
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mode selection */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="text-sm font-bold mb-3" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}>
          🎮 モード選択
        </div>
        <div className="flex gap-2">
          {MODES.map((mode) => {
            const isActive = profile.mode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  const updated = { ...profile, mode: mode.id as UserProfile["mode"] };
                  localStorage.setItem("lifemanager_profile", JSON.stringify(updated));
                  onUpdateProfile(updated);
                  toast.success(`${mode.label}に変更しました`, { style: { background: "#fdf6ff", border: "1px solid rgba(192,132,245,0.3)", color: "#6b21a8" } });
                }}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200"
                style={{
                  background: isActive ? "rgba(192,132,245,0.12)" : "rgba(0,0,0,0.03)",
                  border: `1.5px solid ${isActive ? "rgba(192,132,245,0.4)" : "rgba(0,0,0,0.06)"}`,
                  transform: isActive ? "scale(1.03)" : "scale(1)",
                  boxShadow: isActive ? "0 3px 10px rgba(192,132,245,0.18)" : "none",
                }}
              >
                <span className="text-xl">{mode.emoji}</span>
                <span className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: isActive ? "#a855f7" : "rgba(0,0,0,0.45)", fontWeight: isActive ? 700 : 400, fontSize: "0.65rem" }}>
                  {mode.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ideal schedule */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.6)" }}>
            📋 理想スケジュール
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
        <div className="flex flex-col gap-2">
          {[...schedule]
            .sort((a, b) => {
              const [ah, am] = a.time.split(":").map(Number);
              const [bh, bm] = b.time.split(":").map(Number);
              return ah * 60 + am - (bh * 60 + bm);
            })
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.05)" }}
              >
                <span className="text-xs font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "#a855f7", minWidth: "2.5rem" }}>
                  {item.time}
                </span>
                <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.35)", minWidth: "3rem" }}>
                  📍 {item.location}
                </span>
                <span className="text-sm flex-1 truncate" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.6)" }}>
                  {item.activity}
                </span>
              </div>
            ))}
        </div>
      </div>

      {showEditor && (
        <ScheduleEditor schedule={schedule} onSave={onSaveSchedule} onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
}
