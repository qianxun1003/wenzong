import type { WorldRegionId } from "@/lib/map-config";

/** ISO 3166-1 numeric code → 世界八大区域 */
export const WORLD_REGION_BY_ISO: Record<string, WorldRegionId> = {
  // 欧洲篇
  "008": "europe", // Albania
  "020": "europe", // Andorra (not in 110m)
  "040": "europe", // Austria
  "056": "europe", // Belgium
  "070": "europe", // Bosnia and Herz.
  "100": "europe", // Bulgaria
  "112": "europe", // Belarus
  "191": "europe", // Croatia
  "196": "europe", // Cyprus
  "203": "europe", // Czechia
  "208": "europe", // Denmark
  "233": "europe", // Estonia
  "246": "europe", // Finland
  "250": "europe", // France
  "268": "europe", // Georgia
  "276": "europe", // Germany
  "300": "europe", // Greece
  "348": "europe", // Hungary
  "352": "europe", // Iceland
  "372": "europe", // Ireland
  "380": "europe", // Italy
  "428": "europe", // Latvia
  "440": "europe", // Lithuania
  "442": "europe", // Luxembourg
  "498": "europe", // Moldova
  "499": "europe", // Montenegro
  "528": "europe", // Netherlands
  "578": "europe", // Norway
  "616": "europe", // Poland
  "620": "europe", // Portugal
  "642": "europe", // Romania
  "688": "europe", // Serbia
  "703": "europe", // Slovakia
  "705": "europe", // Slovenia
  "724": "europe", // Spain
  "752": "europe", // Sweden
  "756": "europe", // Switzerland
  "804": "europe", // Ukraine
  "807": "europe", // Macedonia
  "826": "europe", // United Kingdom

  // 亚洲篇
  "050": "asia", // Bangladesh
  "064": "asia", // Bhutan
  "096": "asia", // Brunei
  "104": "asia", // Myanmar
  "116": "asia", // Cambodia
  "144": "asia", // Sri Lanka
  "156": "asia", // China
  "158": "asia", // Taiwan
  "356": "asia", // India
  "360": "asia", // Indonesia
  "392": "asia", // Japan
  "408": "asia", // North Korea
  "410": "asia", // South Korea
  "418": "asia", // Laos
  "458": "asia", // Malaysia
  "446": "asia", // Macau (if present)
  "524": "asia", // Nepal
  "586": "asia", // Pakistan
  "608": "asia", // Philippines
  "626": "asia", // Timor-Leste
  "704": "asia", // Vietnam
  "764": "asia", // Thailand

  // 非洲篇
  "024": "africa", // Angola
  "108": "africa", // Burundi
  "120": "africa", // Cameroon
  "140": "africa", // Central African Rep.
  "148": "africa", // Chad
  "178": "africa", // Congo
  "180": "africa", // Dem. Rep. Congo
  "204": "africa", // Benin
  "226": "africa", // Eq. Guinea
  "231": "africa", // Ethiopia
  "232": "africa", // Eritrea
  "266": "africa", // Gabon
  "270": "africa", // Gambia
  "288": "africa", // Ghana
  "324": "africa", // Guinea
  "384": "africa", // Côte d'Ivoire
  "404": "africa", // Kenya
  "426": "africa", // Lesotho
  "430": "africa", // Liberia
  "450": "africa", // Madagascar
  "454": "africa", // Malawi
  "466": "africa", // Mali
  "478": "africa", // Mauritania
  "508": "africa", // Mozambique
  "516": "africa", // Namibia
  "562": "africa", // Niger
  "566": "africa", // Nigeria
  "624": "africa", // Guinea-Bissau
  "646": "africa", // Rwanda
  "686": "africa", // Senegal
  "694": "africa", // Sierra Leone
  "706": "africa", // Somalia
  "710": "africa", // South Africa
  "728": "africa", // S. Sudan
  "729": "africa", // Sudan
  "748": "africa", // eSwatini
  "768": "africa", // Togo
  "800": "africa", // Uganda
  "834": "africa", // Tanzania
  "854": "africa", // Burkina Faso
  "894": "africa", // Zambia
  "716": "africa", // Zimbabwe
  "072": "africa", // Botswana

  // 北美篇
  "044": "north-america", // Bahamas
  "084": "north-america", // Belize
  "124": "north-america", // Canada
  "188": "north-america", // Costa Rica
  "192": "north-america", // Cuba
  "214": "north-america", // Dominican Rep.
  "222": "north-america", // El Salvador
  "320": "north-america", // Guatemala
  "332": "north-america", // Haiti
  "340": "north-america", // Honduras
  "388": "north-america", // Jamaica
  "484": "north-america", // Mexico
  "558": "north-america", // Nicaragua
  "591": "north-america", // Panama
  "630": "north-america", // Puerto Rico
  "780": "north-america", // Trinidad and Tobago
  "840": "north-america", // United States of America

  // 南美篇
  "032": "south-america", // Argentina
  "068": "south-america", // Bolivia
  "076": "south-america", // Brazil
  "152": "south-america", // Chile
  "170": "south-america", // Colombia
  "218": "south-america", // Ecuador
  "328": "south-america", // Guyana
  "600": "south-america", // Paraguay
  "604": "south-america", // Peru
  "740": "south-america", // Suriname
  "858": "south-america", // Uruguay
  "862": "south-america", // Venezuela

  // 大洋洲篇
  "036": "oceania", // Australia
  "090": "oceania", // Solomon Is.
  "242": "oceania", // Fiji
  "540": "oceania", // New Caledonia
  "548": "oceania", // Vanuatu
  "554": "oceania", // New Zealand
  "598": "oceania", // Papua New Guinea

  // 中东/北非篇
  "012": "mena", // Algeria
  "048": "mena", // Bahrain
  "262": "mena", // Djibouti
  "364": "mena", // Iran
  "368": "mena", // Iraq
  "376": "mena", // Israel
  "400": "mena", // Jordan
  "414": "mena", // Kuwait
  "422": "mena", // Lebanon
  "434": "mena", // Libya
  "504": "mena", // Morocco
  "512": "mena", // Oman
  "634": "mena", // Qatar
  "682": "mena", // Saudi Arabia
  "732": "mena", // W. Sahara
  "760": "mena", // Syria
  "784": "mena", // United Arab Emirates
  "788": "mena", // Tunisia
  "818": "mena", // Egypt
  "887": "mena", // Yemen
  "275": "mena", // Palestine

  // 俄罗斯/中亚篇
  "031": "russia-central-asia", // Azerbaijan
  "051": "russia-central-asia", // Armenia
  "398": "russia-central-asia", // Kazakhstan
  "417": "russia-central-asia", // Kyrgyzstan
  "496": "russia-central-asia", // Mongolia
  "643": "russia-central-asia", // Russia
  "762": "russia-central-asia", // Tajikistan
  "795": "russia-central-asia", // Turkmenistan
  "860": "russia-central-asia", // Uzbekistan
  "792": "russia-central-asia", // Turkey (transcontinental, grouped here for EJU)
};

/** 无 ISO 编号时的名称兜底 */
export const WORLD_REGION_BY_NAME: Record<string, WorldRegionId> = {
  Kosovo: "europe",
  "N. Cyprus": "mena",
  Somaliland: "africa",
};

export function getWorldRegionId(isoId: string | number | undefined, name: string): WorldRegionId | null {
  if (isoId != null) {
    const key = String(isoId).padStart(3, "0");
    const region = WORLD_REGION_BY_ISO[key];
    if (region) return region;
  }
  return WORLD_REGION_BY_NAME[name] ?? null;
}
