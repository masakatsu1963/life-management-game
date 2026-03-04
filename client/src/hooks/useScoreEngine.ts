/**
 * useScoreEngine.ts
 * Design: Dark Gaming Gauge - Score calculation engine
 * Calculates life efficiency score (0-100) based on:
 *   - Time deviation (40%): how close to ideal schedule
 *   - Space deviation (30%): distance from ideal location
 *   - Activity achievement (20%): completed activities
 *   - Emotion score (10%): user-reported mood
 */

import { useState, useEffect, useCallback, useRef } from "react";

export type Difficulty = "easy" | "normal" | "hard";

export type ScheduleCategory =
  | "wakeup"       // 起床
  | "pre_work"     // 出勤前のタスク
  | "commute_learn" // 通勤時間の学習
  | "break"        // 休憩時間利用
  | "return_learn" // 帰宅時間の学習
  | "pre_sleep"    // 就寝前のタスク
  | "other";       // その他

export interface ScheduleItem {
  id: string;
  time: string; // "HH:MM"
  location: string;
  activity: string;
  completed: boolean;
  category?: ScheduleCategory;
}

export interface ScoreBreakdown {
  timeScore: number;      // 0-100
  spaceScore: number;     // 0-100
  activityScore: number;  // 0-100
  emotionScore: number;   // 0-100
  total: number;          // 0-100 weighted
}

export interface GameState {
  score: ScoreBreakdown;
  difficulty: Difficulty;
  cheatPoints: number;
  streak: number; // consecutive days above 80
  currentTime: Date;
  timeDeviation: number; // minutes off schedule
  spaceDeviation: number; // km from ideal location
  schedule: ScheduleItem[];
  nextEvent: ScheduleItem | null;
  minutesUntilNext: number;
  emotionLevel: number; // 1-5
  isWarning: boolean;
  lastUpdated: Date;
}

const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  easy: 0.7,
  normal: 1.0,
  hard: 1.4,
};

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { id: "1", time: "06:30", location: "自宅", activity: "起床・瞑想", completed: false, category: "wakeup" },
  { id: "2", time: "07:00", location: "自宅", activity: "出勤前ストレッチ", completed: false, category: "pre_work" },
  { id: "3", time: "07:30", location: "自宅", activity: "朝の準備・身支度", completed: false, category: "pre_work" },
  { id: "4", time: "08:00", location: "通勤", activity: "通勤中の学習30分", completed: false, category: "commute_learn" },
  { id: "5", time: "12:00", location: "職場", activity: "昼休み活用", completed: false, category: "break" },
  { id: "6", time: "18:00", location: "通勤", activity: "帰宅中の学習", completed: false, category: "return_learn" },
  { id: "7", time: "22:00", location: "自宅", activity: "就寝デトックス", completed: false, category: "pre_sleep" },
];

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function getCurrentMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function calculateTimeScore(
  schedule: ScheduleItem[],
  currentMinutes: number,
  difficulty: Difficulty
): { score: number; deviation: number; nextEvent: ScheduleItem | null; minutesUntilNext: number } {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];

  // Find the most recent past event and the next upcoming event
  let closestEvent: ScheduleItem | null = null;
  let minDeviation = Infinity;
  let nextEvent: ScheduleItem | null = null;
  let minutesUntilNext = 0;

  for (const item of schedule) {
    const itemMinutes = timeToMinutes(item.time);
    const diff = Math.abs(currentMinutes - itemMinutes);

    if (diff < minDeviation) {
      minDeviation = diff;
      closestEvent = item;
    }

    if (itemMinutes > currentMinutes) {
      if (!nextEvent || itemMinutes < timeToMinutes(nextEvent.time)) {
        nextEvent = item;
        minutesUntilNext = itemMinutes - currentMinutes;
      }
    }
  }

  // Score: 100 at 0 deviation, drops based on difficulty
  // Easy: ±15min = 100, Hard: ±5min = 100
  const tolerance = difficulty === "easy" ? 15 : difficulty === "normal" ? 10 : 5;
  const rawScore = Math.max(0, 100 - (minDeviation / tolerance) * 30 * multiplier);

  return {
    score: Math.min(100, rawScore),
    deviation: minDeviation,
    nextEvent,
    minutesUntilNext,
  };
}

function calculateActivityScore(schedule: ScheduleItem[]): number {
  const completed = schedule.filter((s) => s.completed).length;
  return schedule.length > 0 ? (completed / schedule.length) * 100 : 50;
}

function calculateWeightedTotal(
  breakdown: Omit<ScoreBreakdown, "total">,
  difficulty: Difficulty
): number {
  const { timeScore, spaceScore, activityScore, emotionScore } = breakdown;
  const base = timeScore * 0.4 + spaceScore * 0.3 + activityScore * 0.2 + emotionScore * 0.1;
  // Difficulty adjusts the ceiling
  const multiplier = difficulty === "easy" ? 1.1 : difficulty === "hard" ? 0.9 : 1.0;
  return Math.min(100, Math.max(0, base * multiplier));
}

const STORAGE_KEY = "life-mgmt-game-state";
const WEEKLY_LOG_KEY = "life-mgmt-weekly-log";

// 日付文字列 "YYYY-MM-DD"
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// 1日分のカテゴリ達成ログ
export interface DayLog {
  date: string; // "YYYY-MM-DD"
  categoryStats: Record<string, { total: number; completed: number }>;
}

