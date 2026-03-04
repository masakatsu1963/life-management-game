/**
 * useScoreEngine.ts
 * ポイント表準拠スコアエンジン v3
 *
 * ポイント構造（100点満点）:
 *
 * 【移動系 計30pt】
 * 起床アラーム消す          → 時間+5pt
 * 家を出る                  → 位置+5pt
 * 最寄駅到着                → 位置+5pt
 * 勤務先最寄駅到着          → 位置+5pt
 * 勤務先到着                → 時間+5pt / 位置+5pt = 10pt
 * 退勤                      → 時間+5pt
 *
 * 【タスク系 計70pt（ハードのみ）】
 * 出勤前タスク              → タスク+10pt
 * 通勤中タスク              → タスク+10pt
 * 昼休みタスク              → タスク+10pt
 * 帰宅中タスク              → タスク+10pt
 * 就寝前デトックス          → タスク+10pt
 *
 * モード別満点:
 * ハード（全5タスク）= 100pt
 * ハーフ（通勤中+帰宅中）  = 50pt
 * イージー（移動のみ）      = 30pt
 *
 * 時間精度ボーナス: ちょうど+5pt、±1分=+4pt...±5分以上=0pt（別枠）
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ===================== 型定義 =====================

export type PointType = "time" | "location" | "task" | "relax";
export type DayMode = "normal" | "holiday" | "business_trip" | "sick";
export type UserType = "worker" | "student";

// ユーザータイプ別ラベルマップ
export const USER_TYPE_LABELS: Record<UserType, {
  goToWork: string;      // 出勤 / 登校
  leaveWork: string;     // 退勤 / 下校
  workplace: string;     // 勤務先 / 学校
  workStation: string;   // 勤務先最寄駅 / 学校最寄駅
  commute: string;       // 通勤 / 通学
  commuteTask: string;   // 通勤中タスク / 通学中タスク
  returnTask: string;    // 帰宅中タスク / 帰宅中タスク
  morningTask: string;   // 出勤前タスク / 登校前タスク
  lunchTask: string;     // お昼休みタスク / 昼休みタスク
  startTimeLabel: string; // 出社時間 / 登校時間
  endTimeLabel: string;   // 退社時間 / 下校時間
  lunchLabel: string;     // 昼休憩 / 昼休み
}> = {
  worker: {
    goToWork: "出勤",
    leaveWork: "退勤",
    workplace: "勤務先",
    workStation: "勤務先最寄駅",
    commute: "通勤",
    commuteTask: "通勤中タスク",
    returnTask: "帰宅中タスク",
    morningTask: "出勤前タスク",
    lunchTask: "お昼休みタスク",
    startTimeLabel: "出社時間",
    endTimeLabel: "退社時間",
    lunchLabel: "昼休憩",
  },
  student: {
    goToWork: "登校",
    leaveWork: "下校",
    workplace: "学校",
    workStation: "学校最寄駅",
    commute: "通学",
    commuteTask: "通学中タスク",
    returnTask: "帰宅中タスク",
    morningTask: "登校前タスク",
    lunchTask: "昼休みタスク",
    startTimeLabel: "登校時間",
    endTimeLabel: "下校時間",
    lunchLabel: "昼休み",
  },
};
export type TaskMode = "easy" | "half" | "hard";

// タスクモード別に表示するイベントIDセット
export const TASK_MODE_EVENTS: Record<TaskMode, string[]> = {
  easy:  [],  // 移動ログのみ（タスクイベントなし）
  half:  ["commute_task", "return_commute"],  // 通勤中・帰宅中のみ
  hard:  ["morning_task", "commute_task", "lunch_task", "return_commute", "bedtime_detox"],  // 全タスク
};

// モード別の満点ポイント
export const TASK_MODE_MAX: Record<TaskMode, number> = {
  easy: 30,
  half: 50,
  hard: 100,
};

// 休日モードの満点（午前30pt + 午後30pt + 夜間30pt = 90pt）
export const HOLIDAY_MAX = 90;

// タスクコンテンツ別ポイント定義
export interface TaskContent {
  id: string;
  label: string;
  emoji: string;
  taskPt: number;    // タスクポイント（コンテンツ別に8〜15pt）
  relaxPt: number;   // リラックスポイント
}

export const TASK_CONTENTS: TaskContent[] = [
  { id: "study",    label: "勉強",       emoji: "📖", taskPt: 15, relaxPt: 0 },  // 最高難度
  { id: "notebook", label: "NotebookLM", emoji: "🤖", taskPt: 15, relaxPt: 0 },  // 能動的学習
  { id: "reading",  label: "読書",       emoji: "📚", taskPt: 12, relaxPt: 0 },  // 良質インプット
  { id: "podcast",  label: "ポッドキャスト", emoji: "🎙️", taskPt: 12, relaxPt: 0 },  // 耳学習
  { id: "stretch",  label: "ストレッチ",   emoji: "🧘", taskPt: 12, relaxPt: 0 },  // 身体ケア
  { id: "music",    label: "音楽",       emoji: "🎵", taskPt: 10, relaxPt: 0 },  // リラックス
  { id: "walk",     label: "散歩",       emoji: "🚶", taskPt: 10, relaxPt: 0 },  // 軽い運動
  { id: "chat",     label: "おしゃべり",   emoji: "💬", taskPt: 10, relaxPt: 0 },  // コミュニケーション
  { id: "detox",    label: "デトックス",   emoji: "🌿", taskPt: 10, relaxPt: 0 },  // 就寝前標準
  { id: "nap",      label: "仮眠",       emoji: "😴", taskPt:  8, relaxPt: 0 },  // 休息（やや低め）
];

export interface DailyEvent {
  id: string;
  label: string;
  emoji: string;
  scheduledTime: string;       // "HH:MM"
  timePoint: number;           // 時間ポイント (0 or 5)
  locationPoint: number;       // 位置ポイント (0 or 5)
  taskPoint: number;           // タスクポイント (0 or 10)
  relaxPoint: number;          // リラックスポイント (常に0)
  requiresLocation: boolean;
  requiresTask: boolean;
  isAuto: boolean;             // true=自動取得（非表示）, false=タスク選択型
  isLocation?: boolean;        // true=移動ログタブに表示する位置イベント
  locationLabel?: string;
  taskLabel?: string;
  selectedContent?: string;    // 選択中のタスクコンテンツID
  // 達成状態
  timeAchieved: boolean;
  locationAchieved: boolean;
  taskAchieved: boolean;
  relaxAchieved: boolean;
  achievedAt?: string;
  timeBonus?: number;           // 時間精度ボーナス（0ー5）
  holidaySlot?: "morning" | "afternoon" | "evening";  // 休日モード時間帯別
}

export interface UserProfile {
  name: string;
  userType: UserType;          // worker=会社員 / student=学生
  wakeTime: string;            // 起床時間 "HH:MM"
  homeStation: string;         // 自宅最寄駅
  workStation: string;         // 勤務先最寄駅 / 学校最寄駅
  workAddress: string;         // 勤務先住所 / 学校住所
  startTime: string;           // 出社/登校時間 "HH:MM"
  lunchTime: string;           // 昼休憩開始 "HH:MM"
  lunchDuration: number;       // 昼休憩時間（分）
  endTime: string;             // 退社/下校時間 "HH:MM"
  bedTime: string;             // 就寝時間 "HH:MM"
  offDays: number[];           // 0=日,1=月,...,6=土
  learningContent: string;
  mode: DayMode;
}

export interface WeeklyLog {
  date: string;                // "YYYY-MM-DD"
  score: number;
  earnedPoints: number;
  eventAchievements: Record<string, { time: boolean; location: boolean; task: boolean }>;
}

// 旧型との互換性のために残す（ScheduleList等で使用）
export type Difficulty = "easy" | "normal" | "hard";
export type ScheduleCategory =
  | "wakeup" | "pre_work" | "commute_learn"
  | "break" | "return_learn" | "pre_sleep" | "other";

export interface ScheduleItem {
  id: string;
  time: string;
  location: string;
  activity: string;
  completed: boolean;
  category?: ScheduleCategory;
}

// ===================== デフォルト値 =====================

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  userType: "worker",
  wakeTime: "06:30",
  homeStation: "",
  workStation: "",
  workAddress: "",
  startTime: "09:00",
  lunchTime: "12:00",
  lunchDuration: 60,
  endTime: "18:00",
  bedTime: "22:30",
  offDays: [0, 6],
  learningContent: "英語学習",
  mode: "normal",
};

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function buildDefaultEvents(profile: UserProfile): DailyEvent[] {
  const BASE = {
    timeAchieved: false,
    locationAchieved: false,
    taskAchieved: false,
    relaxAchieved: false,
    relaxPoint: 0,
  };

  // ユーザータイプ別ラベル
  const lbl = USER_TYPE_LABELS[profile.userType || "worker"];

  // プロフィール時刻から各イベント時刻を計算
  const startTime  = profile.startTime  || "09:00";
  const lunchTime  = profile.lunchTime  || "12:00";
  const endTime    = profile.endTime    || "18:00";

  // 家を出る時間 = 出社/登校時間 - 60分
  const leaveHomeTime   = addMinutes(startTime, -60);
  // 自宅最寄駅 = 出社/登校時間 - 45分
  const homeStationTime = addMinutes(startTime, -45);
  // 勤務先/学校最寄駅 = 出社/登校時間 - 10分
  const workStationTime = addMinutes(startTime, -10);
  // 勤務先/学校到着 = 出社/登校時間 - 5分
  const arriveWorkTime  = addMinutes(startTime, -5);
  // 帰宅中タスク = 退社/下校時間 + 10分
  const returnCommuteTime = addMinutes(endTime, 10);

  // 自動取得イベント（非表示） - 移動系 記30pt
  const autoEvents: DailyEvent[] = [
    { ...BASE, id: "wake", label: "起床", emoji: "🌅",
      scheduledTime: profile.wakeTime, timePoint: 5, locationPoint: 0, taskPoint: 0,
      requiresLocation: false, requiresTask: false, isAuto: true, isLocation: false },
    { ...BASE, id: "leave_home", label: "家を出る", emoji: "🚶",
      scheduledTime: leaveHomeTime, timePoint: 0, locationPoint: 5, taskPoint: 0,
      requiresLocation: true, requiresTask: false, isAuto: true, isLocation: true, locationLabel: "自宅周辺" },
    { ...BASE, id: "home_station", label: "最寄駅到着", emoji: "🙌",
      scheduledTime: homeStationTime, timePoint: 0, locationPoint: 5, taskPoint: 0,
      requiresLocation: true, requiresTask: false, isAuto: true, isLocation: true, locationLabel: profile.homeStation || "最寄駅" },
    { ...BASE, id: "work_station", label: `${lbl.workStation}到着`, emoji: "🏙️",
      scheduledTime: workStationTime, timePoint: 0, locationPoint: 5, taskPoint: 0,
      requiresLocation: true, requiresTask: false, isAuto: true, isLocation: true, locationLabel: profile.workStation || lbl.workStation },
    { ...BASE, id: "arrive_work", label: `${lbl.workplace}到着`, emoji: profile.userType === "student" ? "🏫" : "🏢",
      scheduledTime: arriveWorkTime, timePoint: 5, locationPoint: 5, taskPoint: 0,
      requiresLocation: true, requiresTask: false, isAuto: true, isLocation: true, locationLabel: profile.workAddress || lbl.workplace },
    { ...BASE, id: "leave_work", label: lbl.leaveWork, emoji: "👋",
      scheduledTime: endTime, timePoint: 5, locationPoint: 0, taskPoint: 0,
      requiresLocation: false, requiresTask: false, isAuto: true, isLocation: true },
  ];

  // タスク選択型イベント（表示） - タスク系 各10pt
  const defaultContent = "notebook";
  const taskEvents: DailyEvent[] = [
    { ...BASE, id: "morning_task", label: lbl.morningTask, emoji: "🌸",
      scheduledTime: addMinutes(profile.wakeTime, 15),
      timePoint: 0, locationPoint: 0, taskPoint: 10, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: defaultContent, taskLabel: "NotebookLM" },
    { ...BASE, id: "commute_task", label: lbl.commuteTask, emoji: "🙌",
      scheduledTime: addMinutes(leaveHomeTime, 15),
      timePoint: 0, locationPoint: 0, taskPoint: 10, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: defaultContent, locationLabel: "電車内", taskLabel: "NotebookLM" },
    { ...BASE, id: "lunch_task", label: lbl.lunchTask, emoji: "☕",
      scheduledTime: lunchTime,
      timePoint: 0, locationPoint: 0, taskPoint: 10, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "walk", taskLabel: "散歩" },
    { ...BASE, id: "return_commute", label: lbl.returnTask, emoji: "🎧",
      scheduledTime: returnCommuteTime,
      timePoint: 0, locationPoint: 0, taskPoint: 10, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: defaultContent, locationLabel: "電車内", taskLabel: "NotebookLM" },
    { ...BASE, id: "bedtime_detox", label: "就寝前デトックス", emoji: "🌙",
      scheduledTime: profile.bedTime,
      timePoint: 0, locationPoint: 0, taskPoint: 10, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "detox", taskLabel: "デトックス" },
  ];

  return [...autoEvents, ...taskEvents].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

/**
 * 休日モード用イベント生成
 * 午前・午後・夜間の3時間帯別、各帯3タスクスロット
 * ポイント3倍（各タスク30pt）、満点=90pt
 */
