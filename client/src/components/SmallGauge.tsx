/**
 * SmallGauge.tsx
 * 小型半円メーター（3カテゴリ内訳表示用）
 * デザイン: 和モダン・シンプル・スマホ幅の1/3に収まるサイズ
 * 構造: 上部に半円メーター、中央に数字、下部にラベル（重ならない）
 */

import React from "react";

interface SmallGaugeProps {
  label: string;
  emoji: string;
  earned: number;
  max: number;
  color: string;      // アーク色（CSS color）
  bgColor: string;    // 背景アーク色
}

export default function SmallGauge({ label, emoji, earned, max, color, bgColor }: SmallGaugeProps) {
  const R = 34;
  // 弧の中心を上部に配置（cy を大きくして弧が上に来るように）
  const cx = 50;
  const cy = 44;  // 弧の中心Y（viewBox高さより下に置くことで上半分だけ見える）
  const strokeW = 7;

  // 半円の弧長
  const circumference = Math.PI * R;
  const ratio = Math.min(earned / Math.max(max, 1), 1);
  const dashOffset = circumference * (1 - ratio);

  // 半円パス（左端→右端、上方向の弧）
  const startX = cx - R;
  const startY = cy;
  const endX = cx + R;
  const endY = cy;
  const arcPath = `M ${startX} ${startY} A ${R} ${R} 0 0 1 ${endX} ${endY}`;

  // 針の角度（-180° から 0°）
  const needleAngle = -180 + ratio * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = R - strokeW - 2;
  const needleX = cx + needleLen * Math.cos(needleRad);
  const needleY = cy + needleLen * Math.sin(needleRad);

  const isOver = earned > max;

  // viewBox: 幅100, 高さ55（弧の上部〜中心点まで）
  // cy=44 なので弧の最上部は cy-R=10、中心は44、下に数字エリアを確保
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* SVGメーター（弧のみ・数字なし） */}
      <svg
        viewBox="0 0 100 46"
        style={{ width: "100%", maxWidth: 110, overflow: "visible", display: "block" }}
      >
        {/* 背景アーク */}
        <path
          d={arcPath}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {/* 進捗アーク */}
        <path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${dashOffset}`}
          style={{
            transition: "stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            filter: isOver ? `drop-shadow(0 0 4px ${color})` : undefined,
          }}
        />
        {/* 針 */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={isOver ? color : "#9ca3af"}
          strokeWidth={isOver ? 2.5 : 1.8}
          strokeLinecap="round"
          style={{
            animation: isOver ? "earlyRisePulse 0.18s ease-in-out infinite" : undefined,
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
        {/* 中心点 */}
        <circle cx={cx} cy={cy} r={3.5} fill={isOver ? color : "#d1d5db"} />
      </svg>

      {/* ポイント数字（SVGの外・メーターの直下） */}
      <div
        style={{
          fontSize: isOver ? 13 : 15,
          fontWeight: 900,
          fontFamily: "'Shippori Mincho', serif",
          color: isOver ? color : "#374151",
          lineHeight: 1,
          marginTop: -2,
          letterSpacing: "-0.02em",
        }}
      >
        {earned}<span style={{ fontSize: 9, fontWeight: 500, color: "#9ca3af", marginLeft: 1 }}>pt</span>
      </div>

      {/* ラベル（1行: ⏰時間pt） */}
      <div
        style={{
          fontSize: 10,
          fontFamily: "'Noto Sans JP', sans-serif",
          color: "#9ca3af",
          textAlign: "center",
          marginTop: 2,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
        }}
      >
        {emoji}{label}
      </div>
    </div>
  );
}
