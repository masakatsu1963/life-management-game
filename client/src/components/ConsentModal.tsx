// ConsentModal.tsx
// デザイン哲学: ソフトピンク・ラベンダー系。初回アクセス時にプライバシーポリシーへの同意を求めるフルスクリーンモーダル。
// 同意後にlocalStorageへ記録し、以降は表示しない。

import { useState } from "react";
import { Link } from "wouter";

const CONSENT_KEY = "lgm_privacy_consent_v1";

export function hasConsented(): boolean {
  return localStorage.getItem(CONSENT_KEY) === "agreed";
}

interface ConsentModalProps {
  onAgree: () => void;
}

export default function ConsentModal({ onAgree }: ConsentModalProps) {
  const [checked, setChecked] = useState(false);

  const handleAgree = () => {
    if (!checked) return;
    localStorage.setItem(CONSENT_KEY, "agreed");
    onAgree();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-6 py-5 text-white text-center">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663145989169/V3mzZwvpdi82dLMoVHx8Pr/icon-192_124c3548.png"
            alt="イキイキめーたー"
            className="w-16 h-16 mx-auto mb-2 rounded-xl shadow"
          />
          <h1 className="text-lg font-bold tracking-wide">イキイキめーたー</h1>
          <p className="text-xs text-pink-100 mt-1">はじめてご利用の方へ</p>
        </div>

        {/* 本文 */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            ご利用の前に、プライバシーポリシーおよび利用規約をご確認ください。
          </p>

          <div className="bg-pink-50 rounded-xl p-4 text-xs text-gray-600 leading-relaxed space-y-2">
            <p>
              <span className="font-semibold text-pink-600">データの保存について：</span>
              入力された情報はすべてお使いの端末内（ブラウザのローカルストレージ）にのみ保存されます。外部サーバーへの送信は行いません。
            </p>
            <p>
              <span className="font-semibold text-pink-600">個人情報について：</span>
              氏名・住所等の個人を特定できる情報の入力は不要です。
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="consent-check"
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-pink-500 cursor-pointer flex-shrink-0"
            />
            <label htmlFor="consent-check" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
              <a
                href="/legal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                プライバシーポリシー・利用規約
              </a>
              を読み、内容に同意します
            </label>
          </div>

          <button
            onClick={handleAgree}
            disabled={!checked}
            className={`w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
              checked
                ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            同意してはじめる
          </button>

          <p className="text-center text-xs text-gray-400">
            © 2026{" "}
            <a
              href="https://rengedo.asia/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              蓮華堂
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