// 過去7日分のログを取得
export function loadWeeklyLog(): DayLog[] {
  try {
    const raw = localStorage.getItem(WEEKLY_LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DayLog[];
  } catch {
    return [];
  }
}

function saveWeeklyLog(logs: DayLog[]) {
  try {
    // 7日分だけ保持
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth()+1).padStart(2,"0")}-${String(cutoff.getDate()).padStart(2,"0")}`;
    const trimmed = logs.filter(l => l.date >= cutoffStr);
    localStorage.setItem(WEEKLY_LOG_KEY, JSON.stringify(trimmed));
  } catch {}
}

// 今日のログを更新
export function upsertTodayLog(schedule: ScheduleItem[]) {
  const logs = loadWeeklyLog();
  const today = todayStr();
  const CATS: ScheduleCategory[] = ["wakeup","pre_work","commute_learn","break","return_learn","pre_sleep"];
  const stats: Record<string, { total: number; completed: number }> = {};
  for (const cat of CATS) {
    const items = schedule.filter(s => s.category === cat);
    stats[cat] = { total: items.length, completed: items.filter(s => s.completed).length };
  }
  const idx = logs.findIndex(l => l.date === today);
  if (idx >= 0) {
    logs[idx] = { date: today, categoryStats: stats };
  } else {
    logs.push({ date: today, categoryStats: stats });
  }
  saveWeeklyLog(logs);
}

// 7日間のカテゴリ別積算達成率を計算
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

function loadFromStorage(): Partial<GameState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveToStorage(state: Partial<GameState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useScoreEngine() {
  const saved = loadFromStorage();

  const [difficulty, setDifficulty] = useState<Difficulty>(
    (saved.difficulty as Difficulty) || "normal"
  );
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    saved.schedule || DEFAULT_SCHEDULE
  );
  const [cheatPoints, setCheatPoints] = useState<number>(
    saved.cheatPoints ?? 85
  );
  const [streak, setStreak] = useState<number>(saved.streak ?? 3);
  const [emotionLevel, setEmotionLevel] = useState<number>(
    saved.emotionLevel ?? 3
  );
  const [spaceDeviation, setSpaceDeviation] = useState<number>(
    saved.spaceDeviation ?? 0.2
  );

  const [gameState, setGameState] = useState<GameState>(() => {
    const now = new Date();
    return buildState(now, difficulty, schedule, cheatPoints, streak, emotionLevel, spaceDeviation);
  });

  const prevScoreRef = useRef(gameState.score.total);

  function buildState(
    now: Date,
    diff: Difficulty,
    sched: ScheduleItem[],
    cp: number,
    str: number,
    emotion: number,
    spaceDev: number
  ): GameState {
    const currentMinutes = getCurrentMinutes(now);
    const { score: timeScore, deviation, nextEvent, minutesUntilNext } =
      calculateTimeScore(sched, currentMinutes, diff);
    const activityScore = calculateActivityScore(sched);
    const spaceScore = Math.max(0, 100 - spaceDev * 50);
    const emotionScore = (emotion / 5) * 100;

    const breakdown: Omit<ScoreBreakdown, "total"> = {
      timeScore,
      spaceScore,
      activityScore,
      emotionScore,
    };
    const total = calculateWeightedTotal(breakdown, diff);

    return {
      score: { ...breakdown, total },
      difficulty: diff,
      cheatPoints: cp,
      streak: str,
      currentTime: now,
      timeDeviation: deviation,
      spaceDeviation: spaceDev,
      schedule: sched,
      nextEvent,
      minutesUntilNext,
      emotionLevel: emotion,
      isWarning: deviation > (diff === "easy" ? 20 : diff === "normal" ? 15 : 10),
      lastUpdated: now,
    };
  }

  // Recalculate every 30 seconds
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const newState = buildState(now, difficulty, schedule, cheatPoints, streak, emotionLevel, spaceDeviation);
      setGameState(newState);
      prevScoreRef.current = newState.score.total;
    };

    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, [difficulty, schedule, cheatPoints, streak, emotionLevel, spaceDeviation]);

  // Save to localStorage when key state changes
  useEffect(() => {
    saveToStorage({ difficulty, schedule, cheatPoints, streak, emotionLevel, spaceDeviation });
    // 週間ログも同時に更新
    upsertTodayLog(schedule);
  }, [difficulty, schedule, cheatPoints, streak, emotionLevel, spaceDeviation]);

  const toggleActivity = useCallback((id: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);

  const changeDifficulty = useCallback((d: Difficulty) => {
    setDifficulty(d);
  }, []);

  const changeEmotion = useCallback((level: number) => {
    setEmotionLevel(Math.max(1, Math.min(5, level)));
  }, []);

  const useCheat = useCallback((cost: number, type: "alarm" | "space") => {
    if (cheatPoints < cost) return false;
    setCheatPoints((prev) => prev - cost);
    if (type === "space") {
      setSpaceDeviation(0);
    }
    return true;
  }, [cheatPoints]);

  const saveSchedule = useCallback((newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule.map(item => ({ ...item, completed: false })));
  }, []);

  const forceUpdateScore = useCallback(() => {
    const now = new Date();
    const newState = buildState(now, difficulty, schedule, cheatPoints, streak, emotionLevel, spaceDeviation);
    setGameState(newState);
  }, [difficulty, schedule, cheatPoints, streak, emotionLevel, spaceDeviation]);

  return {
    gameState,
    difficulty,
    changeDifficulty,
    toggleActivity,
    changeEmotion,
    useCheat,
    forceUpdateScore,
    setSpaceDeviation,
    saveSchedule,
  };
}
