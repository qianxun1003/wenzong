import { geoBounds, geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";

export function buildProjection(
  features: Feature<Geometry>[],
  width: number,
  height: number,
  kind: "world" | "japan",
  padding = 16,
  scaleMultiplier = 1
): GeoProjection {
  const collection: FeatureCollection = { type: "FeatureCollection", features };

  const projection =
    kind === "japan"
      ? geoMercator().center([138, 38]).rotate([-138, 0])
      : geoNaturalEarth1().rotate([0, 0]);

  projection.fitExtent(
    [
      [padding, padding],
      [width - padding, height - padding],
    ],
    collection
  );

  if (scaleMultiplier !== 1) {
    const center = projection.center();
    projection.scale(projection.scale() * scaleMultiplier);
    projection.center(center);
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
