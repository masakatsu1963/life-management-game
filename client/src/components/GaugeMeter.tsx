/**
 * GaugeMeter.tsx
 * Design: Pastel Kawaii Life Manager
 * Soft half-circle gauge with floral decoration image overlay
 * Score 0-100: rose(0-40) → lavender(40-70) → mint(70-100)
 * Score 100+: ゴールド + 針が右端で震えるアニメーション
 */

import { useEffect, useRef, useCallback } from "react";

interface GaugeMeterProps {
  score: number;
  label?: string;
  size?: number;
  animated?: boolean;
  earnedPoints?: number;  // 獲得ポイント（メーター内に表示）
  totalPoints?: number;   // 満点ポイント
}

function scoreToColor(score: number): { main: string; light: string; hex: string } {
  if (score > 100) return { main: "oklch(0.60 0.20 50)", light: "oklch(0.92 0.08 50)", hex: "#f59e0b" };  // 超過=ゴールド
  if (score >= 70) return { main: "oklch(0.65 0.16 165)", light: "oklch(0.92 0.06 165)", hex: "#5ec9a0" };
  if (score >= 40) return { main: "oklch(0.72 0.14 300)", light: "oklch(0.93 0.05 300)", hex: "#c084f5" };
  return { main: "oklch(0.72 0.16 355)", light: "oklch(0.93 0.06 355)", hex: "#f472b6" };
}

// スコア0 → 左端（π）、スコア100 → 右端（2π）
// 100pt超えは右端（2π）に固定（針はそれ以上動かない＝震えで表現）
function scoreToAngle(score: number): number {
  return Math.PI + (Math.min(score, 100) / 100) * Math.PI;
}

