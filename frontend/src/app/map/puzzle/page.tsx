import { Suspense } from "react";
import { MapPuzzleGame } from "@/components/map/map-puzzle-game";

export default function MapPuzzlePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">加载中…</div>}>
      <MapPuzzleGame />
    </Suspense>
  );
}
