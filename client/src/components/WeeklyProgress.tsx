/**
 * WeeklyProgress.tsx
 * Design: Pastel Kawaii Life Manager
 *
 * 今週の経過タブ
 * - 今週の日別スコア折れ線グラフ（月〜日）
 * - 今週 vs 先週の曜日比較折れ線グラフ
 * - 累積達成ポイントの推移
 * - カテゴリ別達成率帯グラフ
 */

import type { WeeklyLog } from "@/hooks/useScoreEngine";

interface Props {
  weeklyLogs: WeeklyLog[];
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  borderRadius: 18,
  padding: "16px 14px",
  marginBottom: 12,
  boxShadow: "0 2px 12px rgba(244,114,182,0.08)",
  border: "1px solid rgba(244,114,182,0.12)",
};

function getWeekDates(weekOffset = 0): string[] {
  const today = new Date();
  const dow = today.getDay(); // 0=日
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7) + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_LABELS[d.getDay()];
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

// SVG折れ線グラフ（2系列対応）
function LineChart({
  series,
  height = 120,
}: {
  series: { label: string; color: string; dash?: string; data: (number | null)[] }[];
  height?: number;
}) {
  const W = 300;
  const H = height;
  const PAD = { top: 12, right: 12, bottom: 24, left: 28 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const days = 7;
  const maxVal = 100;

  function xPos(i: number) {
    return PAD.left + (i / (days - 1)) * chartW;
  }
  function yPos(v: number) {
    return PAD.top + chartH - (v / maxVal) * chartH;
  }

  function buildPath(data: (number | null)[]): string {
    let path = "";
    let started = false;
    data.forEach((v, i) => {
      if (v === null) { started = false; return; }
      const x = xPos(i);
      const y = yPos(v);
      if (!started) { path += `M ${x} ${y}`; started = true; }
      else { path += ` L ${x} ${y}`; }
    });
    return path;
  }

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, overflow: "visible" }}>
      {/* グリッド線 */}
      {yTicks.map(v => (
        <g key={v}>
          <line
            x1={PAD.left} y1={yPos(v)}
            x2={W - PAD.right} y2={yPos(v)}
            stroke="rgba(0,0,0,0.06)" strokeWidth={1}
          />
          <text x={PAD.left - 4} y={yPos(v) + 4} textAnchor="end" fontSize={8} fill="#9ca3af">
            {v}
          </text>
        </g>
      ))}

      {/* X軸ラベル（月〜日） */}
      {["月", "火", "水", "木", "金", "土", "日"].map((d, i) => (
        <text key={d} x={xPos(i)} y={H - 4} textAnchor="middle" fontSize={9} fill="#9ca3af">
          {d}
        </text>
      ))}

      {/* 折れ線 */}
      {series.map(s => (
        <g key={s.label}>
          <path
            d={buildPath(s.data)}
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            strokeDasharray={s.dash}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
          {/* データポイント */}
          {s.data.map((v, i) =>
            v !== null ? (
              <circle
                key={i}
                cx={xPos(i)}
                cy={yPos(v)}
                r={3.5}
                fill={s.color}
                stroke="#fff"
                strokeWidth={1.5}
              />
            ) : null
          )}
        </g>
      ))}
    </svg>
  );
}

