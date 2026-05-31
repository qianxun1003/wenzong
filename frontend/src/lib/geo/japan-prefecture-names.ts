import type { JapanRegionId } from "@/lib/map-config";
import { JAPAN_REGIONS } from "@/lib/map-config";
import { getJapanRegionId } from "@/lib/geo/japan-region-by-prefecture";

/** 配置中的中文简称 → GeoJSON nam_ja */
export const PREFECTURE_CN_TO_JA: Record<string, string> = {
  北海道: "北海道",
  青森: "青森県",
  岩手: "岩手県",
  宫城: "宮城県",
  秋田: "秋田県",
  山形: "山形県",
  福岛: "福島県",
  东京: "東京都",
  神奈川: "神奈川県",
  埼玉: "埼玉県",
  千叶: "千葉県",
  茨城: "茨城県",
  栃木: "栃木県",
  群马: "群馬県",
  爱知: "愛知県",
  静冈: "静岡県",
  长野: "長野県",
  新潟: "新潟県",
  石川: "石川県",
  富山: "富山県",
  福井: "福井県",
  岐阜: "岐阜県",
  山梨: "山梨県",
  大阪: "大阪府",
  京都: "京都府",
  兵库: "兵庫県",
  奈良: "奈良県",
  和歌山: "和歌山県",
  滋贺: "滋賀県",
  三重: "三重県",
  广岛: "広島県",
  冈山: "岡山県",
  山口: "山口県",
  鸟取: "鳥取県",
  岛根: "島根県",
  香川: "香川県",
  爱媛: "愛媛県",
  德岛: "徳島県",
  高知: "高知県",
  福冈: "福岡県",
  佐贺: "佐賀県",
  长崎: "長崎県",
  熊本: "熊本県",
  大分: "大分県",
  宫崎: "宮崎県",
  鹿儿岛: "鹿児島県",
  冲绳: "沖縄県",
};

const JA_TO_CN = Object.fromEntries(
  Object.entries(PREFECTURE_CN_TO_JA).map(([cn, ja]) => [ja, cn])
) as Record<string, string>;

export function prefectureCnToJa(cnName: string): string | null {
  return PREFECTURE_CN_TO_JA[cnName] ?? null;
}

export function prefectureJaToCn(jaName: string): string | null {
  return JA_TO_CN[jaName] ?? null;
}

export function prefectureDisplayName(jaName: string): string {
  return prefectureJaToCn(jaName) ?? jaName.replace(/[県府都]$/, "");
}

export function getPrefecturesJaForRegion(regionId: JapanRegionId): string[] {
  const region = JAPAN_REGIONS.find((r) => r.id === regionId);
  if (!region) return [];
  return region.prefectures
    .map((cn) => prefectureCnToJa(cn))
    .filter((ja): ja is string => ja != null);
}

export function isPrefectureInRegion(jaName: string, regionId: JapanRegionId): boolean {
  return getJapanRegionId(jaName) === regionId;
}

export function toPrefectureSlug(cnName: string): string {
  return encodeURIComponent(cnName);
}

export function fromPrefectureSlug(slug: string): string {
  return decodeURIComponent(slug);
}
