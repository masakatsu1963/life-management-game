/**
 * LocationPanel.tsx
 * Design: Pastel Kawaii Life Manager
 * Soft GPS location panel with mint accents
 */

import { useGeolocation } from "@/hooks/useGeolocation";

interface Props {
  onDistanceUpdate: (km: number) => void;
  currentDistance: number;
}

export default function LocationPanel({ onDistanceUpdate, currentDistance }: Props) {
  const { geoState, startWatching, stopWatching } = useGeolocation(onDistanceUpdate);

  const distColor =
    currentDistance <= 0.1 ? "#34d399" :
    currentDistance <= 0.5 ? "#c084f5" : "#fca5a5";

  const distLabel =
    currentDistance <= 0.1 ? "バッチリ！✨" :
    currentDistance <= 0.5 ? "もうすぐ" : "がんばれ〜";

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "rgba(240,253,250,0.8)", border: "1.5px solid rgba(52,211,153,0.25)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📍</span>
          <span className="text-sm font-bold" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#059669" }}>
            位置情報
          </span>
        </div>
        <button
          onClick={geoState.isWatching ? stopWatching : startWatching}
          className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            background: geoState.isWatching ? "rgba(252,165,165,0.2)" : "rgba(52,211,153,0.15)",
            border: `1.5px solid ${geoState.isWatching ? "rgba(252,165,165,0.5)" : "rgba(52,211,153,0.4)"}`,
            color: geoState.isWatching ? "#dc2626" : "#059669",
          }}
        >
          {geoState.isWatching ? "停止" : "開始"}
        </button>
      </div>

      {geoState.error ? (
        <div
          className="text-xs px-3 py-2 rounded-xl"
          style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#dc2626", background: "rgba(252,165,165,0.15)", border: "1px solid rgba(252,165,165,0.3)" }}
        >
          ⚠ {geoState.error}
        </div>
      ) : geoState.isWatching && geoState.latitude ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
              理想地点からの距離
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: distColor }}>
                {currentDistance < 1 ? `${Math.round(currentDistance * 1000)}m` : `${currentDistance.toFixed(1)}km`}
              </span>
              <span className="text-xs" style={{ color: distColor, fontFamily: "'Noto Sans JP', sans-serif" }}>
                {distLabel}
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(52,211,153,0.15)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(0, 100 - currentDistance * 50)}%`,
                background: `linear-gradient(90deg, ${distColor}88, ${distColor})`,
              }}
            />
          </div>
          <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.3)" }}>
            精度: ±{Math.round(geoState.accuracy || 0)}m
          </span>
        </div>
      ) : (
        <div className="text-xs text-center py-2" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.3)" }}>
          「開始」を押して位置情報を有効にしてください 🗺️
        </div>
      )}
    </div>
  );
}
