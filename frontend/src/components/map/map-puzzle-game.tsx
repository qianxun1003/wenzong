"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, RotateCcw, Star, Trophy } from "lucide-react";
import { BackToMapHubLink } from "@/components/map/back-to-map-hub-link";
import { GeoMapCanvas } from "@/components/map/geo-map-canvas";
import { MapPageShell } from "@/components/map/map-page-shell";
import { MapPageTitle } from "@/components/map/map-page-title";
import { buttonVariants } from "@/components/ui/button";
import { JAPAN_REGIONS, WORLD_REGIONS, type JapanRegionId, type WorldRegionId } from "@/lib/map-config";
import { saveQuizScore } from "@/lib/map-progress";
import { cn } from "@/lib/utils";

type PuzzleMode = "world" | "japan";

interface PuzzleQuestion {
  id: WorldRegionId | JapanRegionId;
  label: string;
  options: string[];
  correctIndex: number;
}

const TOTAL_QUESTIONS = 8;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestions(mode: PuzzleMode): PuzzleQuestion[] {
  const source: Array<{ id: WorldRegionId | JapanRegionId; label: string }> =
    mode === "world"
      ? WORLD_REGIONS.map((r) => ({ id: r.id, label: r.name }))
      : JAPAN_REGIONS.map((r) => ({ id: r.id, label: r.name }));

  const picked = shuffle(source).slice(0, TOTAL_QUESTIONS);

  return picked.map((item) => {
    const wrong = shuffle(source.filter((s) => s.id !== item.id)).slice(0, 3);
    const options = shuffle([item.label, ...wrong.map((w) => w.label)]);
    return {
      id: item.id,
      label: item.label,
      options,
      correctIndex: options.indexOf(item.label),
    };
  });
}

function getStarRating(accuracy: number, avgSeconds: number): number {
  if (accuracy >= 0.9 && avgSeconds <= 8) return 3;
  if (accuracy >= 0.7 && avgSeconds <= 12) return 2;
  if (accuracy >= 0.5) return 1;
  return 0;
}

export function MapPuzzleGame() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "japan" ? "japan" : "world";

  const [mode, setMode] = useState<PuzzleMode>(initialMode);
  const [questions, setQuestions] = useState<PuzzleQuestion[]>(() => buildQuestions(initialMode));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);
  const [questionStart, setQuestionStart] = useState(() => new Date().getTime());

  const current = questions[currentIndex];
  const highlightedId = current?.id ?? null;

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  const restart = useCallback((nextMode: PuzzleMode) => {
    setMode(nextMode);
    setQuestions(buildQuestions(nextMode));
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    setFinished(false);
    setElapsed(0);
    setQuestionTimes([]);
    setQuestionStart(new Date().getTime());
  }, []);

  const handleAnswer = (optionIndex: number) => {
    if (showResult || !current) return;

    const timeTaken = (new Date().getTime() - questionStart) / 1000;
    setQuestionTimes((prev) => [...prev, timeTaken]);
    setSelectedOption(optionIndex);
    setShowResult(true);

    const correct = optionIndex === current.correctIndex;
    const nextScore = correct ? score + 1 : score;
    if (correct) setScore(nextScore);

    window.setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        const accuracy = nextScore / questions.length;
        const times = [...questionTimes, timeTaken];
        const avgSeconds = times.reduce((a, b) => a + b, 0) / times.length;
        const stars = getStarRating(accuracy, avgSeconds);
        saveQuizScore(`puzzle-${mode}`, stars);
        setFinished(true);
        return;
      }
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
      setQuestionStart(new Date().getTime());
    }, 900);
  };

  const resultStats = useMemo(() => {
    if (!finished) return null;
    const accuracy = score / questions.length;
    const avgSeconds =
      questionTimes.length > 0
        ? questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length
        : 0;
    const stars = getStarRating(accuracy, avgSeconds);
    return { accuracy, avgSeconds, stars };
  }, [finished, score, questions.length, questionTimes]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <MapPageShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <BackToMapHubLink className="mb-6 -ml-2" />

        <MapPageTitle
          variant={mode === "japan" ? "japan" : "world"}
          title="拼图记忆模式"
          subtitle="看地图、选名称 · 强化位置与形状记忆"
          icon={Trophy}
          className="mb-8"
        />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="map-explorer-mode-toggle">
            <button
              type="button"
              onClick={() => restart("world")}
              className={cn(mode === "world" && "map-explorer-mode-toggle-active")}
            >
              世界地图
            </button>
            <button
              type="button"
              onClick={() => restart("japan")}
              className={cn(mode === "japan" && "map-explorer-mode-toggle-active")}
            >
              日本地图
            </button>
          </div>
          {!finished && (
            <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(elapsed)}
              </span>
              <span>
                {currentIndex + 1}/{questions.length}
              </span>
              <span>得分 {score}</span>
            </div>
          )}
        </div>

        {finished && resultStats ? (
          <div className="map-feature-panel">
            <div className="map-feature-panel-body text-center">
              <Trophy className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-3 text-xl font-semibold">挑战完成！</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                正确率 {Math.round(resultStats.accuracy * 100)}% · 平均{" "}
                {resultStats.avgSeconds.toFixed(1)} 秒/题
              </p>
              <div className="mt-4 flex justify-center gap-1">
                {[1, 2, 3].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-8 w-8",
                      i <= resultStats.stars
                        ? "fill-chart-1 text-chart-1"
                        : "text-muted/40"
                    )}
                  />
                ))}
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => restart(mode)}
                  className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  再来一次
                </button>
                <Link
                  href={mode === "world" ? "/map/world" : "/map/japan"}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                >
                  返回地图
                </Link>
              </div>
            </div>
          </div>
        ) : (
          current && (
            <div className="space-y-4">
              <div className="map-feature-panel overflow-hidden">
                <div className="map-feature-panel-head">
                  <p className="text-sm font-medium">请在地图上找到高亮区域，选择正确名称</p>
                </div>
                <div className="map-puzzle-map relative min-h-[240px] bg-gradient-to-br from-chart-4/15 via-background/50 to-chart-2/15 p-4 sm:min-h-[320px]">
                  <GeoMapCanvas
                    kind={mode}
                    layerMode="geo"
                    selectedRegionId={highlightedId}
                    interactive={false}
                    ariaLabel="拼图地图"
                    className={mode === "japan" ? "mx-auto max-w-[400px]" : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {current.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === current.correctIndex;
                  let variant = "map-puzzle-option";
                  if (showResult && isCorrect) variant += " map-puzzle-option-correct";
                  else if (showResult && isSelected && !isCorrect)
                    variant += " map-puzzle-option-wrong";
                  else if (isSelected) variant += " map-puzzle-option-selected";

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={showResult}
                      onClick={() => handleAnswer(idx)}
                      className={variant}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>
    </MapPageShell>
  );
}
