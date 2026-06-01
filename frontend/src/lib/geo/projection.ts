import { geoBounds, geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";

export type FitPadding =
  | number
  | { top?: number; right?: number; bottom?: number; left?: number };

export type FitAnchor = "center" | "bottom-right" | "bottom-right-center";

function resolveFitPadding(padding: FitPadding): [number, number, number, number] {
  if (typeof padding === "number") {
    return [padding, padding, padding, padding];
  }
  return [
    padding.top ?? 12,
    padding.right ?? 12,
    padding.bottom ?? 12,
    padding.left ?? 12,
  ];
}

function translateProjectionToAnchor(
  projection: GeoProjection,
  collection: FeatureCollection,
  width: number,
  height: number,
  anchor: FitAnchor,
  padding: FitPadding
): void {
  if (anchor === "center") return;

  const [top, right, bottom, left] = resolveFitPadding(padding);
  const path = geoPath(projection);
  const [[x0, y0], [x1, y1]] = path.bounds(collection);
  const bcx = (x0 + x1) / 2;
  const bcy = (y0 + y1) / 2;

  const innerW = width - left - right;
  const innerH = height - top - bottom;

  let dx = 0;
  let dy = 0;

  if (anchor === "bottom-right") {
    dx = width - right - x1;
    dy = height - bottom - y1;
  } else if (anchor === "bottom-right-center") {
    const targetCx = left + innerW * 0.72;
    const targetCy = top + innerH * 0.72;
    dx = targetCx - bcx;
    dy = targetCy - bcy;
  }

  const [tx, ty] = projection.translate();
  projection.translate([tx + dx, ty + dy]);
}

export function buildProjection(
  features: Feature<Geometry>[],
  width: number,
  height: number,
  kind: "world" | "japan",
  padding: FitPadding = 16,
  scaleMultiplier = 1,
  anchor: FitAnchor = "center"
): GeoProjection {
  const collection: FeatureCollection = { type: "FeatureCollection", features };
  const [top, right, bottom, left] = resolveFitPadding(padding);

  const projection =
    kind === "japan"
      ? geoMercator().center([138, 38]).rotate([-138, 0])
      : geoNaturalEarth1().rotate([0, 0]);

  projection.fitExtent(
    [
      [left, top],
      [width - right, height - bottom],
    ],
    collection
  );

  if (scaleMultiplier !== 1) {
    const center = projection.center();
    projection.scale(projection.scale() * scaleMultiplier);
    projection.center(center);
  }

  if (anchor !== "center") {
    translateProjectionToAnchor(projection, collection, width, height, anchor, padding);
  } else if (scaleMultiplier !== 1) {
    // 放大后重新居中，避免裁切且保持轮廓在画布中央
    const path = geoPath(projection);
    const [[x0, y0], [x1, y1]] = path.bounds(collection);
    const bcx = (x0 + x1) / 2;
    const bcy = (y0 + y1) / 2;
    const [tx, ty] = projection.translate();
    projection.translate([tx + width / 2 - bcx, ty + height / 2 - bcy]);
  }

  return projection;
}

export function createPathGenerator(projection: GeoProjection) {
  return geoPath(projection);
}

export function getFeatureBounds(features: Feature<Geometry>[]) {
  if (features.length === 0) return null;
  const collection: FeatureCollection = { type: "FeatureCollection", features };
  return geoBounds(collection);
}