// 累積ポイント棒グラフ
function BarChart({ data, dates }: { data: (number | null)[]; dates: string[] }) {
  const maxPt = 13;
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
      {data.map((pt, i) => {
        const today = isToday(dates[i]);
        const pct = pt !== null ? Math.min((pt / maxPt) * 100, 100) : 0;
        const dayLabel = ["月", "火", "水", "木", "金", "土", "日"][i];
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ fontSize: 9, color: pt !== null ? "#7c3aed" : "#d1d5db", fontWeight: 700, fontFamily: "'Noto Sans JP', sans-serif" }}>
              {pt !== null ? `${pt}pt` : ""}
            </div>
            <div style={{ width: "100%", height: 56, display: "flex", alignItems: "flex-end" }}>
              <div
                style={{
                  width: "100%",
                  height: `${pct}%`,
                  minHeight: pt !== null ? 4 : 0,
                  borderRadius: "4px 4px 0 0",
                  background: today
                    ? "linear-gradient(180deg, #f472b6, #c084f5)"
                    : pt !== null
                      ? "linear-gradient(180deg, rgba(244,114,182,0.5), rgba(192,132,245,0.4))"
                      : "rgba(0,0,0,0.05)",
                  transition: "height 0.5s ease",
                }}
              />
            </div>
            <div style={{
              fontSize: 10,
              fontWeight: today ? 700 : 400,
              color: today ? "#f472b6" : "#9ca3af",
              fontFamily: "'Noto Sans JP', sans-serif",
            }}>
              {dayLabel}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function WeeklyProgress({ weeklyLogs }: Props) {
  const thisWeekDates = getWeekDates(0);   // 今週（月〜日）
  const lastWeekDates = getWeekDates(-1);  // 先週（月〜日）

  // 今週・先週のスコアデータ（データなし=null）
  const thisWeekScores: (number | null)[] = thisWeekDates.map(d => {
    const log = weeklyLogs.find(l => l.date === d);
    return log ? log.score : null;
  });
  const lastWeekScores: (number | null)[] = lastWeekDates.map(d => {
    const log = weeklyLogs.find(l => l.date === d);
    return log ? log.score : null;
  });

  // 今週の獲得ポイント
  const thisWeekPoints: (number | null)[] = thisWeekDates.map(d => {
    const log = weeklyLogs.find(l => l.date === d);
    return log ? log.earnedPoints : null;
  });

  // 今週の累積スコア（日ごとの平均）
  const validScores = thisWeekScores.filter(s => s !== null) as number[];
  const avgScore = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0;
  const totalPoints = (thisWeekPoints.filter(p => p !== null) as number[]).reduce((a, b) => a + b, 0);
  const todayScore = thisWeekScores[thisWeekDates.findIndex(d => isToday(d))] ?? null;

  // 今週vs先週の比較（同曜日）
  const comparisonData = thisWeekDates.map((d, i) => {
    const thisScore = thisWeekScores[i];
    const lastScore = lastWeekScores[i];
    const diff = thisScore !== null && lastScore !== null ? thisScore - lastScore : null;
    return { day: getDayLabel(d), thisScore, lastScore, diff };
  });

  const hasData = validScores.length > 0;
  const hasLastWeek = lastWeekScores.some(s => s !== null);

  return (
    <div style={{ paddingBottom: 80, padding: "0 0 80px 0" }}>

      {/* サマリーカード */}
      <div style={{ ...CARD_STYLE, background: "linear-gradient(135deg, rgba(244,114,182,0.08), rgba(192,132,245,0.08))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", fontFamily: "'Noto Sans JP', sans-serif" }}>
            📊 今週のサマリー
          </div>
          <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'Noto Sans JP', sans-serif" }}>
            {thisWeekDates[0].slice(5).replace("-", "/")} 〜 {thisWeekDates[6].slice(5).replace("-", "/")}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "今日のスコア", value: todayScore !== null ? `${todayScore}pt` : "---", emoji: "🎯", color: "#f472b6" },
            { label: "週平均スコア", value: hasData ? `${avgScore}pt` : "---", emoji: "📈", color: "#c084f5" },
            { label: "週累積ポイント", value: hasData ? `${totalPoints}pt` : "---", emoji: "💎", color: "#818cf8" },
          ].map(item => (
            <div key={item.label} style={{ textAlign: "center", padding: "10px 6px", background: "rgba(255,255,255,0.7)", borderRadius: 12 }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{item.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: item.color, fontFamily: "'Orbitron', monospace" }}>
                {item.value}
              </div>
              <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2, fontFamily: "'Noto Sans JP', sans-serif" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 今週の日別スコア折れ線 */}
      <div style={CARD_STYLE}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8, fontFamily: "'Noto Sans JP', sans-serif" }}>
          📅 今週の日別スコア推移
        </div>
        {hasData ? (
          <LineChart
            series={[
              { label: "今週", color: "#f472b6", data: thisWeekScores },
              ...(hasLastWeek ? [{ label: "先週", color: "#c084f5", dash: "5,3", data: lastWeekScores }] : []),
            ]}
            height={130}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif" }}>
            まだデータがありません<br />タスクを達成するとグラフが表示されます
          </div>
        )}
        {hasLastWeek && (
          <div style={{ display: "flex", gap: 12, marginTop: 6, justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 20, height: 2.5, background: "#f472b6", borderRadius: 2 }} />
              <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'Noto Sans JP', sans-serif" }}>今週</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <svg width={20} height={4}><line x1={0} y1={2} x2={20} y2={2} stroke="#c084f5" strokeWidth={2} strokeDasharray="4,2" /></svg>
              <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'Noto Sans JP', sans-serif" }}>先週</span>
            </div>
          </div>
        )}
      </div>

      {/* 今週の日別獲得ポイント棒グラフ */}
      <div style={CARD_STYLE}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10, fontFamily: "'Noto Sans JP', sans-serif" }}>
          💎 今週の日別獲得ポイント
        </div>
        <BarChart data={thisWeekPoints} dates={thisWeekDates} />
        <div style={{ marginTop: 8, fontSize: 10, color: "#9ca3af", textAlign: "center", fontFamily: "'Noto Sans JP', sans-serif" }}>
          最大13pt/日
        </div>
      </div>

      {/* 曜日比較テーブル */}
      <div style={CARD_STYLE}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10, fontFamily: "'Noto Sans JP', sans-serif" }}>
          🔄 今週 vs 先週の曜日比較
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* ヘッダー */}
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 56px", gap: 4, paddingBottom: 6, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            {["曜日", "今週", "先週", "差分"].map(h => (
              <div key={h} style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", fontFamily: "'Noto Sans JP', sans-serif" }}>{h}</div>
            ))}
          </div>
          {comparisonData.map((row, i) => {
            const today = isToday(thisWeekDates[i]);
            const diff = row.diff;
            const diffColor = diff === null ? "#9ca3af" : diff > 0 ? "#10b981" : diff < 0 ? "#f43f5e" : "#9ca3af";
            const diffLabel = diff === null ? "---" : diff > 0 ? `+${diff}` : `${diff}`;
            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr 1fr 56px",
                  gap: 4,
                  padding: "6px 4px",
                  borderRadius: 8,
                  background: today ? "rgba(244,114,182,0.06)" : "transparent",
                }}
              >
                <div style={{ textAlign: "center", fontSize: 12, fontWeight: today ? 700 : 400, color: today ? "#f472b6" : "#6b7280", fontFamily: "'Noto Sans JP', sans-serif" }}>
                  {row.day}
                  {today && <span style={{ display: "block", fontSize: 8, color: "#f472b6" }}>今日</span>}
                </div>
                {/* 今週バー */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ flex: 1, height: 8, background: "rgba(0,0,0,0.05)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${row.thisScore ?? 0}%`, background: "linear-gradient(90deg, #f472b6, #c084f5)", borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#374151", minWidth: 24, textAlign: "right", fontFamily: "'Orbitron', monospace" }}>
                    {row.thisScore !== null ? row.thisScore : "---"}
                  </span>
                </div>
                {/* 先週バー */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ flex: 1, height: 8, background: "rgba(0,0,0,0.05)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${row.lastScore ?? 0}%`, background: "linear-gradient(90deg, rgba(192,132,245,0.5), rgba(129,140,248,0.5))", borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#9ca3af", minWidth: 24, textAlign: "right", fontFamily: "'Orbitron', monospace" }}>
                    {row.lastScore !== null ? row.lastScore : "---"}
                  </span>
                </div>
                {/* 差分 */}
                <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: diffColor, fontFamily: "'Orbitron', monospace" }}>
                  {diffLabel}
                </div>
              </div>
            );
          })}
        </div>
        {!hasLastWeek && (
          <div style={{ marginTop: 8, fontSize: 10, color: "#9ca3af", textAlign: "center", fontFamily: "'Noto Sans JP', sans-serif" }}>
            先週のデータが蓄積されると比較が表示されます
          </div>
        )}
      </div>

      {/* 週間コメント */}
      {hasData && (
        <div style={{ ...CARD_STYLE, background: "linear-gradient(135deg, rgba(244,114,182,0.06), rgba(192,132,245,0.06))" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Noto Sans JP', sans-serif" }}>
            💌 今週のひとこと
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, fontFamily: "'Noto Sans JP', sans-serif" }}>
            {avgScore >= 80
              ? `✨ 週平均${avgScore}pt！素晴らしいペースです。この調子で来週も続けましょう🌸`
              : avgScore >= 60
              ? `🌷 週平均${avgScore}pt。着実に積み上げています。もう少しで高スコア圏内！`
              : avgScore >= 40
              ? `🌱 週平均${avgScore}pt。まずは毎日1タスクから始めましょう。小さな積み重ねが大切です。`
              : `🌸 まだ始まったばかり。今日から少しずつ記録してみましょう！`}
          </div>
        </div>
      )}
    </div>
  );
}
