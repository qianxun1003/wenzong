"use client";

const STORAGE_KEY = "wen-zong-map-progress";

export interface MapProgressState {
  exploredCountries: string[];
  exploredPrefectures: string[];
  completedExamPoints: string[];
  quizScores: Record<string, number>;
  lastVisited: string | null;
}

const DEFAULT_STATE: MapProgressState = {
  exploredCountries: [],
  exploredPrefectures: [],
  completedExamPoints: [],
  quizScores: {},
  lastVisited: null,
};

function readState(): MapProgressState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: MapProgressState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getMapProgress(): MapProgressState {
  return readState();
}

export function markCountryExplored(slug: string): void {
  const state = readState();
  if (!state.exploredCountries.includes(slug)) {
    state.exploredCountries.push(slug);
    writeState(state);
  }
}

export function markPrefectureExplored(slug: string): void {
  const state = readState();
  if (!state.exploredPrefectures.includes(slug)) {
    state.exploredPrefectures.push(slug);
    writeState(state);
  }
}

export function toggleExamPoint(pointId: string): boolean {
  const state = readState();
  const idx = state.completedExamPoints.indexOf(pointId);
  if (idx >= 0) {
    state.completedExamPoints.splice(idx, 1);
    writeState(state);
    return false;
  }
  state.completedExamPoints.push(pointId);
  writeState(state);
  return true;
}

export function saveQuizScore(puzzleId: string, score: number): void {
  const state = readState();
  const prev = state.quizScores[puzzleId] ?? 0;
  state.quizScores[puzzleId] = Math.max(prev, score);
  writeState(state);
}

export function getRegionExplorationPercent(
  exploredSlugs: string[],
  totalItems: number
): number {
  if (totalItems === 0) return 0;
  return Math.round((exploredSlugs.length / totalItems) * 100);
}

export function getExplorationDegree(
  completedPoints: number,
  totalPoints: number
): number {
  if (totalPoints === 0) return 0;
  return Math.round((completedPoints / totalPoints) * 100);
}