export function buildHolidayEvents(profile: UserProfile): DailyEvent[] {
  const BASE = {
    timeAchieved: false,
    locationAchieved: false,
    taskAchieved: false,
    relaxAchieved: false,
    relaxPoint: 0,
  };
  // 午前スロット（起床+30分、+90分、+150分）
  const morningSlot1 = addMinutes(profile.wakeTime, 30);
  const morningSlot2 = addMinutes(profile.wakeTime, 90);
  const morningSlot3 = addMinutes(profile.wakeTime, 150);
  return [
    // ☀️ 午前ブロック
    { ...BASE, id: "holiday_am1", label: "午前タスク 1", emoji: "☀️",
      scheduledTime: morningSlot1,
      timePoint: 0, locationPoint: 0, taskPoint: 30, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "study", taskLabel: "勉強",
      holidaySlot: "morning" as const },
    { ...BASE, id: "holiday_am2", label: "午前タスク 2", emoji: "☀️",
      scheduledTime: morningSlot2,
      timePoint: 0, locationPoint: 0, taskPoint: 30, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "reading", taskLabel: "読書",
      holidaySlot: "morning" as const },
    { ...BASE, id: "holiday_am3", label: "午前タスク 3", emoji: "☀️",
      scheduledTime: morningSlot3,
      timePoint: 0, locationPoint: 0, taskPoint: 30, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "stretch", taskLabel: "ストレッチ",
      holidaySlot: "morning" as const },
    // 🌞 午後ブロック
    { ...BASE, id: "holiday_pm1", label: "午後タスク 1", emoji: "🌞",
      scheduledTime: "13:00",
      timePoint: 0, locationPoint: 0, taskPoint: 30, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "walk", taskLabel: "散歩",
      holidaySlot: "afternoon" as const },
    { ...BASE, id: "holiday_pm2", label: "午後タスク 2", emoji: "🌞",
      scheduledTime: "14:30",
      timePoint: 0, locationPoint: 0, taskPoint: 30, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "podcast", taskLabel: "ポッドキャスト",
      holidaySlot: "afternoon" as const },
    { ...BASE, id: "holiday_pm3", label: "午後タスク 3", emoji: "🌞",
      scheduledTime: "16:00",
      timePoint: 0, locationPoint: 0, taskPoint: 30, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "music", taskLabel: "音楽",
      holidaySlot: "afternoon" as const },
    // 🌙 夜間ブロック
    { ...BASE, id: "holiday_eve1", label: "夜間タスク 1", emoji: "🌙",
      scheduledTime: "19:00",
      timePoint: 0, locationPoint: 0, taskPoint: 30, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "study", taskLabel: "勉強",
      holidaySlot: "evening" as const },
    { ...BASE, id: "holiday_eve2", label: "夜間タスク 2", emoji: "🌙",
      scheduledTime: "20:30",
      timePoint: 0, locationPoint: 0, taskPoint: 30, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "reading", taskLabel: "読書",
      holidaySlot: "evening" as const },
    { ...BASE, id: "holiday_eve3", label: "就寝前デトックス", emoji: "🌙",
      scheduledTime: profile.bedTime,
      timePoint: 0, locationPoint: 0, taskPoint: 30, relaxPoint: 0,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "detox", taskLabel: "デトックス",
      holidaySlot: "evening" as const },
  ];
}

