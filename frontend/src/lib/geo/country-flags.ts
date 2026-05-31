/** 中文国名 → ISO 3166-1 alpha-2（用于国旗 emoji） */
const COUNTRY_CN_TO_ISO: Record<string, string> = {
  英国: "GB",
  法国: "FR",
  德国: "DE",
  意大利: "IT",
  "俄罗斯（欧洲部分）": "RU",
  俄罗斯: "RU",
  中国: "CN",
  印度: "IN",
  韩国: "KR",
  越南: "VN",
  印度尼西亚: "ID",
  埃及: "EG",
  南非: "ZA",
  尼日利亚: "NG",
  肯尼亚: "KE",
  埃塞俄比亚: "ET",
  美国: "US",
  加拿大: "CA",
  墨西哥: "MX",
  巴西: "BR",
  阿根廷: "AR",
  智利: "CL",
  哥伦比亚: "CO",
  秘鲁: "PE",
  澳大利亚: "AU",
  新西兰: "NZ",
  巴布亚新几内亚: "PG",
  沙特阿拉伯: "SA",
  伊朗: "IR",
  以色列: "IL",
  土耳其: "TR",
  阿联酋: "AE",
  哈萨克斯坦: "KZ",
  乌兹别克斯坦: "UZ",
  蒙古: "MN",
};

function isoToFlagEmoji(iso: string): string {
  const code = iso.toUpperCase();
  if (code.length !== 2) return "";
  const base = 0x1f1e6;
  return [...code]
    .map((char) => String.fromCodePoint(base + char.charCodeAt(0) - 65))
    .join("");
}

export function getCountryFlagEmoji(cnName: string): string | null {
  const iso = COUNTRY_CN_TO_ISO[cnName];
  if (!iso) return null;
  return isoToFlagEmoji(iso);
}

export function formatCountryWithFlag(cnName: string): string {
  const flag = getCountryFlagEmoji(cnName);
  return flag ? `${flag} ${cnName}` : cnName;
}
