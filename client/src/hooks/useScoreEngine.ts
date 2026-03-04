/**
 * useScoreEngine.ts
 * ポイント表準拠スコアエンジン v2
 *
 * ポイント構造（最大13pt/日）:
 * 起床アラーム消す          → 時間+1pt
 * 朝の瞑想/NotebookLM      → タスク+1pt
 * 家を出る                  → 位置+1pt
 * 最寄駅到着                → 位置+1pt
 * 通勤中NotebookLM         → タスク+1pt / 位置+1pt
 * 勤務先最寄駅到着          → 位置+1pt
 * 勤務先到着                → 時間+1pt / 位置+1pt
 * 昼休みタスク/勉強         → タスク+1pt
 * 退勤                      → 時間+1pt
 * 帰宅通勤NotebookLM       → タスク+1pt / 位置+1pt
 * 就寝前デトックス          → タスク+1pt
 * 合計最大: 13pt → score = (earned/13)*100
 *
 * 休日/出張/病欠モード: 前日スコアを引き継ぎ（ノーカウント）
 */

import { useState, useEffect, useCallback } from "react";

// ===================== 型定義 =====================

export type PointType = "time" | "location" | "task" | "relax";
export type DayMode = "normal" | "holiday" | "business_trip" | "sick";
export type TaskMode = "easy" | "half" | "hard";

// タスクモード別に表示するイベントIDセット
export const TASK_MODE_EVENTS: Record<TaskMode, string[]> = {
  easy:  [],  // 移動ログのみ（タスクイベントなし）
  half:  ["commute_task", "return_commute"],  // 通勤中・帰宅中のみ
  hard:  ["morning_task", "commute_task", "lunch_task", "return_commute", "bedtime_detox"],  // 全タスク
};

// タスクコンテンツ別ポイント定義
export interface TaskContent {
  id: string;
  label: string;
  emoji: string;
  taskPt: number;    // タスクポイント
  relaxPt: number;   // リラックスポイント
}

export const TASK_CONTENTS: TaskContent[] = [
  { id: "study",    label: "勉強",       emoji: "📖", taskPt: 5, relaxPt: 0 },
  { id: "reading",  label: "読書",       emoji: "📚", taskPt: 4, relaxPt: 1 },
  { id: "music",    label: "音楽",       emoji: "🎵", taskPt: 3, relaxPt: 3 },
  { id: "podcast",  label: "ポッドキャスト", emoji: "🎙️", taskPt: 3, relaxPt: 2 },
  { id: "chat",     label: "おしゃべり",   emoji: "💬", taskPt: 3, relaxPt: 3 },
  { id: "walk",     label: "散歩",       emoji: "🚶", taskPt: 3, relaxPt: 4 },
  { id: "stretch",  label: "ストレッチ",   emoji: "🧘", taskPt: 4, relaxPt: 4 },
  { id: "nap",      label: "仮眠",       emoji: "😴", taskPt: 2, relaxPt: 5 },
  { id: "detox",    label: "デトックス",   emoji: "🌿", taskPt: 3, relaxPt: 5 },
  { id: "notebook", label: "NotebookLM", emoji: "🤖", taskPt: 5, relaxPt: 0 },
];

export interface DailyEvent {
  id: string;
  label: string;
  emoji: string;
  scheduledTime: string;       // "HH:MM"
  timePoint: number;           // 時間ポイント (0 or 1)
  locationPoint: number;       // 位置ポイント (0 or 1)
  taskPoint: number;           // タスクポイント (コンテンツ別変動)
  relaxPoint: number;          // リラックスポイント (コンテンツ別変動)
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
  relaxAchieved: boolean;      // リラックス達成
  achievedAt?: string;
  timeBonus?: number;           // 時間精度ボーナス（0〜5）
}