// ===================== 旧互換: ScoreBreakdown型 =====================
export interface ScoreBreakdown {
  timeScore: number;
  spaceScore: number;
  activityScore: number;
  emotionScore: number;
  total: number;
}

// 旧互換: loadWeeklyLog / calcWeeklyStats (DailyProgressBar, WeeklyDonut用)
export interface DayLog {
  date: string;
  categoryStats: Record<string, { total: number; completed: number }>;
}

export function loadWeeklyLog(): DayLog[] {
  try {
    const raw = localStorage.getItem("lgm_weekly_logs_v2");
    if (!raw) return [];
    const logs: WeeklyLog[] = JSON.parse(raw);
    return logs.map(log => {
      const catMap: Record<string, string> = {
        wake: "wakeup",
        morning_task: "pre_work",
        commute_task: "commute_learn",
        lunch_task: "break",
        return_commute: "return_learn",
        bedtime_detox: "pre_sleep",
      };
      const stats: Record<string, { total: number; completed: number }> = {};
      for (const [newId, catId] of Object.entries(catMap)) {
        const a = log.eventAchievements[newId];
        stats[catId] = { total: 1, completed: a && (a.time || a.location || a.task) ? 1 : 0 };
      }
      return { date: log.date, categoryStats: stats };
    });
  } catch { return []; }
}

