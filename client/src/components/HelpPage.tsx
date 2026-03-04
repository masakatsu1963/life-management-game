/**
 * HelpPage.tsx
 * Design: Pastel Kawaii Life Manager
 * アプリの使い方・見方を説明するページ
 */

import { useState } from "react";

const sections = [
  {
    id: "overview",
    emoji: "🌸",
    title: "このアプリについて",
    color: "#f9a8d4",
    bg: "rgba(249,168,212,0.08)",
    border: "rgba(249,168,212,0.3)",
    content: [
      {
        type: "text",
        body: "「Life Manager」は、あなたの理想の1日と現実の1日のズレを「生活効率スコア（0〜100点）」で見える化するライフゲームです。",
      },
      {
        type: "text",
        body: "スコアを上げることが目的ではなく、自分のリズムを知り、少しずつ理想に近づくことを楽しむアプリです。",
      },
      {
        type: "tips",
        items: [
          "毎日続けるとストリーク（連続日数）が増えます",
          "7日間スコア80点超えでチートポイントがもらえます",
          "無理せず、自分のペースで使いましょう🌿",
        ],
      },
    ],
  },
  {
    id: "meter",
    emoji: "🎯",
    title: "メーターの見方",
    color: "#c084f5",
    bg: "rgba(192,132,245,0.08)",
    border: "rgba(192,132,245,0.3)",
    content: [
      {
        type: "gauge-diagram",
      },
      {
        type: "table",
        headers: ["スコア", "色", "状態"],
        rows: [
          ["70〜100点", "🟢 グリーン", "絶好調！理想に近い生活"],
          ["40〜69点", "🟣 パープル", "順調。少し調整しよう"],
          ["0〜39点", "🩷 ピンク", "がんばろう！立て直せます"],
        ],
      },
      {
        type: "text",
        body: "針はリアルタイムで動きます。1分ごとに自動更新されるので、「更新」ボタンを押さなくても大丈夫です。",
      },
    ],
  },
  {
    id: "score",
    emoji: "📊",
    title: "スコアの計算方法",
    color: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.3)",
    content: [
      {
        type: "score-breakdown",
      },
      {
        type: "text",
        body: "4つの要素を合計して「生活効率スコア」が決まります。時間精度が最も大きな割合を占めています。",
      },
      {
        type: "tips",
        items: [
          "時間精度：理想スケジュールの時刻から±5分以内なら満点",
          "空間精度：設定した場所から100m以内なら満点",
          "活動達成：チェックした活動の割合",
          "感情スコア：その日の気分を5段階で入力",
        ],
      },
    ],
  },
  {
    id: "status",
    emoji: "⏰",
    title: "ステータスバーの見方",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    content: [
      {
        type: "status-items",
        items: [
          { icon: "⏰", label: "時間ズレ", desc: "現在時刻と直近の理想スケジュールのズレ（分）。マイナスは遅れを意味します。±5分以内で緑色になります。" },
          { icon: "📍", label: "距離", desc: "現在地と理想スケジュールの場所とのズレ（km）。位置情報をONにすると自動計測されます。" },
          { icon: "💎", label: "チートCP", desc: "チートポイントの残量。連続7日80点超えで50CP獲得。アラーム無効（50CP）や空間条件解除（30CP）に使えます。" },
          { icon: "🔥", label: "連続日数", desc: "スコア80点以上を達成した日が何日連続しているか。7日達成でボーナスがもらえます。" },
        ],
      },
    ],
  },
  {
    id: "tabs",
    emoji: "📱",
    title: "各タブの使い方",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.3)",
    content: [
      {
        type: "tab-guide",
        items: [
          {
            icon: "📊",
            label: "ダッシュ",
            desc: "メインの管理画面。スコアメーター・24時間グラフ・スコア内訳・感情入力・チートシステムをまとめて確認できます。",
          },
          {
            icon: "📋",
            label: "今日",
            desc: "今日のスケジュール一覧。各活動のチェックボックスをタップして達成をマークします。位置情報の設定もここから。",
          },
          {
            icon: "🌸",
            label: "理想設定",
            desc: "プロフィール（名前・起床時間・最寄駅など）の確認・編集、モード変更、理想スケジュールの編集ができます。",
          },
          {
            icon: "📖",
            label: "使い方",
            desc: "このページです。いつでも確認できます。",
          },
        ],
      },
    ],
  },
  {
    id: "schedule",
    emoji: "📋",
    title: "理想スケジュールの設定",
    color: "#f472b6",
    bg: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.3)",
    content: [
      {
        type: "text",
        body: "「理想設定」タブ →「理想スケジュール」の「✏️ 編集」ボタンから、1日の理想的なスケジュールを自由に設定できます。",
      },
      {
        type: "tips",
        items: [
          "時刻・場所・活動内容の3つを入力します",
          "最低1件あれば動作します",
          "就寝時間も入れると夜のスコアが計算されます",
          "休日用スケジュールは今後対応予定です",
        ],
      },
      {
        type: "example",
        title: "設定例",
        rows: [
          ["06:30", "自宅", "起床・瞑想"],
          ["07:15", "通勤", "学習30分"],
          ["12:00", "職場", "昼休み活用"],
          ["22:00", "自宅", "就寝デトックス"],
        ],
      },
    ],
  },
  {
    id: "cheat",
    emoji: "💎",
    title: "チートシステム",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.3)",
    content: [
      {
        type: "text",
        body: "チートポイント（CP）は、頑張った日のご褒美として使える特別なポイントです。",
      },
      {
        type: "table",
        headers: ["獲得方法", "CP"],
        rows: [
          ["7日連続スコア80点超え", "+50CP"],
          ["初回設定完了", "+20CP（初期付与）"],
        ],
      },
      {
        type: "table",
        headers: ["使い方", "消費CP"],
        rows: [
          ["全アラーム無効（1日）", "50CP"],
          ["空間条件解除（1日）", "30CP"],
        ],
      },
      {
        type: "tips",
        items: [
          "CPは大切に使いましょう。一度使うと戻りません",
          "体調が悪い日や特別な日に使うのがおすすめです",
        ],
      },
    ],
  },
  {
    id: "modes",
    emoji: "🎮",
    title: "モードについて",
    color: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.3)",
    content: [
      {
        type: "table",
        headers: ["モード", "特徴"],
        rows: [
          ["🌸 ソロモード", "自分のペースで理想生活を追う基本モード"],
          ["⚔️ バトルモード", "招待コードで友達と対戦（Coming Soon）"],
          ["🌿 リラックスモード", "スコアを気にせず記録だけ続けたい日に"],
        ],
      },
      {
        type: "text",
        body: "「理想設定」タブのモード選択からいつでも変更できます。",
      },
    ],
  },
];

