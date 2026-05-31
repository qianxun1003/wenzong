import type { LucideIcon } from "lucide-react";
import {
  Globe2,
  Landmark,
  TrendingUp,
  History,
  Layers,
  MapPin,
} from "lucide-react";

export type MapLayerMode = "geo" | "politics" | "economy" | "history" | "comprehensive";

export type WorldRegionId =
  | "europe"
  | "asia"
  | "africa"
  | "north-america"
  | "south-america"
  | "oceania"
  | "mena"
  | "russia-central-asia";

export interface MapLayerOption {
  id: MapLayerMode;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  description: string;
}

export interface WorldRegion {
  id: WorldRegionId;
  name: string;
  subtitle: string;
  highlight: string;
  countries: string[];
}

export interface RegionMapViewport {
  x: number;
  y: number;
  scale: number;
}

export const DEFAULT_WORLD_VIEWPORT: RegionMapViewport = {
  x: 400,
  y: 200,
  scale: 1,
};

export const WORLD_REGION_VIEWPORTS: Record<WorldRegionId, RegionMapViewport> = {
  europe: { x: 430, y: 130, scale: 2.6 },
  asia: { x: 640, y: 170, scale: 2.4 },
  africa: { x: 460, y: 250, scale: 2.5 },
  "north-america": { x: 200, y: 150, scale: 2.5 },
  "south-america": { x: 280, y: 310, scale: 2.8 },
  oceania: { x: 700, y: 320, scale: 3 },
  mena: { x: 520, y: 200, scale: 2.7 },
  "russia-central-asia": { x: 580, y: 110, scale: 2.4 },
};

/** 地图上各区域热区的近似位置（viewBox 800×400） */
export const WORLD_REGION_HOTSPOTS: Record<
  WorldRegionId,
  { cx: number; cy: number; rx: number; ry: number }
> = {
  europe: { cx: 430, cy: 130, rx: 70, ry: 45 },
  asia: { cx: 640, cy: 170, rx: 95, ry: 60 },
  africa: { cx: 460, cy: 250, rx: 65, ry: 75 },
  "north-america": { cx: 200, cy: 150, rx: 80, ry: 55 },
  "south-america": { cx: 280, cy: 310, rx: 55, ry: 70 },
  oceania: { cx: 700, cy: 320, rx: 60, ry: 45 },
  mena: { cx: 520, cy: 200, rx: 55, ry: 40 },
  "russia-central-asia": { cx: 580, cy: 110, rx: 100, ry: 45 },
};

export type JapanRegionId =
  | "hokkaido"
  | "tohoku"
  | "kanto"
  | "chubu"
  | "kinki"
  | "chugoku"
  | "shikoku"
  | "kyushu";

export interface JapanRegion {
  id: JapanRegionId;
  name: string;
  subtitle: string;
  prefectures: string[];
}

export const DEFAULT_JAPAN_VIEWPORT: RegionMapViewport = {
  x: 220,
  y: 260,
  scale: 1,
};

export const JAPAN_REGIONS: JapanRegion[] = [
  { id: "hokkaido", name: "北海道地方", subtitle: "1 道", prefectures: ["北海道"] },
  { id: "tohoku", name: "东北地方", subtitle: "6 县", prefectures: ["青森", "岩手", "宫城", "秋田", "山形", "福岛"] },
  { id: "kanto", name: "关东地方", subtitle: "1 都 6 县", prefectures: ["东京", "神奈川", "埼玉", "千叶", "茨城", "栃木", "群马"] },
  { id: "chubu", name: "中部地方", subtitle: "9 县", prefectures: ["爱知", "静冈", "长野", "新潟", "石川", "富山", "福井", "岐阜", "山梨"] },
  { id: "kinki", name: "近畿地方", subtitle: "2 府 4 县", prefectures: ["大阪", "京都", "兵库", "奈良", "和歌山", "滋贺", "三重"] },
  { id: "chugoku", name: "中国地方", subtitle: "5 县", prefectures: ["广岛", "冈山", "山口", "鸟取", "岛根"] },
  { id: "shikoku", name: "四国地方", subtitle: "4 县", prefectures: ["香川", "爱媛", "德岛", "高知"] },
  { id: "kyushu", name: "九州地方", subtitle: "8 县", prefectures: ["福冈", "佐贺", "长崎", "熊本", "大分", "宫崎", "鹿儿岛", "冲绳"] },
];

export const JAPAN_REGION_VIEWPORTS: Record<JapanRegionId, RegionMapViewport> = {
  hokkaido: { x: 250, y: 70, scale: 2.8 },
  tohoku: { x: 260, y: 140, scale: 3 },
  kanto: { x: 250, y: 210, scale: 3.2 },
  chubu: { x: 220, y: 250, scale: 3 },
  kinki: { x: 200, y: 290, scale: 3.2 },
  chugoku: { x: 170, y: 300, scale: 3.2 },
  shikoku: { x: 190, y: 340, scale: 3.5 },
  kyushu: { x: 150, y: 380, scale: 3.2 },
};

