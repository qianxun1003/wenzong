"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_SCALE = 0.6;
const MAX_SCALE = 4;
const DRAG_THRESHOLD = 4;

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface MapPanZoomViewportProps {
  children: React.ReactNode;
  /** 选中项变化时自动回到默认视图 */
  resetKey?: string | number | null;
  className?: string;
  enabled?: boolean;
}

const DEFAULT_TRANSFORM: Transform = { x: 0, y: 0, scale: 1 };

function isTransformDefault(t: Transform) {
  return (
    Math.abs(t.x) < 1 &&
    Math.abs(t.y) < 1 &&
    Math.abs(t.scale - 1) < 0.01
  );
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function MapPanZoomViewport({
  children,
  resetKey,
  className,
  enabled = true,
}: MapPanZoomViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>(DEFAULT_TRANSFORM);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const transformRef = useRef(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    dragging: boolean;
  } | null>(null);

  const pinchRef = useRef<{
    startDistance: number;
    startScale: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  const suppressClickRef = useRef(false);

  const resetTransform = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM);
  }, []);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => resetTransform());
    return () => window.cancelAnimationFrame(raf);
  }, [resetKey, resetTransform]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!enabled) return;
      event.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      const { x, y, scale } = transformRef.current;
      const delta = -event.deltaY * 0.0015;
      const nextScale = clampScale(scale * (1 + delta));
      const ratio = nextScale / scale;

      setTransform({
        scale: nextScale,
        x: mx - ratio * (mx - x),
        y: my - ratio * (my - y),
      });
    },
    [enabled]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleWheel, enabled]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.button > 0) return;
    if (pinchRef.current) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: transformRef.current.x,
      originY: transformRef.current.y,
      dragging: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      drag.dragging = true;
      setIsDragging(true);
      suppressClickRef.current = true;
    }

    setTransform((prev) => ({
      ...prev,
      x: drag.originX + dx,
      y: drag.originY + dy,
    }));
  };

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (drag.dragging) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const getTouchDistance = (touches: React.TouchList) => {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!enabled || event.touches.length !== 2) return;

    dragRef.current = null;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const [a, b] = [event.touches[0], event.touches[1]];
    const centerX = (a.clientX + b.clientX) / 2 - rect.left;
    const centerY = (a.clientY + b.clientY) / 2 - rect.top;
    const { x, y, scale } = transformRef.current;

    pinchRef.current = {
      startDistance: getTouchDistance(event.touches),
      startScale: scale,
      startX: centerX,
      startY: centerY,
      originX: x,
      originY: y,
      centerX,
      centerY,
    };
    setIsPinching(true);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const pinch = pinchRef.current;
    if (!enabled || !pinch || event.touches.length !== 2) return;

    event.preventDefault();
    suppressClickRef.current = true;

    const distance = getTouchDistance(event.touches);
    const nextScale = clampScale(pinch.startScale * (distance / pinch.startDistance));
    const ratio = nextScale / pinch.startScale;

    setTransform({
      scale: nextScale,
      x: pinch.centerX - ratio * (pinch.centerX - pinch.originX),
      y: pinch.centerY - ratio * (pinch.centerY - pinch.originY),
    });
  };

  const handleTouchEnd = () => {
    pinchRef.current = null;
    setIsPinching(false);
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const handleClickCapture = (event: React.MouseEvent) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const showRecenter = enabled && !isTransformDefault(transform);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden touch-none", className)}
    >
      <div
        className={cn(
          "h-full w-full origin-top-left will-change-transform",
          enabled && (isDragging ? "cursor-grabbing" : "cursor-grab")
        )}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: isDragging || isPinching ? "none" : "transform 0.35s ease-out",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClickCapture={handleClickCapture}
      >
        {children}
      </div>

      {enabled && (
        <button
          type="button"
          onClick={resetTransform}
          aria-label="回到当前选中区域"
          title="回到当前选中区域"
          className={cn(
            "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/90 shadow-sm backdrop-blur-sm transition-all",
            "hover:border-primary/30 hover:bg-background hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            showRecenter ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <LocateFixed className="h-4 w-4 text-primary" aria-hidden />
        </button>
      )}
    </div>
  );
}