type SectionId = typeof sections[number]["id"];

export default function HelpPage() {
  const [openSection, setOpenSection] = useState<SectionId | null>("overview");

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div
        className="rounded-2xl px-4 py-4"
        style={{
          background: "linear-gradient(135deg, rgba(249,168,212,0.15) 0%, rgba(192,132,245,0.12) 100%)",
          border: "1.5px solid rgba(192,132,245,0.2)",
        }}
      >
        <div className="text-lg font-bold mb-1" style={{ fontFamily: "'Shippori Mincho', serif", color: "rgba(0,0,0,0.65)" }}>
          📖 使い方ガイド
        </div>
        <div className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
          気になるセクションをタップして確認してください
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const isOpen = openSection === section.id;
        return (
          <div
            key={section.id}
            className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              background: isOpen ? section.bg : "rgba(255,255,255,0.82)",
              border: `1.5px solid ${isOpen ? section.border : "rgba(0,0,0,0.06)"}`,
              boxShadow: isOpen ? `0 4px 16px ${section.color}18` : "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* Section header */}
            <button
              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              onClick={() => setOpenSection(isOpen ? null : section.id as SectionId)}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{section.emoji}</span>
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: "'Shippori Mincho', serif", color: isOpen ? section.color : "rgba(0,0,0,0.6)" }}
                >
                  {section.title}
                </span>
              </div>
              <span
                className="text-xs transition-transform duration-200"
                style={{ color: "rgba(0,0,0,0.3)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}
              >
                ▼
              </span>
            </button>

            {/* Section content */}
            {isOpen && (
              <div className="px-4 pb-4 flex flex-col gap-3">
                {section.content.map((block, i) => (
                  <div key={i}>
                    {/* Text block */}
                    {block.type === "text" && (
                      <p className="text-sm leading-relaxed" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.6)" }}>
                        {(block as { type: string; body: string }).body}
                      </p>
                    )}

                    {/* Tips block */}
                    {block.type === "tips" && (
                      <div className="flex flex-col gap-1.5">
                        {(block as { type: string; items: string[] }).items.map((tip: string, j: number) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="text-xs mt-0.5" style={{ color: section.color }}>✦</span>
                            <span className="text-xs leading-relaxed" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)" }}>
                              {tip}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Table block */}
                    {block.type === "table" && (
                      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${section.border}` }}>
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ background: section.bg }}>
                              {(block as { type: string; headers: string[]; rows: string[][] }).headers.map((h: string, j: number) => (
                                <th
                                  key={j}
                                  className="px-3 py-2 text-left font-bold"
                                  style={{ fontFamily: "'Noto Sans JP', sans-serif", color: section.color }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(block as { type: string; headers: string[]; rows: string[][] }).rows.map((row: string[], j: number) => (
                              <tr key={j} style={{ borderTop: `1px solid ${section.border}40` }}>
                                {row.map((cell: string, k: number) => (
                                  <td
                                    key={k}
                                    className="px-3 py-2"
                                    style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.6)" }}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Gauge diagram */}
                    {block.type === "gauge-diagram" && (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="relative" style={{ width: 200, height: 110 }}>
                          <svg viewBox="0 0 200 110" width="200" height="110">
                            {/* Background arc */}
                            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="16" strokeLinecap="round" />
                            {/* Green zone */}
                            <path d="M 20 100 A 80 80 0 0 1 100 20" fill="none" stroke="#34d399" strokeWidth="16" strokeLinecap="round" opacity="0.4" />
                            {/* Purple zone */}
                            <path d="M 100 20 A 80 80 0 0 1 165 55" fill="none" stroke="#c084f5" strokeWidth="16" strokeLinecap="round" opacity="0.4" />
                            {/* Pink zone */}
                            <path d="M 165 55 A 80 80 0 0 1 180 100" fill="none" stroke="#f9a8d4" strokeWidth="16" strokeLinecap="round" opacity="0.4" />
                            {/* Needle */}
                            <line x1="100" y1="100" x2="55" y2="40" stroke="#c084f5" strokeWidth="3" strokeLinecap="round" />
                            <circle cx="100" cy="100" r="6" fill="#c084f5" />
                            {/* Labels */}
                            <text x="12" y="108" fontSize="10" fill="rgba(0,0,0,0.4)" fontFamily="sans-serif">0</text>
                            <text x="88" y="16" fontSize="10" fill="rgba(0,0,0,0.4)" fontFamily="sans-serif">50</text>
                            <text x="178" y="108" fontSize="10" fill="rgba(0,0,0,0.4)" fontFamily="sans-serif">100</text>
                          </svg>
                        </div>
                        <div className="flex gap-4">
                          {[
                            { color: "#34d399", label: "70〜100点" },
                            { color: "#c084f5", label: "40〜69点" },
                            { color: "#f9a8d4", label: "0〜39点" },
                          ].map((l) => (
                            <div key={l.label} className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                              <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)", fontSize: "0.6rem" }}>
                                {l.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Score breakdown diagram */}
                    {block.type === "score-breakdown" && (
                      <div className="flex flex-col gap-2">
                        {[
                          { label: "⏰ 時間精度", pct: 40, color: "#f9a8d4", desc: "40%" },
                          { label: "📍 空間精度", pct: 30, color: "#c084f5", desc: "30%" },
                          { label: "✅ 活動達成", pct: 20, color: "#34d399", desc: "20%" },
                          { label: "😊 感情スコア", pct: 10, color: "#60a5fa", desc: "10%" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2">
                            <span className="text-xs font-medium" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.55)", minWidth: "6.5rem" }}>
                              {item.label}
                            </span>
                            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${item.pct}%`, background: item.color }}
                              />
                            </div>
                            <span className="text-xs font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: item.color, minWidth: "2rem" }}>
                              {item.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status items */}
                    {block.type === "status-items" && (
                      <div className="flex flex-col gap-2.5">
                        {(block as { type: string; items: { icon: string; label: string; desc: string }[] }).items.map((item: { icon: string; label: string; desc: string }) => (
                          <div
                            key={item.label}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}
                          >
                            <span className="text-xl mt-0.5">{item.icon}</span>
                            <div>
                              <div className="text-xs font-bold mb-0.5" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: section.color }}>
                                {item.label}
                              </div>
                              <div className="text-xs leading-relaxed" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)" }}>
                                {item.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab guide */}
                    {block.type === "tab-guide" && (
                      <div className="flex flex-col gap-2">
                        {(block as { type: string; items: { icon: string; label: string; desc: string }[] }).items.map((item: { icon: string; label: string; desc: string }) => (
                          <div
                            key={item.label}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}
                          >
                            <span className="text-xl mt-0.5">{item.icon}</span>
                            <div>
                              <div className="text-xs font-bold mb-0.5" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: section.color }}>
                                {item.label}
                              </div>
                              <div className="text-xs leading-relaxed" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.5)" }}>
                                {item.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Example block */}
                    {block.type === "example" && (
                      <div>
                        <div className="text-xs font-medium mb-1.5" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.4)" }}>
                          {(block as { type: string; title: string; rows: string[][] }).title}
                        </div>
                        <div className="flex flex-col gap-1">
                          {(block as { type: string; title: string; rows: string[][] }).rows.map((row: string[], j: number) => (
                            <div
                              key={j}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.05)" }}
                            >
                              <span className="text-xs font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: section.color, minWidth: "2.5rem" }}>
                                {row[0]}
                              </span>
                              <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.35)", minWidth: "2.5rem" }}>
                                📍 {row[1]}
                              </span>
                              <span className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.6)" }}>
                                {row[2]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer note */}
      <div
        className="rounded-2xl px-4 py-3 text-center"
        style={{ background: "rgba(249,168,212,0.06)", border: "1px dashed rgba(249,168,212,0.3)" }}
      >
        <p className="text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "rgba(0,0,0,0.35)" }}>
          バトルモード・NotebookLM連携・最終電車通知など<br />
          順次アップデートで追加予定です 🌸
        </p>
      </div>
    </div>
  );
}