export interface UserProfile {
  name: string;
  wakeTime: string;
  alarmEnabled: boolean;
  homeStation: string;
  workStation: string;
  workAddress: string;
  bedTime: string;
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
  wakeTime: "06:30",
  alarmEnabled: true,
  homeStation: "",
  workStation: "",
  workAddress: "",
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

// タスクコンテンツIDからポイントを取得
function getContentPts(contentId: string | undefined): { taskPt: number; relaxPt: number } {
  if (!contentId) return { taskPt: 3, relaxPt: 2 };
  const c = TASK_CONTENTS.find(t => t.id === contentId);
  return c ? { taskPt: c.taskPt, relaxPt: c.relaxPt } : { taskPt: 3, relaxPt: 2 };
}

export function buildDefaultEvents(profile: UserProfile): DailyEvent[] {
  const BASE = {
    timeAchieved: false,
    locationAchieved: false,
    taskAchieved: false,
    relaxAchieved: false,
    relaxPoint: 0,
  };

  // 自動取得イベント（非表示）
  const autoEvents: DailyEvent[] = [
    { ...BASE, id: "wake", label: "起床", emoji: "🌅",
      scheduledTime: profile.wakeTime, timePoint: 1, locationPoint: 0, taskPoint: 0,
      requiresLocation: false, requiresTask: false, isAuto: true, isLocation: false },
    { ...BASE, id: "leave_home", label: "家を出る", emoji: "🚶",
      scheduledTime: addMinutes(profile.wakeTime, 60), timePoint: 0, locationPoint: 1, taskPoint: 0,
      requiresLocation: true, requiresTask: false, isAuto: true, isLocation: true, locationLabel: "自宅周辺" },
    { ...BASE, id: "home_station", label: "最寄駅到着", emoji: "🚆",
      scheduledTime: addMinutes(profile.wakeTime, 75), timePoint: 0, locationPoint: 1, taskPoint: 0,
      requiresLocation: true, requiresTask: false, isAuto: true, isLocation: true, locationLabel: profile.homeStation || "最寄駅" },
    { ...BASE, id: "work_station", label: "勤務先最寄駅到着", emoji: "🏙️",
      scheduledTime: "09:00", timePoint: 0, locationPoint: 1, taskPoint: 0,
      requiresLocation: true, requiresTask: false, isAuto: true, isLocation: true, locationLabel: profile.workStation || "勤務先最寄駅" },
    { ...BASE, id: "arrive_work", label: "勤務先到着", emoji: "🏢",
      scheduledTime: "09:15", timePoint: 1, locationPoint: 1, taskPoint: 0,
      requiresLocation: true, requiresTask: false, isAuto: true, isLocation: true, locationLabel: profile.workAddress || "勤務先" },
    { ...BASE, id: "leave_work", label: "退勤", emoji: "👋",
      scheduledTime: "18:00", timePoint: 1, locationPoint: 0, taskPoint: 0,
      requiresLocation: false, requiresTask: false, isAuto: true, isLocation: true },
  ];

  // タスク選択型イベント（表示）
  const defaultContent = "notebook";
  const { taskPt: mTaskPt, relaxPt: mRelaxPt } = getContentPts(defaultContent);
  const taskEvents: DailyEvent[] = [
    { ...BASE, id: "morning_task", label: "出勤前タスク", emoji: "🌸",
      scheduledTime: addMinutes(profile.wakeTime, 15),
      timePoint: 0, locationPoint: 0, taskPoint: mTaskPt, relaxPoint: mRelaxPt,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: defaultContent, taskLabel: "NotebookLM" },
    { ...BASE, id: "commute_task", label: "通勤中タスク", emoji: "🚆",
      scheduledTime: addMinutes(profile.wakeTime, 80),
      timePoint: 0, locationPoint: 1, taskPoint: mTaskPt, relaxPoint: mRelaxPt,
      requiresLocation: true, requiresTask: true, isAuto: false,
      selectedContent: defaultContent, locationLabel: "電車内", taskLabel: "NotebookLM" },
    { ...BASE, id: "lunch_task", label: "お昔休みタスク", emoji: "☕",
      scheduledTime: "12:00",
      timePoint: 0, locationPoint: 0, taskPoint: 3, relaxPoint: 3,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "walk", taskLabel: "散歩" },
    { ...BASE, id: "return_commute", label: "帰宅中タスク", emoji: "🎧",
      scheduledTime: "18:15",
      timePoint: 0, locationPoint: 1, taskPoint: mTaskPt, relaxPoint: mRelaxPt,
      requiresLocation: true, requiresTask: true, isAuto: false,
      selectedContent: defaultContent, locationLabel: "電車内", taskLabel: "NotebookLM" },
    { ...BASE, id: "bedtime_detox", label: "就寡前デトックス", emoji: "🌙",
      scheduledTime: profile.bedTime,
      timePoint: 0, locationPoint: 0, taskPoint: 3, relaxPoint: 5,
      requiresLocation: false, requiresTask: true, isAuto: false,
      selectedContent: "detox", taskLabel: "デトックス" },
  ];

  return [...autoEvents, ...taskEvents].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
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
    // 新形式のweeklyLogsから旧形式に変換
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
  // achievedAtは "HH:MM" 形式
  const [sh, sm] = scheduledTime.split(":").map(Number);
  const [ah, am] = achievedAt.split(":").map(Number);
  const scheduledMins = sh * 60 + sm;
  const achievedMins = ah * 60 + am;
  const diff = achievedMins - scheduledMins; // 負=早め、正=遅れ
  if (diff === 0) return 5;
  if (diff < 0) {
    // 早め: 1分前=+4, 2分前=+3, ... 4分前=+1, 5分前以上=0
    return Math.max(0, 5 + diff); // diff=-1 → 4, diff=-5 → 0
  } else {
    // 遅れ: 1分後=+4, 2分後=+3, ... 4分後=+1, 5分後以上=0
    return Math.max(0, 5 - diff);
  }
}

function calcScore(events: DailyEvent[]): { score: number; earned: number; total: number; bonusTotal: number } {
  // 基本ポイント合計（時間+位置+タスク+リラックス）
  const total = events.reduce(
    (s, e) => s + e.timePoint + e.locationPoint + e.taskPoint + (e.relaxPoint ?? 0), 0
  );
  // 基本達成ポイント
  const baseEarned = events.reduce(
    (s, e) =>
      s +
      (e.timeAchieved ? e.timePoint : 0) +
      (e.locationAchieved ? e.locationPoint : 0) +
      (e.taskAchieved ? e.taskPoint : 0) +
      (e.relaxAchieved ? (e.relaxPoint ?? 0) : 0),
    0
  );
  // 時間精度ボーナス合計
  const bonusTotal = events.reduce(
    (s, e) => s + (e.timeBonus ?? 0),
    0
  );
  const earned = baseEarned + bonusTotal;
  // 最大ボーナスは「時間ポイントを持つイベント数 × 5」
  const maxBonus = events.filter(e => e.timePoint > 0).length * 5;
  const scoreTotal = total + maxBonus;
  const score = scoreTotal > 0 ? Math.round((earned / scoreTotal) * 100) : 0;
  return { score, earned, total: scoreTotal, bonusTotal };
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

  // 1分毎に時刻更新
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // イベント変更時にLocalStorageへ保存＆週間ログ更新
  useEffect(() => {
    const todayKey = getTodayKey();
    localStorage.setItem(`lgm_events_${todayKey}`, JSON.stringify(events));
    const { score, earned } = calcScore(events);
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
  }, [events]);

  // プロフィール保官（起床時間などスケジュールに関わる項目変更時はイベントを再生成）
  const saveProfile = useCallback((p: Partial<UserProfile>) => {
    setProfileState(prev => {
      const next = { ...prev, ...p };
      localStorage.setItem("lgm_profile_v2", JSON.stringify(next));

      // 起床時間・学習内容・最寄駅などスケジュールに関わる変更があればイベントを再生成
      const scheduleKeys: (keyof UserProfile)[] = [
        "wakeTime", "bedTime", "homeStation", "workStation", "learningContent"
      ];
      const hasScheduleChange = scheduleKeys.some(k => k in p && p[k] !== prev[k]);
      if (hasScheduleChange) {
        const todayKey = new Date().toISOString().slice(0, 10);
        // 未達成のイベントは新プロフィールで再生成、達成済みは引き継ぎ
        setEvents(prevEvents => {
          const newEvents = buildDefaultEvents(next);
          const merged = newEvents.map(newEv => {
            const old = prevEvents.find(o => o.id === newEv.id);
            if (!old) return newEv;
            // 達成状態とボーナスは引き継ぎ、時刻は新プロフィールで更新
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

  // タスクコンテンツ変更（ポイントも同時更新）
  const updateEventContent = useCallback((eventId: string, contentId: string) => {
    const c = TASK_CONTENTS.find(t => t.id === contentId);
    if (!c) return;
    setEvents(prev =>
      prev.map(e => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          selectedContent: contentId,
          taskPoint: c.taskPt,
          relaxPoint: c.relaxPt,
          taskLabel: c.label,
        };
      })
    );
  }, []);

  // デイモード変更
  const setDayMode = useCallback((mode: DayMode) => {
    setDayModeState(mode);
    localStorage.setItem("lgm_day_mode", mode);
  }, []);

  // スコア計算
  const { score: rawScore, earned, total, bonusTotal } = calcScore(events);

  // 休日/出張/病欠モードは前日スコアを引き継ぎ
  const effectiveScore = (() => {
    if (dayMode === "normal") return rawScore;
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
    saveSchedule: (items: ScheduleItem[]) => {
      // スケジュール変更時はイベントを再生成
      setEvents(buildDefaultEvents(profile));
    },
  };
}
