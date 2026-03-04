# ライフマネジメントゲーム デザインアイデア

## コンセプト
スマホ縦画面（390px基準）で動作するゲームUI。生活効率スコアをリアルタイムで可視化。

---

<response>
<probability>0.07</probability>
<idea>

## アプローチA: サイバーパンク計器盤（Cyberpunk HUD）

**Design Movement**: 近未来HUD / ネオン計器盤美学
**Core Principles**:
- 暗黒背景にネオングリーン・シアンの発光エフェクト
- 計器盤・コックピット的レイアウト
- グリッチ・スキャンライン演出でゲーム感を強調
- 数値の精密さと視認性を最優先

**Color Philosophy**:
- 背景: #0a0e1a（深夜の宇宙）
- アクセント: #00ff88（ネオングリーン）、#00d4ff（サイアン）
- 警告: #ff3366（赤いアラート）
- テキスト: #e0f0ff（冷たい白）

**Layout Paradigm**:
- 中央に大型針メーター（Canvas）
- 上部にステータスバー群
- 下部にコントロールパネル
- 全要素が「計器」として機能

**Signature Elements**:
- スキャンライン背景パターン
- 発光する数値カウンター
- 針の動きに連動する背景色変化

**Interaction Philosophy**:
- タップ時にリップルエフェクト
- スコア変化時にグリッチアニメーション

**Animation**:
- 針: cubic-bezier(0.34, 1.56, 0.64, 1) でバウンス
- 数値: カウントアップアニメーション
- 警告: 赤点滅 + 振動

**Typography System**:
- 数値: "Orbitron" (Google Fonts) - SF的等幅フォント
- ラベル: "Noto Sans JP" - 日本語対応
- 階層: 数値72px > ラベル12px > 説明10px

</idea>
</response>

<response>
<probability>0.06</probability>
<idea>

## アプローチB: 禅×ゲーム融合（Zen Gamification）

**Design Movement**: 日本の禅美学 × ゲームUI
**Core Principles**:
- 余白を活かした静謐なレイアウト
- 墨絵のような単色グラデーション
- 「間」の概念をUIに適用
- シンプルさの中に深みを持たせる

**Color Philosophy**:
- 背景: #1a1a2e（深い藍色）
- 主色: #c9a84c（金箔）
- 補色: #8b4513（朱色）
- テキスト: #f5f0e8（和紙色）

**Layout Paradigm**:
- 縦長スクロールなし、1画面完結
- 円形メーターが中心に鎮座
- 情報は必要最小限のみ表示

**Signature Elements**:
- 和紙テクスチャ背景
- 毛筆風の装飾ライン
- 金色の針と目盛り

**Typography System**:
- 見出し: "Shippori Mincho" - 明朝体
- 数値: "Zen Kaku Gothic New"
- 本文: "Noto Serif JP"

</idea>
</response>

<response>
<probability>0.08</probability>
<idea>

## アプローチC: ダークゲーミング計器（選択）

**Design Movement**: ダークモードゲームダッシュボード / 精密計器美学
**Core Principles**:
1. 深い炭色背景に鮮やかなアクセントカラーで視認性確保
2. Canvas APIで描画する精密な針メーターが主役
3. カード型UIで情報を整理、ゲーム感を演出
4. アニメーションは機能的（スコア変化を直感的に伝える）

**Color Philosophy**:
- 背景: oklch(0.12 0.02 260) - 深い青黒
- カード: oklch(0.18 0.02 260) - やや明るい青黒
- アクセント緑: oklch(0.75 0.25 145) - 達成・良好
- アクセント赤: oklch(0.65 0.25 25) - 警告・遅延
- アクセント金: oklch(0.80 0.18 85) - チート・特別
- テキスト主: oklch(0.92 0.01 260) - 明るい白
- テキスト副: oklch(0.60 0.02 260) - グレー

**Layout Paradigm**:
- 390px幅固定、縦1カラム
- 上部: スコアメーター（画面の40%）
- 中部: 24h円グラフ + ステータス指標
- 下部: 難易度スライダー + アクション

**Signature Elements**:
- 半円針メーター（Canvas描画、リアルタイム更新）
- 24時間円グラフ（理想青 vs 現実赤）
- スコアに連動した背景グロー効果

**Interaction Philosophy**:
- スコア変化時に針がアニメーション
- 難易度変更時に即座にスコア再計算
- チートボタンはゴールド発光エフェクト

**Animation**:
- 針: requestAnimationFrame で滑らか回転
- スコア数値: カウントアップ（0.5秒）
- 警告: pulse アニメーション（赤点滅）
- カード入場: fade-in + slide-up

**Typography System**:
- 数値・スコア: "Orbitron" (Google Fonts) - SF的
- 日本語ラベル: "Noto Sans JP" - 可読性
- 階層: スコア数値80px > セクション見出し14px > ラベル11px

</idea>
</response>

---

## 選択: アプローチC（ダークゲーミング計器）

理由: ゲームアプリとして最も直感的で視覚的インパクトが高く、
針メーターのリアルタイム動作が映える。スマホ縦画面に最適化。
