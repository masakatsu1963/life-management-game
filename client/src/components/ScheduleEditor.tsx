/**
 * ScheduleEditor.tsx
 * Design: Pastel Kawaii Life Manager
 * Soft bottom-sheet modal for schedule editing
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
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: Date.now().toString(), time: "12:00", location: "場所", activity: "活動", completed: false }]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 2) {
      toast.error("最低2つのイベントが必要です", { style: { background: "#fff0f6", border: "1px solid #fca5a5", color: "#7f1d1d" } });
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    onSave(items);
    toast.success("スケジュールを保存しました！✨", { style: { background: "#f0fdf4", border: "1px solid #6ee7b7", color: "#064e3b" } });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden flex flex-col"
        style={{ background: "#fdf6ff", border: "1.5px solid rgba(192,132,245,0.2)", maxHeight: "85vh" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(192,132,245,0.15)" }}>
          <span className="text-base font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.65)" }}>
            🌸 理想スケジュール
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-pink-50"
            style={{ color: "rgba(0,0,0,0.3)" }}
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl p-3 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(192,132,245,0.15)", boxShadow: "0 2px 8px rgba(192,132,245,0.06)" }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={item.time}
                  onChange={(e) => updateItem(item.id, "time", e.target.value)}
                  className="rounded-xl px-2 py-1.5 text-sm font-bold w-24"
                  style={{ fontFamily: "'Shippori Mincho', serif", background: "rgba(192,132,245,0.08)", border: "1.5px solid rgba(192,132,245,0.2)", color: "#a855f7", colorScheme: "light" }}
                />
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) => updateItem(item.id, "location", e.target.value)}
                  placeholder="場所"
                  className="rounded-xl px-2 py-1.5 text-xs flex-1"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", background: "rgba(0,0,0,0.03)", border: "1.5px solid rgba(0,0,0,0.07)", color: "rgba(0,0,0,0.6)" }}
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors text-sm"
                  style={{ color: "rgba(252,165,165,0.8)" }}
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={item.activity}
                onChange={(e) => updateItem(item.id, "activity", e.target.value)}
                placeholder="活動内容"
                className="rounded-xl px-2 py-1.5 text-sm w-full"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", background: "rgba(0,0,0,0.03)", border: "1.5px solid rgba(0,0,0,0.07)", color: "rgba(0,0,0,0.7)" }}
              />
            </div>
          ))}

          <button
            onClick={addItem}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl transition-all hover:bg-pink-50/50"
            style={{ border: "1.5px dashed rgba(244,114,182,0.3)", color: "rgba(244,114,182,0.7)", fontFamily: "'Noto Sans JP', sans-serif", fontSize: "0.875rem" }}
          >
            🌸 イベントを追加
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(192,132,245,0.12)" }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all hover:bg-gray-50"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)", border: "1.5px solid rgba(0,0,0,0.08)" }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
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
      </div>
    </div>
  );
}
