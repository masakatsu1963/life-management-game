/**
 * ScheduleEditor.tsx
 * Design: Dark Gaming Gauge - Ideal schedule editor
 * Allows users to set their ideal daily schedule
 */

import { useState } from "react";
import type { ScheduleItem } from "@/hooks/useScoreEngine";
import { toast } from "sonner";

interface Props {
  schedule: ScheduleItem[];
  onSave: (schedule: ScheduleItem[]) => void;
  onClose: () => void;
}

export default function ScheduleEditor({ schedule, onSave, onClose }: Props) {
  const [items, setItems] = useState<ScheduleItem[]>(
    [...schedule].sort((a, b) => {
      const [ah, am] = a.time.split(":").map(Number);
      const [bh, bm] = b.time.split(":").map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    })
  );

  const updateItem = (id: string, field: keyof ScheduleItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      time: "12:00",
      location: "場所",
      activity: "活動",
      completed: false,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 2) {
      toast.error("最低2つのイベントが必要です", {
        style: { background: "#1a1a2e", border: "1px solid rgba(240,82,82,0.3)", color: "#f0f0f0" },
      });
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    onSave(items);
    toast.success("スケジュールを保存しました！", {
      style: { background: "#1a1a2e", border: "1px solid rgba(34,217,122,0.3)", color: "#f0f0f0" },
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[430px] rounded-t-2xl overflow-hidden flex flex-col"
        style={{
          background: "oklch(0.15 0.025 265)",
          border: "1px solid rgba(255,255,255,0.1)",
          maxHeight: "85vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span
            className="text-base font-bold"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.85)" }}
          >
            📅 理想スケジュール編集
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl p-3 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2">
                {/* Time input */}
                <input
                  type="time"
                  value={item.time}
                  onChange={(e) => updateItem(item.id, "time", e.target.value)}
                  className="rounded-lg px-2 py-1.5 text-sm font-bold w-24"
                  style={{
                    fontFamily: "Orbitron, monospace",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#22d97a",
                    colorScheme: "dark",
                  }}
                />

                {/* Location input */}
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) => updateItem(item.id, "location", e.target.value)}
                  placeholder="場所"
                  className="rounded-lg px-2 py-1.5 text-xs flex-1"
                  style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                />

                {/* Delete button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors text-sm"
                  style={{ color: "rgba(240,82,82,0.5)" }}
                >
                  ✕
                </button>
              </div>

              {/* Activity input */}
              <input
                type="text"
                value={item.activity}
                onChange={(e) => updateItem(item.id, "activity", e.target.value)}
                placeholder="活動内容"
                className="rounded-lg px-2 py-1.5 text-sm w-full"
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                }}
              />
            </div>
          ))}

          {/* Add button */}
          <button
            onClick={addItem}
            className="flex items-center justify-center gap-2 py-3 rounded-xl transition-all hover:bg-white/8"
            style={{
              border: "1px dashed rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.35)",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "0.875rem",
            }}
          >
            + イベントを追加
          </button>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/8"
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              background: "rgba(34,217,122,0.2)",
              border: "1px solid rgba(34,217,122,0.4)",
              color: "#22d97a",
              boxShadow: "0 0 12px rgba(34,217,122,0.2)",
            }}
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}
