"use client";

const STORAGE_KEY = "wen-zong-map-progress";

export interface MapProgressState {
  exploredCountries: string[];
  exploredPrefectures: string[];
  completedExamPoints: string[];
  quizScores: Record<string, number>;
  lastVisited: string | null;
}

/** SSR / 首屏用：稳定引用，避免 useSyncExternalStore 无限循环 */
export const MAP_PROGRESS_SERVER_SNAPSHOT: MapProgressState = {
  exploredCountries: [],
  exploredPrefectures: [],
  completedExamPoints: [],
  quizScores: {},
  lastVisited: null,
};

let clientSnapshot: MapProgressState = MAP_PROGRESS_SERVER_SNAPSHOT;
let clientRawKey: string | null = null;

function parseStoredState(raw: string): MapProgressState {
  const parsed = JSON.parse(raw) as Partial<MapProgressState>;
  return {
    exploredCountries: Array.isArray(parsed.exploredCountries)
      ? [...parsed.exploredCountries]
      : [],
    exploredPrefectures: Array.isArray(parsed.exploredPrefectures)
      ? [...parsed.exploredPrefectures]
      : [],
    completedExamPoints: Array.isArray(parsed.completedExamPoints)
      ? [...parsed.completedExamPoints]
      : [],
    quizScores:
      parsed.quizScores && typeof parsed.quizScores === "object"
        ? { ...parsed.quizScores }
        : {},
    lastVisited: typeof parsed.lastVisited === "string" ? parsed.lastVisited : null,
  };
}

function cloneState(state: MapProgressState): MapProgressState {
  return {
    exploredCountries: [...state.exploredCountries],
    exploredPrefectures: [...state.exploredPrefectures],
    completedExamPoints: [...state.completedExamPoints],
    quizScores: { ...state.quizScores },
    lastVisited: state.lastVisited,
  };
}

function readCachedState(): MapProgressState {
  if (typeof window === "undefined") return MAP_PROGRESS_SERVER_SNAPSHOT;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === clientRawKey) return clientSnapshot;

  clientRawKey = raw;
  if (!raw) {
    clientSnapshot = MAP_PROGRESS_SERVER_SNAPSHOT;
    return clientSnapshot;
  }

  try {
    clientSnapshot = parseStoredState(raw);
  } catch {
    clientSnapshot = MAP_PROGRESS_SERVER_SNAPSHOT;
  }
  return clientSnapshot;
}

function invalidateCache(): void {
  clientRawKey = null;
}

function writeState(state: MapProgressState): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, raw);
  clientRawKey = raw;
  clientSnapshot = state;
  window.dispatchEvent(new Event("wen-zong-map-progress"));
}

export function getMapProgress(): MapProgressState {
  return readCachedState();
}

export function getMapProgressServerSnapshot(): MapProgressState {
  return MAP_PROGRESS_SERVER_SNAPSHOT;
}

export function subscribeMapProgress(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      invalidateCache();
      onStoreChange();
    }
  };
  const onLocal = () => {
    onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("wen-zong-map-progress", onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("wen-zong-map-progress", onLocal);
  };
}

export function markCountryExplored(slug: string): void {
  const state = cloneState(readCachedState());
  if (!state.exploredCountries.includes(slug)) {
    state.exploredCountries.push(slug);
    writeState(state);
  }
}

export function markPrefectureExplored(slug: string): void {
  const state = cloneState(readCachedState());
  if (!state.exploredPrefectures.includes(slug)) {
    state.exploredPrefectures.push(slug);
    writeState(state);
  }
}

export function toggleExamPoint(pointId: string): boolean {
  const state = cloneState(readCachedState());
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
  const state = cloneState(readCachedState());
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