export default function GaugeMeter({
  score,
  label = "生活効率スコア",
  size = 300,
  animated = true,
  earnedPoints,
  totalPoints,
}: GaugeMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const shakeAnimRef = useRef<number>(0);
  const currentAngleRef = useRef<number>(scoreToAngle(0));
  const targetAngleRef = useRef<number>(scoreToAngle(score));
  const shakePhaseRef = useRef<number>(0);  // 震えの位相
  const isOver100Ref = useRef<boolean>(false);

  const draw = useCallback((angle: number, currentScore: number, dispEarned?: number, dispTotal?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const cx = w / 2;
    const cy = h * 0.75;
    const outerR = w * 0.42;
    const innerR = w * 0.30;
    const trackW = outerR - innerR;

    ctx.clearRect(0, 0, w * dpr, h * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    const colors = scoreToColor(currentScore);
    const isOver100 = currentScore > 100;

    // === Background track (soft) ===
    ctx.beginPath();
    ctx.arc(cx, cy, outerR - trackW / 2, Math.PI, Math.PI * 2);
    ctx.lineWidth = trackW;
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.stroke();

    // Colored zone hints (very soft)
    const zones = [
      { from: Math.PI,       to: Math.PI * 1.4,  color: "rgba(244,114,182,0.15)" },
      { from: Math.PI * 1.4, to: Math.PI * 1.7,  color: "rgba(192,132,245,0.15)" },
      { from: Math.PI * 1.7, to: Math.PI * 2,    color: "rgba(94,201,160,0.15)" },
    ];
    for (const z of zones) {
      ctx.beginPath();
      ctx.arc(cx, cy, outerR - trackW / 2, z.from, z.to);
      ctx.lineWidth = trackW;
      ctx.strokeStyle = z.color;
      ctx.stroke();
    }

    // === Active arc ===
    if (isOver100) {
      // 100超え：全弧をゴールドグラデーションで塗る
      const goldGrad = ctx.createLinearGradient(cx - outerR, cy, cx + outerR, cy);
      goldGrad.addColorStop(0, "#fcd34d");
      goldGrad.addColorStop(0.5, "#f59e0b");
      goldGrad.addColorStop(1, "#fbbf24");
      ctx.beginPath();
      ctx.arc(cx, cy, outerR - trackW / 2, Math.PI, Math.PI * 2);
      ctx.lineWidth = trackW;
      ctx.strokeStyle = goldGrad;
      ctx.lineCap = "round";
      ctx.stroke();
      // ゴールドグロー（脈動感）
      const glowAlpha = 0.15 + 0.12 * Math.sin(shakePhaseRef.current * 3);
      ctx.beginPath();
      ctx.arc(cx, cy, outerR - trackW / 2, Math.PI, Math.PI * 2);
      ctx.lineWidth = trackW * 0.8;
      ctx.strokeStyle = `rgba(245,158,11,${glowAlpha})`;
      ctx.stroke();
    } else {
      // 通常：rose → lavender → mint グラデーション
      const clampedScore = Math.min(currentScore, 100);
      const activeAngle = Math.PI + (clampedScore / 100) * Math.PI;
      const grad = ctx.createLinearGradient(cx - outerR, cy, cx + outerR, cy);
      grad.addColorStop(0, "#f9a8d4");
      grad.addColorStop(0.5, "#c084f5");
      grad.addColorStop(1, "#6ee7b7");

      ctx.beginPath();
      ctx.arc(cx, cy, outerR - trackW / 2, Math.PI, activeAngle);
      ctx.lineWidth = trackW;
      ctx.strokeStyle = grad;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, outerR - trackW / 2, Math.PI, activeAngle);
      ctx.lineWidth = trackW * 0.5;
      ctx.strokeStyle = colors.hex + "30";
      ctx.stroke();
    }

    // === Tick marks (soft dots) ===
    for (let i = 0; i <= 10; i++) {
      const tickAngle = Math.PI + (i / 10) * Math.PI;
      const isMajor = i % 2 === 0;
      const dotR = isMajor ? 3.5 : 2;
      const dotDist = outerR + 10;
      const dx = cx + Math.cos(tickAngle) * dotDist;
      const dy = cy + Math.sin(tickAngle) * dotDist;

      ctx.beginPath();
      ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
      ctx.fillStyle = isMajor ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)";
      ctx.fill();

      if (isMajor) {
        const labelVal = i * 10;
        const labelDist = dotDist + 14;
        const lx = cx + Math.cos(tickAngle) * labelDist;
        const ly = cy + Math.sin(tickAngle) * labelDist;
        ctx.font = `500 ${w * 0.028}px 'Noto Sans JP', sans-serif`;
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(labelVal), lx, ly);
      }
    }

    // === Needle ===
    // 100pt超えの場合、angleに震えオフセットを加算
    const needleAngle = isOver100
      ? angle + Math.sin(shakePhaseRef.current * 18) * 0.045  // 高速で細かく震える
        + Math.sin(shakePhaseRef.current * 7) * 0.02           // 低周波の揺れも重ねる
      : angle;

    const needleR = outerR * 0.88;
    const nx = cx + Math.cos(needleAngle) * needleR;
    const ny = cy + Math.sin(needleAngle) * needleR;

    // Needle shadow（超過時は金色の影）
    ctx.shadowColor = isOver100 ? "#f59e0b60" : colors.hex + "60";
    ctx.shadowBlur = isOver100 ? 14 : 8;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.lineWidth = isOver100 ? 4 : 3.5;
    ctx.strokeStyle = colors.hex;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Needle base — cute circle with gradient
    const baseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
    baseGrad.addColorStop(0, "#fff");
    baseGrad.addColorStop(0.5, colors.light);
    baseGrad.addColorStop(1, colors.hex + "88");

    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = baseGrad;
    ctx.shadowColor = colors.hex + "50";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = colors.hex;
    ctx.fill();

    // === Score number（実際の獲得ポイントをそのまま表示） ===
    // dispEarned が渡されていれば使う、なければ earnedPoints を使う
    const actualEarned = dispEarned !== undefined ? dispEarned : earnedPoints;
    const mainNum = actualEarned !== undefined ? Math.round(actualEarned) : Math.round(currentScore);
    const subText = actualEarned !== undefined && dispTotal !== undefined ? `/${dispTotal}pt` : "";

    // メインの数字（大きく）
    ctx.font = `700 ${w * 0.17}px 'Shippori Mincho', serif`;
    ctx.fillStyle = colors.hex;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = colors.hex + "40";
    ctx.shadowBlur = isOver100 ? 18 : 12;
    ctx.fillText(String(mainNum), cx, cy - outerR * 0.12);
    ctx.shadowBlur = 0;

    // サブテキスト（/100pt など）
    if (subText) {
      ctx.font = `400 ${w * 0.042}px 'Noto Sans JP', sans-serif`;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillText(subText, cx, cy + outerR * 0.14);
    } else {
      ctx.font = `400 ${w * 0.042}px 'Noto Sans JP', sans-serif`;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillText(label, cx, cy + outerR * 0.14);
    }

    // 達成率 % (小さく)
    const pct = actualEarned !== undefined && dispTotal
      ? Math.round((actualEarned / dispTotal) * 100)
      : Math.round(currentScore);
    const isOver = pct > 100;
    ctx.font = `${isOver ? 600 : 500} ${w * 0.036}px 'Noto Sans JP', sans-serif`;
    ctx.fillStyle = isOver ? "#f59e0b" : colors.hex + "cc";
    ctx.fillText(isOver ? `⭐ ${pct}%` : `${pct}%`, cx, cy + outerR * 0.30);

    ctx.restore();
  }, [label, earnedPoints, totalPoints]);

  // 通常の到達アニメーション
  useEffect(() => {
    targetAngleRef.current = scoreToAngle(score);
    isOver100Ref.current = score > 100;

    if (!animated) {
      currentAngleRef.current = targetAngleRef.current;
      draw(currentAngleRef.current, score, earnedPoints, totalPoints);
      return;
    }

    // 震えアニメーションを停止してから通常アニメ開始
    cancelAnimationFrame(shakeAnimRef.current);

    const animate = () => {
      const current = currentAngleRef.current;
      const target = targetAngleRef.current;
      const diff = target - current;

      if (Math.abs(diff) < 0.001) {
        currentAngleRef.current = target;
        // 100pt超えなら震えアニメーションを開始
        if (isOver100Ref.current) {
          startShakeAnimation();
        } else {
          draw(target, score, earnedPoints, totalPoints);
        }
        return;
      }

      currentAngleRef.current = current + diff * 0.07;
      const displayScore = ((currentAngleRef.current - Math.PI) / Math.PI) * 100;
      // アニメーション中は earnedPoints を補間して表示
      const dispEarned = earnedPoints !== undefined && totalPoints !== undefined
        ? (Math.min(displayScore, 100) / 100) * earnedPoints
        : undefined;
      draw(currentAngleRef.current, Math.max(0, Math.min(100, displayScore)), dispEarned, totalPoints);
      animRef.current = requestAnimationFrame(animate);
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animRef.current);
      cancelAnimationFrame(shakeAnimRef.current);
    };
  }, [score, animated, draw, earnedPoints, totalPoints]);

  // 震えアニメーション（100pt超え時に右端で継続）
  const startShakeAnimation = useCallback(() => {
    const rightEdge = Math.PI * 2;  // 右端の角度

    const shakeLoop = () => {
      shakePhaseRef.current += 0.04;  // 位相を進める
      draw(rightEdge, score, earnedPoints, totalPoints);
      shakeAnimRef.current = requestAnimationFrame(shakeLoop);
    };

    cancelAnimationFrame(shakeAnimRef.current);
    shakeAnimRef.current = requestAnimationFrame(shakeLoop);
  }, [draw, score, earnedPoints, totalPoints]);

  // score が 100 以下に戻ったら震えを停止
  useEffect(() => {
    if (score <= 100) {
      cancelAnimationFrame(shakeAnimRef.current);
    }
  }, [score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = (size * 0.62) * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 0.62}px`;
    draw(currentAngleRef.current, score, earnedPoints, totalPoints);
  }, [size, draw, score, earnedPoints, totalPoints]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", margin: "0 auto" }}
      aria-label={`${label}: ${earnedPoints !== undefined ? earnedPoints : Math.round(score)}点`}
    />
  );
}
