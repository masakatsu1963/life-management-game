/**
 * PinLockScreen.tsx
 * デザイン: イキイキめーたー — ピンク×パープルグラデーション、スマホ縦画面前提
 * 役割: 起動時PINロック解除画面（4桁）
 */
import { useState } from "react";

interface Props {
  onUnlock: () => void;
}

const STORAGE_KEY = "lgm_pin_hash";

// 簡易ハッシュ（XOR + 文字コード合計）— 軽量な難読化
function hashPin(pin: string): string {
  let h = 0;
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) - h + pin.charCodeAt(i)) | 0;
  }
  return String(h >>> 0);
}

export function hasPinSet(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

export function savePin(pin: string): void {
  localStorage.setItem(STORAGE_KEY, hashPin(pin));
}

export function clearPin(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function verifyPin(pin: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === hashPin(pin);
}

export default function PinLockScreen({ onUnlock }: Props) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleKey = (key: string) => {
    if (input.length >= 4) return;
    const next = input + key;
    setInput(next);
    setError(false);

    if (next.length === 4) {
      setTimeout(() => {
        if (verifyPin(next)) {
          onUnlock();
        } else {
          setShake(true);
          setError(true);
          setTimeout(() => {
            setInput("");
            setShake(false);
          }, 600);
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    setInput((prev) => prev.slice(0, -1));
    setError(false);
  };

  const dots = Array.from({ length: 4 }, (_, i) => i < input.length);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-pink-100 via-purple-50 to-white">
      {/* アイコン */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
          <img
            src="https://cdn-static.manus.space/webdev/life-management-game/icon-192.png"
            alt="イキイキめーたー"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <p className="text-lg font-bold text-pink-600 tracking-wide">イキイキめーたー</p>
        <p className="text-sm text-gray-500">PINコードを入力してください</p>
      </div>

      {/* ドット表示 */}
      <div
        className={`flex gap-4 mb-8 transition-all ${shake ? "animate-bounce" : ""}`}
        style={shake ? { animation: "shake 0.5s ease" } : {}}
      >
        {dots.map((filled, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              filled
                ? error
                  ? "bg-red-400 border-red-400"
                  : "bg-pink-500 border-pink-500"
                : "bg-transparent border-pink-300"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-4 font-medium">PINコードが違います</p>
      )}

      {/* キーパッド */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className="h-16 rounded-2xl bg-white shadow-md text-2xl font-bold text-gray-700 active:bg-pink-50 active:scale-95 transition-all border border-pink-100"
          >
            {k}
          </button>
        ))}
        {/* 空白 */}
        <div />
        <button
          onClick={() => handleKey("0")}
          className="h-16 rounded-2xl bg-white shadow-md text-2xl font-bold text-gray-700 active:bg-pink-50 active:scale-95 transition-all border border-pink-100"
        >
          0
        </button>
        {/* 削除 */}
        <button
          onClick={handleDelete}
          className="h-16 rounded-2xl bg-white shadow-md text-xl font-bold text-gray-500 active:bg-pink-50 active:scale-95 transition-all border border-pink-100"
        >
          ⌫
        </button>
      </div>

      <p className="mt-8 text-xs text-gray-400">© 2026 蓮華堂</p>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
