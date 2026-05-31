/** 配置中的中文国名 → Natural Earth GeoJSON properties.name */
export const COUNTRY_CN_TO_GEO: Record<string, string> = {
  英国: "United Kingdom",
  法国: "France",
  德国: "Germany",
  意大利: "Italy",
  "俄罗斯（欧洲部分）": "Russia",
  俄罗斯: "Russia",
  中国: "China",
  印度: "India",
  韩国: "South Korea",
  越南: "Vietnam",
  印度尼西亚: "Indonesia",
  埃及: "Egypt",
  南非: "South Africa",
  尼日利亚: "Nigeria",
  肯尼亚: "Kenya",
  埃塞俄比亚: "Ethiopia",
  美国: "United States of America",
  加拿大: "Canada",
  墨西哥: "Mexico",
  巴西: "Brazil",
  阿根廷: "Argentina",
  智利: "Chile",
  哥伦比亚: "Colombia",
  秘鲁: "Peru",
  澳大利亚: "Australia",
  新西兰: "New Zealand",
  巴布亚新几内亚: "Papua New Guinea",
  沙特阿拉伯: "Saudi Arabia",
  伊朗: "Iran",
  以色列: "Israel",
  土耳其: "Turkey",
  阿联酋: "United Arab Emirates",
  哈萨克斯坦: "Kazakhstan",
  乌兹别克斯坦: "Uzbekistan",
  蒙古: "Mongolia",
};

const GEO_TO_COUNTRY_CN: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_CN_TO_GEO).map(([cn, geo]) => [geo, cn])
);

export function getGeoCountryName(cnName: string): string | null {
  return COUNTRY_CN_TO_GEO[cnName] ?? null;
}

export function getCnCountryName(geoName: string): string | null {
  return GEO_TO_COUNTRY_CN[geoName] ?? null;
}

export function isCountryFeature(geoName: string, cnName: string): boolean {
  const expected = getGeoCountryName(cnName);
  return expected != null && geoName === expected;
}
