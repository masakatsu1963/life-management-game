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

export interface ScheduleItem {
  id: string;
  time: string; // "HH:MM"
  location: string;
  activity: string;
  completed: boolean;
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
  { id: "1", time: "06:30", location: "自宅", activity: "起床・瞑想", completed: false },
  { id: "2", time: "07:15", location: "通勤", activity: "学習30分", completed: false },
  { id: "3", time: "09:00", location: "職場", activity: "業務開始", completed: false },
  { id: "4", time: "12:00", location: "職場", activity: "昼休み活用", completed: false },
  { id: "5", time: "18:00", location: "通勤", activity: "帰宅", completed: false },
  { id: "6", time: "19:00", location: "自宅", activity: "夕食・休息", completed: false },
  { id: "7", time: "22:00", location: "自宅", activity: "就寝デトックス", completed: false },
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
