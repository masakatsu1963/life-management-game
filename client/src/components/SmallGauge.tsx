/**
 * SmallGauge.tsx
 * 小型半円メーター（3カテゴリ内訳表示用）
 * デザイン: 和モダン・シンプル・スマホ幅の1/3に収まるサイズ
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
  // 半円（180度）のSVGパラメータ
  const R = 36;
  const cx = 48;
  const cy = 48;
  const strokeW = 7;

  // 半円の弧長
  const circumference = Math.PI * R; // 半円なので π*r
  const ratio = Math.min(earned / Math.max(max, 1), 1);
  const dashOffset = circumference * (1 - ratio);

  // 半円の start/end 点（左端=180°, 右端=0°）
  const startX = cx - R;
  const startY = cy;
  const endX = cx + R;
  const endY = cy;

  // SVG半円パス（上半分の弧）
  const arcPath = `M ${startX} ${startY} A ${R} ${R} 0 0 1 ${endX} ${endY}`;

  // 針の角度（-180° から 0° まで）
  const needleAngle = -180 + ratio * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = R - strokeW - 2;
  const needleX = cx + needleLen * Math.cos(needleRad);
  const needleY = cy + needleLen * Math.sin(needleRad);

  // 100超えの場合は針を右端固定＋震えアニメーション
  const isOver = earned > max;

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
      {/* SVGメーター */}
      <svg
        viewBox="0 0 96 54"
        style={{ width: "100%", maxWidth: 110, overflow: "visible" }}
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
          stroke={isOver ? color : "#6b7280"}
          strokeWidth={isOver ? 2.5 : 1.8}
          strokeLinecap="round"
          style={{
            animation: isOver ? "earlyRisePulse 0.18s ease-in-out infinite" : undefined,
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
        {/* 中心点 */}
        <circle cx={cx} cy={cy} r={3} fill={isOver ? color : "#9ca3af"} />
        {/* ポイント数字 */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize={isOver ? "13" : "14"}
          fontWeight="900"
          fontFamily="'Shippori Mincho', serif"
          fill={isOver ? color : "#374151"}
        >
          {earned}
        </text>
        {/* /max */}
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fontSize="7"
          fontFamily="'Noto Sans JP', sans-serif"
          fill="#9ca3af"
        >
          /{max}pt
        </text>
      </svg>

      {/* ラベル（1行: ⏰時間pt） */}
      <div
        style={{
          fontSize: 11,
          fontFamily: "'Noto Sans JP', sans-serif",
          color: "#6b7280",
          textAlign: "center",
          marginTop: 4,
          lineHeight: 1.4,
          whiteSpace: "nowrap",
        }}
      >
        {emoji}{label}
      </div>
    </div>
  );
}
