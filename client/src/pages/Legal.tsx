import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";

type Tab = "privacy" | "terms";

export default function Legal() {
  const search = useSearch();
  const [tab, setTab] = useState<Tab>(() => {
    const params = new URLSearchParams(search);
    return params.get("tab") === "terms" ? "terms" : "privacy";
  });

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #fff0f5 0%, #fce7f3 100%)", fontFamily: "'Noto Sans JP', sans-serif" }}
    >
      {/* ヘッダー */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(255,248,249,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(249,168,212,0.3)" }}
      >
        <Link href="/">
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{ background: "rgba(249,168,212,0.2)", color: "#be185d" }}
          >
            ←
          </button>
        </Link>
        <span style={{ fontFamily: "'Shippori Mincho', serif", fontWeight: 700, color: "#be185d", fontSize: "1rem" }}>
          法的情報
        </span>
      </div>

      {/* タブ切り替え */}
      <div className="flex mx-4 mt-4 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(249,168,212,0.4)" }}>
        <button
          onClick={() => setTab("privacy")}
          className="flex-1 py-2 text-sm font-bold transition-all"
          style={{
            background: tab === "privacy" ? "linear-gradient(135deg, #f9a8d4, #c084fc)" : "white",
            color: tab === "privacy" ? "white" : "#be185d",
          }}
        >
          プライバシーポリシー
        </button>
        <button
          onClick={() => setTab("terms")}
          className="flex-1 py-2 text-sm font-bold transition-all"
          style={{
            background: tab === "terms" ? "linear-gradient(135deg, #f9a8d4, #c084fc)" : "white",
            color: tab === "terms" ? "white" : "#be185d",
          }}
        >
          利用規約
        </button>
      </div>

      {/* コンテンツ */}
      <div className="px-4 py-6 pb-16 max-w-2xl mx-auto">
        {tab === "privacy" ? <PrivacyPolicy /> : <TermsOfService />}
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="space-y-6">
      <Section title="プライバシーポリシー">
        <p className="text-xs text-gray-500">最終更新日：2026年3月29日</p>
        <p>
          蓮華堂（以下「当方」）が提供するWebアプリ「イキイキめーたー」（以下「本アプリ」）における、ユーザーの個人情報の取り扱いについて説明します。
        </p>
      </Section>

      <Section title="1. 収集する情報">
        <p>本アプリは、以下の情報を収集・保存します。</p>
        <ul>
          <li>ユーザーが入力した名前・起床時間・勤務時間・最寄駅などのプロフィール情報</li>
          <li>タスクの記録・スコアデータ・週間ログ</li>
          <li>早起きボーナスの記録</li>
          <li>アプリの利用状況（匿名のアクセス解析）</li>
        </ul>
        <p className="mt-2 font-bold text-pink-700">
          これらのデータはすべてお使いの端末のブラウザ（localStorage）に保存されます。当方のサーバーには送信・保存されません。
        </p>
      </Section>

      <Section title="2. 情報の利用目的">
        <ul>
          <li>アプリの機能提供（スコア計算・タスク管理・週間グラフ表示）</li>
          <li>アプリの改善・不具合対応（匿名のアクセス解析のみ）</li>
        </ul>
      </Section>

      <Section title="3. 第三者への提供">
        <p>
          当方は、ユーザーの個人情報を第三者に販売・提供・開示しません。ただし、法令に基づく開示要求があった場合はこの限りではありません。
        </p>
      </Section>

      <Section title="4. アクセス解析">
        <p>
          本アプリは、利用状況の把握のためUmami（オープンソースのプライバシーフレンドリーなアクセス解析ツール）を使用しています。収集されるデータはIPアドレスを含まない匿名データです。
        </p>
      </Section>

      <Section title="5. データの削除">
        <p>
          ブラウザの「サイトデータを削除」または「キャッシュ・Cookie削除」を行うことで、本アプリが保存したすべてのデータを削除できます。
        </p>
      </Section>

      <Section title="6. お問い合わせ">
        <p>
          プライバシーポリシーに関するご質問は、
          <a href="https://rengedo.asia/" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">蓮華堂（rengedo.asia）</a>
          よりお問い合わせください。
        </p>
      </Section>
    </div>
  );
}

function TermsOfService() {
  return (
    <div className="space-y-6">
      <Section title="利用規約">
        <p className="text-xs text-gray-500">最終更新日：2026年3月29日</p>
        <p>
          本規約は、蓮華堂が提供するWebアプリ「イキイキめーたー」（以下「本アプリ」）の利用条件を定めるものです。本アプリをご利用いただくことで、本規約に同意したものとみなします。
        </p>
      </Section>

      <Section title="1. サービスの内容">
        <p>
          本アプリは、ユーザーの日常生活のタスクや行動をポイント化し、生活充実度を見える化する無料のWebアプリです。
        </p>
      </Section>

      <Section title="2. 利用条件">
        <ul>
          <li>本アプリはどなたでも無料でご利用いただけます</li>
          <li>スマートフォン・タブレット・PCのブラウザからアクセスできます</li>
          <li>夜勤・変動勤務形態には現在対応していません</li>
        </ul>
      </Section>

      <Section title="3. 禁止事項">
        <ul>
          <li>本アプリのコンテンツ・デザイン・ソースコードの無断複製・転用</li>
          <li>本アプリを利用した営利目的の二次利用</li>
          <li>本アプリのサービス運営を妨害する行為</li>
          <li>その他、法令または公序良俗に反する行為</li>
        </ul>
      </Section>

      <Section title="4. 免責事項">
        <p>
          当方は、本アプリの利用によって生じたいかなる損害についても責任を負いません。本アプリが提供するスコアや情報は参考情報であり、医療・健康上のアドバイスを目的とするものではありません。
        </p>
        <p className="mt-2">
          本アプリはブラウザのlocalStorageにデータを保存しますが、ブラウザのデータ削除・端末の変更・機種変更などによりデータが失われる場合があります。データのバックアップ機能は現在提供していません。
        </p>
      </Section>

      <Section title="5. サービスの変更・終了">
        <p>
          当方は、予告なく本アプリの内容を変更・終了する場合があります。
        </p>
      </Section>

      <Section title="6. 著作権">
        <p>
          本アプリのデザイン・テキスト・コンテンツの著作権は蓮華堂に帰属します。
        </p>
      </Section>

      <Section title="7. お問い合わせ">
        <p>
          本規約に関するご質問は、
          <a href="https://rengedo.asia/" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">蓮華堂（rengedo.asia）</a>
          よりお問い合わせください。
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "white", border: "1px solid rgba(249,168,212,0.25)", boxShadow: "0 2px 12px rgba(249,168,212,0.1)" }}
    >
      <h2
        className="text-base font-bold mb-3"
        style={{ fontFamily: "'Shippori Mincho', serif", color: "#be185d" }}
      >
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-gray-700 space-y-2">
        {children}
      </div>
    </div>
  );
}