export function calcWeeklyStats(logs: DayLog[]): Record<string, { totalItems: number; completedItems: number; rate: number }> {
  const CATS: ScheduleCategory[] = ["wakeup","pre_work","commute_learn","break","return_learn","pre_sleep"];
  const result: Record<string, { totalItems: number; completedItems: number; rate: number }> = {};
  for (const cat of CATS) {
    let total = 0, completed = 0;
    for (const log of logs) {
      const s = log.categoryStats[cat];
      if (s) { total += s.total; completed += s.completed; }
    }
    result[cat] = { totalItems: total, completedItems: completed, rate: total > 0 ? completed / total : 0 };
  }
  return result;
}

// ===================== スコア計算 =====================

/**
 * 時間精度ボーナス計算
 * ちょうど(0分差) → +5pt
 * 早め(1〜5分前)  → +(5-diff)pt  例: 1分前=+4, 5分前=+0
 * 遅れ(1分〜)     → max(0, 5-diff)pt  例: 1分後=+4, 5分後=+0, 6分後以降=0
 * ※ 最大+5、最小0
 */
export function calcTimeBonus(scheduledTime: string, achievedAt: string | undefined, currentTime: Date): number {
  if (!achievedAt) return 0;
  const [sh, sm] = scheduledTime.split(":").map(Number);
  const [ah, am] = achievedAt.split(":").map(Number);
  const scheduledMins = sh * 60 + sm;
  const achievedMins = ah * 60 + am;
  const diff = achievedMins - scheduledMins; // 負=早め、正=遅れ
  if (diff === 0) return 5;
  if (diff < 0) {
    return Math.max(0, 5 + diff);
  } else {
    return Math.max(0, 5 - diff);
  }
}