export const JAPAN_REGION_HOTSPOTS: Record<
  JapanRegionId,
  { cx: number; cy: number; rx: number; ry: number }
> = {
  hokkaido: { cx: 250, cy: 70, rx: 45, ry: 35 },
  tohoku: { cx: 260, cy: 140, rx: 30, ry: 45 },
  kanto: { cx: 250, cy: 210, rx: 28, ry: 35 },
  chubu: { cx: 220, cy: 250, rx: 30, ry: 40 },
  kinki: { cx: 200, cy: 290, rx: 28, ry: 30 },
  chugoku: { cx: 170, cy: 300, rx: 25, ry: 28 },
  shikoku: { cx: 190, cy: 340, rx: 22, ry: 18 },
  kyushu: { cx: 150, cy: 390, rx: 35, ry: 40 },
};

export const MAP_LAYER_OPTIONS: MapLayerOption[] = [
  {
    id: "geo",
    label: "地理模式",
    shortLabel: "地理",
    icon: MapPin,
    description: "地形、气候、资源分布与人口密度",
  },
  {
    id: "politics",
    label: "政治模式",
    shortLabel: "政治",
    icon: Landmark,
    description: "政体、政党、选举与外交关系",
  },
  {
    id: "economy",
    label: "经济模式",
    shortLabel: "经济",
    icon: TrendingUp,
    description: "产业结构、贸易路线与区域合作",
  },
  {
    id: "history",
    label: "历史模式",
    shortLabel: "历史",
    icon: History,
    description: "重大事件、殖民史与独立运动",
  },
  {
    id: "comprehensive",
    label: "综合模式",
    shortLabel: "综合",
    icon: Layers,
    description: "多学科考点一图串联",
  },
];

export const WORLD_REGIONS: WorldRegion[] = [
  {
    id: "europe",
    name: "欧洲篇",
    subtitle: "EU · 北欧 · 南欧",
    highlight: "欧盟一体化、两次世界大战、冷战格局",
    countries: ["英国", "法国", "德国", "意大利", "俄罗斯（欧洲部分）"],
  },
  {
    id: "asia",
    name: "亚洲篇",
    subtitle: "东亚 · 东南亚 · 南亚",
    highlight: "中国崛起、ASEAN、印度发展",
    countries: ["中国", "印度", "韩国", "越南", "印度尼西亚"],
  },
  {
    id: "africa",
    name: "非洲篇",
    subtitle: "撒哈拉以南 · 北非",
    highlight: "殖民遗产、资源出口、区域整合",
    countries: ["埃及", "南非", "尼日利亚", "肯尼亚", "埃塞俄比亚"],
  },
  {
    id: "north-america",
    name: "北美篇",
    subtitle: "美国 · 加拿大 · 墨西哥",
    highlight: "超级大国、NAFTA/USMCA、移民社会",
    countries: ["美国", "加拿大", "墨西哥"],
  },
  {
    id: "south-america",
    name: "南美篇",
    subtitle: "安第斯 · 拉普拉塔",
    highlight: "拉美一体化、资源经济、左翼运动",
    countries: ["巴西", "阿根廷", "智利", "哥伦比亚", "秘鲁"],
  },
  {
    id: "oceania",
    name: "大洋洲篇",
    subtitle: "澳大利亚 · 新西兰 · 太平洋岛国",
    highlight: "亚太安全、资源出口、气候变化",
    countries: ["澳大利亚", "新西兰", "巴布亚新几内亚"],
  },
  {
    id: "mena",
    name: "中东/北非篇",
    subtitle: "阿拉伯世界 · 波斯湾",
    highlight: "石油政治、以阿冲突、伊斯兰运动",
    countries: ["沙特阿拉伯", "伊朗", "以色列", "土耳其", "阿联酋"],
  },
  {
    id: "russia-central-asia",
    name: "俄罗斯/中亚篇",
    subtitle: "独联体 · 中亚五国",
    highlight: "能源通道、后苏联空间、上海合作组织",
    countries: ["俄罗斯", "哈萨克斯坦", "乌兹别克斯坦", "蒙古"],
  },
];

export const JAPAN_LEARNING_TOPICS = [
  "地方区分",
  "县厅所在地",
  "人口分布",
  "产业结构",
  "农业特色",
  "工业地带",
  "气候类型",
  "地方财政",
];

export const COUNTRY_PROFILE_SECTIONS = [
  "概要",
  "历史",
  "政治",
  "经济",
  "地理",
  "国际关系",
  "EJU 高频考点",
  "相关图表",
] as const;

export const MAP_FEATURE_ICON = Globe2;
