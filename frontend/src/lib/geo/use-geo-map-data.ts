"use client";

import { useEffect, useState } from "react";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Topology } from "topojson-specification";

type MapKind = "world" | "japan";

const cache = new Map<MapKind, Feature<Geometry>[]>();

export function useGeoMapData(kind: MapKind) {
  const [features, setFeatures] = useState<Feature<Geometry>[]>(() => cache.get(kind) ?? []);
  const [loading, setLoading] = useState(!cache.has(kind));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(kind)) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (kind === "world") {
          const res = await fetch("/data/world-countries-110m.json");
          if (!res.ok) throw new Error("无法加载世界地图数据");
          const topology = (await res.json()) as Topology;
          const geo = feature(topology, topology.objects.countries) as FeatureCollection;
          cache.set(kind, geo.features);
          if (!cancelled) setFeatures(geo.features);
        } else {
          const res = await fetch("/data/japan-prefectures.json");
          if (!res.ok) throw new Error("无法加载日本地图数据");
          const geo = (await res.json()) as FeatureCollection;
          cache.set(kind, geo.features);
          if (!cancelled) setFeatures(geo.features);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "地图加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [kind]);

  return { features, loading, error };
}