/**
 * 早起きポイント計算（段階別）
 * 1時間以上早い  → +30pt
 * 45〜59分早い  → +25pt（1時間早起き）
 * 30〜44分早い  → +20pt（30分早起き）
 * 15〜29分早い  → +15pt
 * 1〜14分早い   → +10pt
 * ちょうど(0分)   → +5pt
 * 1〜4分遅れ    → +1〜4pt
 * 5分以上遅れ  → 0pt
 */
export function calcEarlyRiseBonus(wakeTime: string, actualTime: string): number {
  const [wh, wm] = wakeTime.split(":").map(Number);
  const [ah, am] = actualTime.split(":").map(Number);
  const idealMins = wh * 60 + wm;
  const actualMins = ah * 60 + am;
  const diff = idealMins - actualMins; // 正=早い、負=遅れ
  if (diff >= 60) return 30;  // 1時間以上早い
  if (diff >= 45) return 25;  // 45分以上（1時間早起き山）
  if (diff >= 30) return 20;  // 30分以上
  if (diff >= 15) return 15;  // 15分以上
  if (diff >= 1)  return 10;  // 1分以上
  if (diff === 0) return 5;   // ちょうど
  return Math.max(0, 5 + diff); // 遅れ：0〜4pt
}

/**
 * 早起きポイントの段階説明を返す
 */
export function getEarlyRiseLabel(diff: number): { emoji: string; label: string; color: string } {
  if (diff >= 60) return { emoji: "🌟", label: `${diff}分早起き！超早起き`, color: "#f59e0b" };
  if (diff >= 45) return { emoji: "⭐", label: `${diff}分早起き！1時間早起き！`, color: "#f59e0b" };
  if (diff >= 30) return { emoji: "☀️", label: `${diff}分早起き！30分早起き！`, color: "#f59e0b" };
  if (diff >= 15) return { emoji: "🌤️", label: `${diff}分早起き！`, color: "#fbbf24" };
  if (diff >= 1)  return { emoji: "👍", label: `${diff}分早起き`, color: "#fbbf24" };
  if (diff === 0) return { emoji: "⏰", label: "ちょうど！", color: "#34d399" };
  return { emoji: "🌙", label: `${Math.abs(diff)}分遅れ。明日は早起きしよう！`, color: "#94a3b8" };
}

/**
 * スコア計算（モード別満点に対する獲得ポイント比率）
 * earnedPoints: 実際に獲得したポイント（時間精度ボーナス含む）
 * totalPoints: モード別満点（easy=30, half=50, hard=100）
 * score: earnedPoints/totalPoints × 100（0〜100）
 */
