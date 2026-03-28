/**
 * HelpPage.tsx
 * Design: Pastel Kawaii Life Manager
 * アプリの使い方・見方を説明するページ（最新仕様対応版）
 *
 * 反映済み仕様:
 * - タブ構成: 今日 / 今週の経過 / 理想設定 / 使い方
 * - 今日タブ: モード選択（通常/休日/出張・病欠） + 早起きボタン + サブメーター + タスク/移動ログ
 * - タスク選択: デフォルト「何をしましたか？」、「何もしなかった（0pt）」追加
 * - 未来タスクはロック（🔒）
 * - 休日モード: 午前・午後・夜間の9スロット、各30pt、満点90pt
 * - 早起きボーナス: 理想起床時刻との差分で最大30pt（別枠加算）
 * - 出張・病欠: 移動ログなし、タスクのみ
 * - 設定した休日曜日は自動で休日モードに切り替わる
 * - デスクトップへの保存方法（iPhone/Android）
 */

import { useState } from "react";

const sections = [
  {
    id: "setup",
    emoji: "⚙️",
    title: "モード・生活スタイルの設定",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.3)",
    content: [
      {
        type: "text",
        body: "「生活スタイル設定」タブから、名前・起床時間・最寄駅・勤務先・出社/昼休憩/退社/就寝時間・休日設定・タスクモードをいつでも変更できます。",
      },
      {
        type: "table",
        headers: ["設定項目", "内容"],
        rows: [
          ["名前", "アプリ内で表示される名前"],
          ["起床時間", "早起きボーナスの基準時刻"],
          ["自宅最寄駅", "通勤ルートの出発点（位置pt計算に使用）"],
          ["勤務先最寄駅", "通勤ルートの到着点（位置pt計算に使用）"],
          ["出社・昼休憩・退社時間", "タスクのスケジュール時刻"],
          ["就寝時間", "就寝前デトックスタスクの時刻"],
          ["休日設定", "選んだ曜日は起動時に自動で休日モードになります"],
          ["タスクモード", "イージー/ハーフ/ハードで満点を変更"],
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
            label: "今日タブ",
            desc: "メインの管理画面。スコアメーター・早起きボタン・今日のモード選択・タスク記録・移動ログをまとめて確認・入力できます。",
          },
          {
            icon: "📈",
            label: "今週の経過タブ",
            desc: "過去7日間のスコア推移グラフと週間カテゴリ達成率を確認できます。",
          },
          {
            icon: "🌸",
            label: "生活スタイル設定タブ",
            desc: "プロフィール（名前・起床時間・最寄駅・休日設定など）の確認・編集、タスクモード変更ができます。",
          },
          {
            icon: "📖",
            label: "使い方タブ",
            desc: "このページです。いつでも確認できます。",
          },
        ],
      },
    ],
  },
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
        body: "「イキイキめーたー」は、あなたの理想の1日と現実の1日のズレを「生活効率スコア」で見える化するライフゲームです。（夜勤や、勤務形態に変動が多い方には、現在未対応です。ごめんなさい。）",
      },
      {
        type: "text",
        body: "スコアを上げることが目的ではなく、自分のリズムを知り、少しずつ理想に近づくことを楽しむアプリです。",
      },
      {
        type: "tips",
        items: [
          "毎日続けることで自分の生活リズムが見えてきます",
          "週間グラフで7日間の変化を振り返れます",
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
        body: "針はリアルタイムで動きます。1分ごとに自動更新されます。メーター下の数字が「獲得ポイント / 満点」です。",
      },
      {
        type: "tips",
        items: [
          "サブメーターが3つ表示されます：時間pt・位置pt・タスクpt",
          "早起きボーナスは時間ptサブメーターに加算されます",
        ],
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
        type: "text",
        body: "スコアは「獲得ポイント ÷ 満点 × 100」で計算されます。タスクモードによって満点が変わります。",
      },
      {
        type: "table",
        headers: ["タスクモード", "満点", "内容"],
        rows: [
          ["🚶 イージー", "30pt", "移動ログのみ（タスクなし）"],
          ["🚃 ハーフ", "50pt", "通勤中・帰宅中タスクのみ"],
          ["🌟 ハード", "100pt", "全5タスク完全版"],
        ],
      },
      {
        type: "text",
        body: "早起きボーナスは満点とは別枠で加算されます。満点を超えた場合はメーターがゴールド表示になります。",
      },
      {
        type: "table",
        headers: ["ポイント種別", "内容"],
        rows: [
          ["⏰ 時間pt", "理想スケジュールの時刻に近いほど加点"],
          ["📍 位置pt", "設定した場所（駅・職場）に近いほど加点"],
          ["✅ タスクpt", "タスクを達成するごとに加点"],
          ["🌅 早起きpt", "理想起床時刻より早く起きると別枠で加点"],
        ],
      },
    ],
  },
  {
    id: "earlyrise",
    emoji: "🌅",
    title: "早起きボーナスの使い方",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    content: [
      {
        type: "text",
        body: "今日タブの上部にある「おはよう！早起きポイント」ボタンをタップすると、その時刻と理想起床時刻の差分でボーナスポイントが加算されます。",
      },
      {
        type: "table",
        headers: ["早起き時間", "ボーナスpt"],
        rows: [
          ["1時間以上早い", "+30pt 🌟"],
          ["45分以上早い", "+25pt ⭐"],
          ["30分以上早い", "+20pt ☀️"],
          ["15分以上早い", "+15pt 🌤️"],
          ["1分以上早い", "+10pt 👍"],
          ["ちょうど", "+5pt ⏰"],
          ["遅れた場合", "0〜4pt 🌙"],
        ],
      },
      {
        type: "tips",
        items: [
          "1日1回のみ記録できます（タップ後は変更不可）",
          "早起きボーナスは時間ptサブメーターに加算されます",
          "ボタンは当日中いつでも表示されます（タップ忘れ防止）",
        ],
      },
    ],
  },
  {
    id: "daymode",
    emoji: "🎮",
    title: "今日のモード選択",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.3)",
    content: [
      {
        type: "text",
        body: "今日タブのメーター下にある3つのボタンで今日のモードを選択します。設定した休日曜日は起動時に自動で休日モードに切り替わります。",
      },
      {
        type: "table",
        headers: ["モード", "特徴"],
        rows: [
          ["💼 通常", "平日の通常スケジュール。タスクモードに応じた満点でスコア計算"],
          ["🌸 休日", "午前・午後・夜間の9スロット。各30pt・満点90pt。移動ログなし"],
          ["✈️ 出張", "移動ログなし。タスクのみ表示。前日スコアを引き継ぎ"],
          ["🤒 病欠", "移動ログなし。タスクのみ表示。前日スコアを引き継ぎ"],
        ],
      },
      {
        type: "tips",
        items: [
          "出張・病欠は「出張・病欠」ボタンを繰り返しタップで切り替えられます",
          "理想設定で選んだ休日曜日は、その曜日に起動すると自動で休日モードになります",
          "日付をまたぐと出張・病欠モードはリセットされ、曜日設定に基づいて再判定されます",
        ],
      },
    ],
  },
  {
    id: "tasks",
    emoji: "✅",
    title: "タスクの記録方法",
    color: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.3)",
    content: [
      {
        type: "text",
        body: "今日タブの「今日のタスク」セクションで、各タスクをタップして展開し、何をしたかを選択してOKボタンを押すと記録されます。",
      },
      {
        type: "status-items",
        items: [
          { icon: "🔒", label: "ロックされたタスク（未来）", desc: "まだ時刻になっていないタスクはグレーアウトされタップできません。時刻を過ぎると入力可能になります。" },
          { icon: "📝", label: "入力可能なタスク", desc: "タップして展開し、「何をしましたか？」からタスク内容を選択。OKボタンで記録します。" },
          { icon: "💤", label: "何もしなかった", desc: "選択肢に「何もしなかった（0pt）」があります。記録だけしておきたい時に使いましょう。" },
          { icon: "✅", label: "記録済みタスク", desc: "OKを押すとポイントが加算され、カードに達成マークが表示されます。" },
        ],
      },
      {
        type: "tips",
        items: [
          "過去のタスクはいつでも後から入力できます",
          "未来の時刻のタスクは入力できません（🔒表示）",
          "休日モードでは午前・午後・夜間の9スロットが表示されます",
        ],
      },
    ],
  },
  {
    id: "holiday",
    emoji: "🌸",
    title: "休日モードの使い方",
    color: "#f472b6",
    bg: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.3)",
    content: [
      {
        type: "text",
        body: "休日モードでは、午前・午後・夜間の3つの時間帯に各3スロット（計9スロット）が表示されます。各タスクは30ptで、満点は90ptです。",
      },
      {
        type: "table",
        headers: ["時間帯", "スロット数", "各pt"],
        rows: [
          ["☀️ 午前（〜12時）", "3スロット", "各30pt"],
          ["🌞 午後（13〜18時）", "3スロット", "各30pt"],
          ["🌙 夜間（19時〜）", "3スロット", "各30pt"],
        ],
      },
      {
        type: "tips",
        items: [
          "移動ログは表示されません（休日のため）",
          "勉強・読書・散歩・ストレッチなど自由に選択できます",
          "早起きボーナスは休日モードでも加算されます",
        ],
      },
    ],
  },
  {
    id: "install",
    emoji: "📲",
    title: "スマホのホーム画面に追加する方法",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    content: [
      {
        type: "text",
        body: "このアプリはWebアプリです。ホーム画面に追加するとアプリのように使えます。",
      },
      {
        type: "status-items",
        items: [
          {
            icon: "🍎",
            label: "iPhone（Safari）の場合",
            desc: "Safariで開く → 画面下の「共有」ボタン（□↑）をタップ → 「ホーム画面に追加」を選択 → 「追加」をタップ",
          },
          {
            icon: "🤖",
            label: "Android（Chrome）の場合",
            desc: "Chromeで開く → 右上の「⋮」メニューをタップ → 「ホーム画面に追加」または「アプリをインストール」を選択",
          },
        ],
      },
      {
        type: "tips",
        items: [
          "ホーム画面に追加するとフルスクリーンで起動できます",
          "データはブラウザのローカルストレージに保存されます",
          "ブラウザのデータを消去するとデータが失われますのでご注意ください",
        ],
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
                            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="16" strokeLinecap="round" />
                            <path d="M 20 100 A 80 80 0 0 1 100 20" fill="none" stroke="#34d399" strokeWidth="16" strokeLinecap="round" opacity="0.4" />
                            <path d="M 100 20 A 80 80 0 0 1 165 55" fill="none" stroke="#c084f5" strokeWidth="16" strokeLinecap="round" opacity="0.4" />
                            <path d="M 165 55 A 80 80 0 0 1 180 100" fill="none" stroke="#f9a8d4" strokeWidth="16" strokeLinecap="round" opacity="0.4" />
                            <line x1="100" y1="100" x2="55" y2="40" stroke="#c084f5" strokeWidth="3" strokeLinecap="round" />
                            <circle cx="100" cy="100" r="6" fill="#c084f5" />
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
          週間グラフ・通知機能など<br />
          順次アップデートで追加予定です 🌸
        </p>
      </div>
    </div>
  );
}
