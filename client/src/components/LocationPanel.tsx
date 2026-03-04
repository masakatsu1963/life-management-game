/**
 * LocationPanel.tsx
 * Design: Dark Gaming Gauge - GPS location panel
 * Shows current location status and distance from ideal
 */

import { useGeolocation } from "@/hooks/useGeolocation";

interface Props {
  onDistanceUpdate: (km: number) => void;
  currentDistance: number;
}

export default function LocationPanel({ onDistanceUpdate, currentDistance }: Props) {
  const { geoState, startWatching, stopWatching } = useGeolocation(onDistanceUpdate);

  const distColor =
    currentDistance <= 0.1 ? "#22d97a" :
    currentDistance <= 0.5 ? "#f0b429" : "#f05252";

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📍</span>
          <span
            className="text-sm font-bold"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.7)" }}
          >
            位置情報
          </span>
        </div>

        <button
          onClick={geoState.isWatching ? stopWatching : startWatching}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            background: geoState.isWatching ? "rgba(240,82,82,0.15)" : "rgba(34,217,122,0.15)",
            border: `1px solid ${geoState.isWatching ? "rgba(240,82,82,0.3)" : "rgba(34,217,122,0.3)"}`,
            color: geoState.isWatching ? "#f05252" : "#22d97a",
          }}
        >
          {geoState.isWatching ? "停止" : "開始"}
        </button>
      </div>

      {geoState.error ? (
        <div
          className="text-xs px-3 py-2 rounded-lg"
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            color: "#f05252",
            background: "rgba(240,82,82,0.1)",
            border: "1px solid rgba(240,82,82,0.2)",
          }}
        >
          ⚠ {geoState.error}
        </div>
      ) : geoState.isWatching && geoState.latitude ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span
              className="text-xs"
              style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.4)" }}
            >
              理想地点からの距離
            </span>
            <span
              className="text-lg font-bold"
              style={{ fontFamily: "Orbitron, monospace", color: distColor }}
            >
              {currentDistance < 1
                ? `${Math.round(currentDistance * 1000)}m`
                : `${currentDistance.toFixed(1)}km`}
            </span>
          </div>

          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(0, 100 - currentDistance * 50)}%`,
                background: distColor,
                boxShadow: `0 0 6px ${distColor}88`,
              }}
            />
          </div>

          <div
            className="text-xs"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.3)" }}
          >
            精度: ±{Math.round(geoState.accuracy || 0)}m
          </div>
        </div>
      ) : (
        <div
          className="text-xs text-center py-2"
          style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(255,255,255,0.3)" }}
        >
          「開始」を押して位置情報を有効にしてください
        </div>
      )}
    </div>
  );
}