function calcScore(events: DailyEvent[], taskMode: TaskMode = "hard", dayMode: DayMode = "normal"): {
  score: number;
  earned: number;
  total: number;
  bonusTotal: number;
} {
  // 休日モードは満点HOLIDAY_MAX、それ以外はタスクモード満点
  const modeMax = dayMode === "holiday" ? HOLIDAY_MAX : TASK_MODE_MAX[taskMode];

  // 達成ポイント合計（時間+位置+タスク）
  const baseEarned = events.reduce(
    (s, e) =>
      s +
      (e.timeAchieved ? e.timePoint : 0) +
      (e.locationAchieved ? e.locationPoint : 0) +
      (e.taskAchieved ? e.taskPoint : 0),
    0
  );

  // 時間精度ボーナス合計
  const bonusTotal = events.reduce(
    (s, e) => s + (e.timeBonus ?? 0),
    0
  );

  const earned = baseEarned + bonusTotal;

  // スコア = 獲得pt / 満点pt × 100（100pt超えも許容）
  const score = modeMax > 0 ? Math.round((earned / modeMax) * 100) : 0;

  return { score, earned, total: modeMax, bonusTotal };
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// ===================== メインhook =====================

export function useScoreEngine() {
  const [profile, setProfileState] = useState<UserProfile>(() => {
    try {
      const s = localStorage.getItem("lgm_profile_v2");
      return s ? { ...DEFAULT_PROFILE, ...JSON.parse(s) } : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
  });

  const [events, setEvents] = useState<DailyEvent[]>(() => {
    try {
      const todayKey = getTodayKey();
      const s = localStorage.getItem(`lgm_events_${todayKey}`);
      const prof = (() => {
        try {
          const ps = localStorage.getItem("lgm_profile_v2");
          return ps ? { ...DEFAULT_PROFILE, ...JSON.parse(ps) } : DEFAULT_PROFILE;
        } catch { return DEFAULT_PROFILE; }
      })();
      if (s) {
        const cached: DailyEvent[] = JSON.parse(s);
        // isLocationフラグが欠けている古いキャッシュは再生成して達成状態を引き継ぐ
        const hasOldFormat = cached.some(e => e.isLocation === undefined);
        if (hasOldFormat) {
          const fresh = buildDefaultEvents(prof);
          return fresh.map(newEv => {
            const old = cached.find(o => o.id === newEv.id);
            if (!old) return newEv;
            return {
              ...newEv,
              timeAchieved: old.timeAchieved,
              locationAchieved: old.locationAchieved,
              taskAchieved: old.taskAchieved,
              relaxAchieved: old.relaxAchieved,
              achievedAt: old.achievedAt,
              timeBonus: old.timeBonus,
              selectedContent: old.selectedContent ?? newEv.selectedContent,
            };
          });
        }
        return cached;
      }
      return buildDefaultEvents(prof);
    } catch { return buildDefaultEvents(DEFAULT_PROFILE); }
  });

  const [weeklyLogs, setWeeklyLogs] = useState<WeeklyLog[]>(() => {
    try {
      const s = localStorage.getItem("lgm_weekly_logs_v2");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [dayMode, setDayModeState] = useState<DayMode>(() => {
    return (localStorage.getItem("lgm_day_mode") as DayMode) || "normal";
  });

  // 旧互換: difficulty (理想設定タブ等で使用)
  const [difficulty] = useState<Difficulty>("normal");

  // タスクモード（イージー/ハーフ/ハード）
  const [taskMode, setTaskModeState] = useState<TaskMode>(() => {
    return (localStorage.getItem("lgm_task_mode") as TaskMode) || "hard";
  });

  const setTaskMode = useCallback((mode: TaskMode) => {
    setTaskModeState(mode);
    localStorage.setItem("lgm_task_mode", mode);
  }, []);

  // 起動時：過去7日分のイベントデータをスキャンして週間ログに保存
  useEffect(() => {
    const todayKey = getTodayKey();
    const savedTaskMode = (localStorage.getItem("lgm_task_mode") as TaskMode) || "hard";
    const savedDayMode = (localStorage.getItem("lgm_day_mode") as DayMode) || "normal";
    const newLogs: WeeklyLog[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const raw = localStorage.getItem(`lgm_events_${dateKey}`);
      if (!raw) continue;
      try {
        const pastEvents: DailyEvent[] = JSON.parse(raw);
        const { score: s, earned: e } = calcScore(pastEvents, savedTaskMode, savedDayMode);
        const achievements: Record<string, { time: boolean; location: boolean; task: boolean }> = {};
        pastEvents.forEach(ev => {
          achievements[ev.id] = { time: ev.timeAchieved, location: ev.locationAchieved, task: ev.taskAchieved };
        });
        newLogs.push({ date: dateKey, score: s, earnedPoints: e, eventAchievements: achievements });
      } catch {}
    }
    if (newLogs.length > 0) {
      setWeeklyLogs(prev => {
        // 今日のログは保持し、過去分は新しいデータで上書き
        const todayLog = prev.find(l => l.date === todayKey);
        const merged = [
          ...newLogs,
          ...(todayLog ? [todayLog] : []),
        ].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
        localStorage.setItem("lgm_weekly_logs_v2", JSON.stringify(merged));
        return merged;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1分毎に時刻更新 + 日付切り替わり検出
  const lastDateRef = useRef(getTodayKey());
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const newDateKey = now.toISOString().slice(0, 10);
      const prevDateKey = lastDateRef.current;
      if (newDateKey !== prevDateKey) {
        // 日付が変わった → 前日のイベントデータからログを保存してイベントをリセット
        const prevEventsRaw = localStorage.getItem(`lgm_events_${prevDateKey}`);
        if (prevEventsRaw) {
          try {
            const prevEvents: DailyEvent[] = JSON.parse(prevEventsRaw);
            const prevMode = (localStorage.getItem("lgm_day_mode") as DayMode) || "normal";
            const prevTaskMode = (localStorage.getItem("lgm_task_mode") as TaskMode) || "hard";
            const { score: prevScore, earned: prevEarned } = calcScore(prevEvents, prevTaskMode, prevMode);
            const achievements: Record<string, { time: boolean; location: boolean; task: boolean }> = {};
            prevEvents.forEach(e => {
              achievements[e.id] = { time: e.timeAchieved, location: e.locationAchieved, task: e.taskAchieved };
            });
            setWeeklyLogs(prev => {
              const filtered = prev.filter(l => l.date !== prevDateKey);
              const updated = [...filtered, { date: prevDateKey, score: prevScore, earnedPoints: prevEarned, eventAchievements: achievements }]
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(-7);
              localStorage.setItem("lgm_weekly_logs_v2", JSON.stringify(updated));
              return updated;
            });
          } catch {}
        }
        // 新しい日のイベントを生成
        lastDateRef.current = newDateKey;
        const currentProfile = (() => {
          try {
            const ps = localStorage.getItem("lgm_profile_v2");
            return ps ? { ...DEFAULT_PROFILE, ...JSON.parse(ps) } : DEFAULT_PROFILE;
          } catch { return DEFAULT_PROFILE; }
        })();
        const currentDayMode = (localStorage.getItem("lgm_day_mode") as DayMode) || "normal";
        const newEvents = currentDayMode === "holiday" ? buildHolidayEvents(currentProfile) : buildDefaultEvents(currentProfile);
        setEvents(newEvents);
        localStorage.setItem(`lgm_events_${newDateKey}`, JSON.stringify(newEvents));
      }
      setCurrentTime(now);
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // イベント変更時にLocalStorageへ保存＆週間ログ更新
  useEffect(() => {
    const todayKey = getTodayKey();
    localStorage.setItem(`lgm_events_${todayKey}`, JSON.stringify(events));
    const { score, earned } = calcScore(events, taskMode);
    setWeeklyLogs(prev => {
      const filtered = prev.filter(l => l.date !== todayKey);
      const achievements: Record<string, { time: boolean; location: boolean; task: boolean }> = {};
      events.forEach(e => {
        achievements[e.id] = { time: e.timeAchieved, location: e.locationAchieved, task: e.taskAchieved };
      });
      const updated = [...filtered, { date: todayKey, score, earnedPoints: earned, eventAchievements: achievements }]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-7);
      localStorage.setItem("lgm_weekly_logs_v2", JSON.stringify(updated));
      return updated;
    });
  }, [events, taskMode]);

  // プロフィール保存（起床時間などスケジュールに関わる項目変更時はイベントを再生成）
  const saveProfile = useCallback((p: Partial<UserProfile>) => {
    setProfileState(prev => {
      const next = { ...prev, ...p };
      localStorage.setItem("lgm_profile_v2", JSON.stringify(next));

      const scheduleKeys: (keyof UserProfile)[] = [
        "wakeTime", "bedTime", "homeStation", "workStation", "learningContent",
        "startTime", "lunchTime", "lunchDuration", "endTime"
      ];
      const hasScheduleChange = scheduleKeys.some(k => k in p && p[k] !== prev[k]);
      if (hasScheduleChange) {
        const todayKey = new Date().toISOString().slice(0, 10);
        const currentDayMode = (localStorage.getItem("lgm_day_mode") as DayMode) || "normal";
        setEvents(prevEvents => {
          const newEvents = currentDayMode === "holiday" ? buildHolidayEvents(next) : buildDefaultEvents(next);
          const merged = newEvents.map(newEv => {
            const old = prevEvents.find(o => o.id === newEv.id);
            if (!old) return newEv;
            return {
              ...newEv,
              timeAchieved: old.timeAchieved,
              locationAchieved: old.locationAchieved,
              taskAchieved: old.taskAchieved,
              achievedAt: old.achievedAt,
              timeBonus: old.timeBonus,
            };
          });
          localStorage.setItem(`lgm_events_${todayKey}`, JSON.stringify(merged));
          return merged;
        });
      }

      return next;
    });
  }, []);

  // イベント達成トグル（時間精度ボーナス自動計算付き）
  const toggleEventPoint = useCallback((eventId: string, pointType: PointType) => {
    const now = new Date();
    const nowHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setEvents(prev =>
      prev.map(e => {
        if (e.id !== eventId) return e;
        const key = pointType === "time" ? "timeAchieved"
          : pointType === "location" ? "locationAchieved"
          : pointType === "relax" ? "relaxAchieved"
          : "taskAchieved";
        const newVal = !e[key as keyof DailyEvent] as boolean;
        const newAchievedAt = newVal ? nowHHMM : e.achievedAt;
        let newTimeBonus = e.timeBonus ?? 0;
        if (pointType === "time") {
          if (newVal) {
            newTimeBonus = calcTimeBonus(e.scheduledTime, nowHHMM, now);
          } else {
            newTimeBonus = 0;
          }
        }
        return {
          ...e,
          [key]: newVal,
          achievedAt: newAchievedAt,
          timeBonus: newTimeBonus,
        };
      })
    );
  }, []);

  // タスクコンテンツ変更（コンテンツ別ポイントを反映）
  const updateEventContent = useCallback((eventId: string, contentId: string) => {
    const c = TASK_CONTENTS.find(t => t.id === contentId);
    if (!c) return;
    setEvents(prev =>
      prev.map(e => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          selectedContent: contentId,
          taskPoint: c.taskPt,  // コンテンツ別ポイント（8〜15pt）
          relaxPoint: 0,
          taskLabel: c.label,
        };
      })
    );
  }, []);

  // デイモード変更（休日モード切替時はイベントを再生成）
  const setDayMode = useCallback((mode: DayMode) => {
    setDayModeState(mode);
    localStorage.setItem("lgm_day_mode", mode);
    setProfileState(currentProfile => {
      const todayKey = getTodayKey();
      setEvents(() => {
        const newEvents = mode === "holiday" ? buildHolidayEvents(currentProfile) : buildDefaultEvents(currentProfile);
        localStorage.setItem(`lgm_events_${todayKey}`, JSON.stringify(newEvents));
        return newEvents;
      });
      return currentProfile;
    });
  }, []);

  // スコア計算（taskMode・ dayMode依存）
  const { score: rawScore, earned, total, bonusTotal } = calcScore(events, taskMode, dayMode);

  // 休日モードは当日ポイントをそのまま使用、出張・病欠は前日スコア引き継ぎ
  const effectiveScore = (() => {
    if (dayMode === "normal" || dayMode === "holiday") return rawScore;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    const yLog = weeklyLogs.find(l => l.date === yKey);
    return yLog ? yLog.score : rawScore;
  })();

  // 現在時刻に最も近い次のイベント
  const nowStr = `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}`;
  const nextEvent = events.find(e =>
    e.scheduledTime > nowStr &&
    !e.timeAchieved && !e.taskAchieved && !e.locationAchieved
  ) || null;

  // 週間カテゴリ集計（帯グラフ用）
  const weeklyCategories = [
    { id: "wake", label: "起床", emoji: "🌅" },
    { id: "morning_task", label: "朝タスク", emoji: "🧘" },
    { id: "commute_task", label: "通勤学習", emoji: "📚" },
    { id: "lunch_task", label: "昼休み", emoji: "☕" },
    { id: "return_commute", label: "帰宅学習", emoji: "🎧" },
    { id: "bedtime_detox", label: "就寝前", emoji: "🌙" },
  ].map(cat => {
    const total = weeklyLogs.length;
    const achieved = weeklyLogs.filter(log => {
      const a = log.eventAchievements[cat.id];
      return a && (a.time || a.location || a.task);
    }).length;
    return { ...cat, achieved, total: Math.max(total, 1), rate: total > 0 ? Math.round((achieved / total) * 100) : 0 };
  });

  // 旧互換: gameState風オブジェクト（既存コンポーネント用）
  const gameState = {
    score: {
      timeScore: events.filter(e => e.timeAchieved).length / Math.max(1, events.filter(e => e.timePoint > 0).length) * 100,
      spaceScore: events.filter(e => e.locationAchieved).length / Math.max(1, events.filter(e => e.locationPoint > 0).length) * 100,
      activityScore: events.filter(e => e.taskAchieved).length / Math.max(1, events.filter(e => e.taskPoint > 0).length) * 100,
      emotionScore: 60,
      total: effectiveScore,
    },
    difficulty,
    cheatPoints: parseInt(localStorage.getItem("lgm_cheat_points") || "85"),
    streak: parseInt(localStorage.getItem("lgm_streak") || "0"),
    currentTime,
    timeDeviation: 0,
    spaceDeviation: 0,
    schedule: events.map(e => ({
      id: e.id,
      time: e.scheduledTime,
      location: e.locationLabel || "自宅",
      activity: e.label,
      completed: e.timeAchieved || e.taskAchieved || e.locationAchieved,
      category: "other" as ScheduleCategory,
    })),
    nextEvent: nextEvent ? {
      id: nextEvent.id,
      time: nextEvent.scheduledTime,
      location: nextEvent.locationLabel || "",
      activity: nextEvent.label,
      completed: false,
    } : null,
    minutesUntilNext: nextEvent ? (() => {
      const [nh, nm] = nextEvent.scheduledTime.split(":").map(Number);
      const now = currentTime;
      return (nh * 60 + nm) - (now.getHours() * 60 + now.getMinutes());
    })() : 0,
    emotionLevel: 3,
    isWarning: effectiveScore < 40,
    lastUpdated: currentTime,
  };

  return {
    // 新API
    profile,
    saveProfile,
    events,
    setEvents,
    toggleEventPoint,
    updateEventContent,
    score: effectiveScore,
    earnedPoints: earned,
    totalPoints: total,
    bonusTotal,
    calcTimeBonus,
    taskMode,
    setTaskMode,
    dayMode,
    setDayMode,
    currentTime,
    nextEvent,
    weeklyLogs,
    weeklyCategories,
    buildDefaultEvents: () => buildDefaultEvents(profile),
    // 旧互換API
    gameState,
    difficulty,
    changeDifficulty: () => {},
    toggleActivity: (id: string) => {
      const ev = events.find(e => e.id === id);
      if (!ev) return;
      if (ev.taskPoint > 0) toggleEventPoint(id, "task");
      else if (ev.timePoint > 0) toggleEventPoint(id, "time");
      else if (ev.locationPoint > 0) toggleEventPoint(id, "location");
    },
    changeEmotion: () => {},
    useCheat: (cost: number) => {
      const cp = parseInt(localStorage.getItem("lgm_cheat_points") || "85");
      if (cp < cost) return false;
      localStorage.setItem("lgm_cheat_points", String(cp - cost));
      return true;
    },
    forceUpdateScore: () => {},
    setSpaceDeviation: () => {},
    saveSchedule: (_items: ScheduleItem[]) => {
      setEvents(buildDefaultEvents(profile));
    },
  };
}
