import type {
  ArmorWidthMeta,
  ComputedTemplateStats,
  DefinesConfig,
  DivisionTemplateSpec,
  InfantryWidthMeta,
  ModConfig,
  ModuleToggles,
  NationDirective,
  NationTag,
  PresetId,
} from './types';

export interface PresetDefinition {
  id: PresetId;
  name: string;
  subtitle: string;
  description: string;
  infantryMeta: InfantryWidthMeta;
  armorMeta: ArmorWidthMeta;
  defines: DefinesConfig;
  toggles: ModuleToggles;
}

export const VANILLA_DEFINES_BASELINE: DefinesConfig = {
  planAttackMinOrg: 0.25,
  planAttackMinStrength: 0.4,
  attackHeavilyDefendedLimit: 1.0,
  frontReassignPenalty: 1.0,
  encirclementPriority: 1.0,
  deployMinEquipmentSurplus: 0.05,
  airSuperiorityFocus: 1.0,
  maxInvasionSize: 10,
  civToMilYear: 1936,
  minorDivisionCap: 250,
};

export const NATION_DIRECTIVES: NationDirective[] = [
  {
    id: 'ger_atlantic_wall',
    tag: 'GER',
    title: 'Оборона Атлантического вала и портов Франции',
    description: 'Заставляет Рейх держать реальные гарнизоны в портах Западной Европы после 1940, предотвращая мгновенный D-Day в пустой тыл.',
    enabled: true,
    strategyType: 'garrison / area_priority',
    snippetSummary: 'area_priority (western_europe) + coastal garrison ratio',
  },
  {
    id: 'ger_panzer_air_focus',
    tag: 'GER',
    title: 'Танковый кулак и господство Люфтваффе',
    description: 'Перераспределяет проммощности Германии в средние танки, истребители, штурмовики CAS и заводы синтетической резины.',
    enabled: true,
    strategyType: 'equipment_production_factor',
    snippetSummary: 'medium_tank + fighter + CAS + synthetic_refinery',
  },
  {
    id: 'sov_deep_defense_aa',
    tag: 'SOV',
    title: 'Эшелонированная оборона, ПВО и уральский тыл',
    description: 'СССР массово строит зенитки (контр-CAS), артиллерию, заводы за Уралом и Т-34 для контрнаступления с 1942.',
    enabled: true,
    strategyType: 'building_target / production',
    snippetSummary: 'anti_air + artillery + medium_tank + Ural MILs',
  },
  {
    id: 'usa_industrial_overlord',
    tag: 'USA',
    title: 'Промышленный бум и подготовка высадки в Европе',
    description: 'США строят фабрики до 1939, затем разворачивают тяжёлый флот, авиацию и готовят реальный плацдарм в Британии.',
    enabled: true,
    strategyType: 'invade / unit_ratio / economy',
    snippetSummary: 'CIV boom -> MIL/NIC + ENG staging + strategic air',
  },
  {
    id: 'eng_suez_home_air',
    tag: 'ENG',
    title: 'Защита Британии, Суэца и охота на подлодки',
    description: 'Британия не сливает Египет трём итальянским дивизиям, приоритетно держит истребители над Ла-Маншем и строит эсминцы ПЛО.',
    enabled: true,
    strategyType: 'area_priority / naval_mission',
    snippetSummary: 'north_africa garrison + fighter home defense + ASW DD',
  },
  {
    id: 'jap_china_logistics_home',
    tag: 'JAP',
    title: 'Логистика в Китае и гарнизон метрополии',
    description: 'Япония перестаёт сжигать армию без снабжения в горах Шаньси и всегда держит гарнизон на родных островах от внезапного десанта.',
    enabled: true,
    strategyType: 'garrison / equipment_stockpile',
    snippetSummary: 'home_island garrison + logistics + naval_bomber',
  },
  {
    id: 'ita_peninsula_med',
    tag: 'ITA',
    title: 'Оборона Италии, Сицилии и Средиземного моря',
    description: 'Италия держит порты полуострова, строит морские бомбардировщики и не бросает всю армию в пустыне без прикрытия.',
    enabled: true,
    strategyType: 'garrison / naval_bomber',
    snippetSummary: 'southern_italy ports + NAV + fighter cover',
  },
  {
    id: 'fra_belgian_border',
    tag: 'FRA',
    title: 'Прикрытие Арденн и границы с Бельгией',
    description: 'Франция распределяет силы вдоль Бельгии и речных рубежей вместо того, чтобы свалить всё на Мажино или в Альпы.',
    enabled: true,
    strategyType: 'front_unit_request',
    snippetSummary: 'BEL/HOL front request + AA support',
  },
  {
    id: 'chi_river_hold',
    tag: 'CHI',
    title: 'Удержание речных рубежей и снабжение пехоты',
    description: 'Китай концентрирует производство на винтовках и ПВО, избегая самоубийственных атак без снаряжения.',
    enabled: true,
    strategyType: 'equipment_production_min_factories',
    snippetSummary: 'infantry_equipment priority + defensive stance',
  },
];

export const NATION_META: Record<NationTag, { name: string; theatre: string }> = {
  GER: { name: 'Германия', theatre: 'Европа / Восточный фронт' },
  SOV: { name: 'СССР', theatre: 'Восточный фронт / Урал' },
  USA: { name: 'США', theatre: 'Атлантика и Тихий океан' },
  ENG: { name: 'Великобритания', theatre: 'Ла-Манш / Средиземноморье' },
  JAP: { name: 'Япония', theatre: 'Китай / Тихий океан' },
  ITA: { name: 'Италия', theatre: 'Средиземное море / Африка' },
  FRA: { name: 'Франция', theatre: 'Западный фронт' },
  CHI: { name: 'Китай', theatre: 'Восточная Азия' },
};

export const PRESETS: Record<PresetId, PresetDefinition> = {
  balanced: {
    id: 'balanced',
    name: 'Сбалансированный (Историчный)',
    subtitle: 'Умный ИИ без нечестных баффов и читов',
    description:
      'Исправляет главные провалы ванильного ИИ: останавливает бессмысленную мясорубку по батлпланам, наводит порядок в шаблонах дивизий, конструкторах танков/самолётов, экономике и мирных конференциях.',
    infantryMeta: '18w',
    armorMeta: '30w',
    defines: {
      planAttackMinOrg: 0.55,
      planAttackMinStrength: 0.72,
      attackHeavilyDefendedLimit: 0.52,
      frontReassignPenalty: 2.8,
      encirclementPriority: 2.1,
      deployMinEquipmentSurplus: 0.25,
      airSuperiorityFocus: 1.75,
      maxInvasionSize: 16,
      civToMilYear: 1938,
      minorDivisionCap: 32,
    },
    toggles: {
      smartFrontline: true,
      metaTemplates: true,
      metaDesigners: true,
      peaceSanity: true,
      minorAntiLag: true,
      inGameControlPanel: true,
      hardcoreSupplyAssist: false,
    },
  },
  meta: {
    id: 'meta',
    name: 'Хардкор (Мета-ИИ)',
    subtitle: 'Жёсткие прорывные шаблоны, фокус на котлы и авиацию',
    description:
      'Настройка для опытных игроков: ИИ собирает 21w/36w мета-дивизии, жёстко бережёт организацию, массированно применяет истребители с штурмовиками и получает лёгкую поддержку логистики.',
    infantryMeta: '21w',
    armorMeta: '36w',
    defines: {
      planAttackMinOrg: 0.65,
      planAttackMinStrength: 0.8,
      attackHeavilyDefendedLimit: 0.42,
      frontReassignPenalty: 3.5,
      encirclementPriority: 2.8,
      deployMinEquipmentSurplus: 0.35,
      airSuperiorityFocus: 2.25,
      maxInvasionSize: 22,
      civToMilYear: 1938,
      minorDivisionCap: 28,
    },
    toggles: {
      smartFrontline: true,
      metaTemplates: true,
      metaDesigners: true,
      peaceSanity: true,
      minorAntiLag: true,
      inGameControlPanel: true,
      hardcoreSupplyAssist: true,
    },
  },
  performance: {
    id: 'performance',
    name: 'Оптимизация (Анти-лаг)',
    subtitle: 'Максимальный FPS в 1943–1946 без потери интеллекта',
    description:
      'Сохраняет все тактические и шаблонные улучшения, но агрессивно режет спам дивизий у второстепенных стран Южной Америки и Азии, ускоряя тики игры в поздней кампании.',
    infantryMeta: '18w',
    armorMeta: '30w',
    defines: {
      planAttackMinOrg: 0.58,
      planAttackMinStrength: 0.75,
      attackHeavilyDefendedLimit: 0.5,
      frontReassignPenalty: 3.2,
      encirclementPriority: 2.0,
      deployMinEquipmentSurplus: 0.3,
      airSuperiorityFocus: 1.65,
      maxInvasionSize: 14,
      civToMilYear: 1938,
      minorDivisionCap: 16,
    },
    toggles: {
      smartFrontline: true,
      metaTemplates: true,
      metaDesigners: true,
      peaceSanity: true,
      minorAntiLag: true,
      inGameControlPanel: true,
      hardcoreSupplyAssist: false,
    },
  },
};

export function createInitialConfig(presetId: PresetId = 'balanced'): ModConfig {
  const preset = PRESETS[presetId];
  const nationDirectives: Record<string, boolean> = {};
  for (const dir of NATION_DIRECTIVES) {
    nationDirectives[dir.id] = dir.enabled;
  }

  return {
    modName: 'Железная Доктрина: Умный ИИ',
    folderName: 'iron_doctrine_ai',
    supportedVersion: '1.15.*',
    preset: presetId,
    infantryMeta: preset.infantryMeta,
    armorMeta: preset.armorMeta,
    defines: { ...preset.defines },
    toggles: { ...preset.toggles },
    nationDirectives,
  };
}

export function applyPreset(current: ModConfig, presetId: PresetId): ModConfig {
  const preset = PRESETS[presetId];
  return {
    ...current,
    preset: presetId,
    infantryMeta: preset.infantryMeta,
    armorMeta: preset.armorMeta,
    defines: { ...preset.defines },
    toggles: { ...preset.toggles },
  };
}

export function buildDivisionTemplates(
  infantryMeta: InfantryWidthMeta,
  armorMeta: ArmorWidthMeta
): DivisionTemplateSpec[] {
  const lineInfantry: DivisionTemplateSpec =
    infantryMeta === '18w'
      ? {
          id: 'line_infantry',
          name: 'Линейная пехота (18w)',
          role: 'Удержание фронта',
          clausewitzRole: 'infantry',
          regiments: [{ type: 'infantry', label: 'Пехота', count: 9, width: 2, org: 60 }],
          support: [
            { type: 'engineer', label: 'Сапёрная рота' },
            { type: 'artillery', label: 'Артиллерия поддержки' },
            { type: 'anti_air', label: 'ПВО поддержки' },
          ],
          notes: 'Оптимальная ширина под леса, холмы и равнины. Высокая организация и дешёвое снабжение.',
        }
      : infantryMeta === '21w'
        ? {
            id: 'line_infantry',
            name: 'Линейная пехота (21w)',
            role: 'Универсальный фронт',
            clausewitzRole: 'infantry',
            regiments: [
              { type: 'infantry', label: 'Пехота', count: 9, width: 2, org: 60 },
              { type: 'artillery_brigade', label: 'Артиллерия', count: 1, width: 3, org: 0 },
            ],
            support: [
              { type: 'engineer', label: 'Сапёрная рота' },
              { type: 'artillery', label: 'Артиллерия поддержки' },
              { type: 'anti_air', label: 'ПВО поддержки' },
              { type: 'logistics_company', label: 'Рота обеспечения' },
            ],
            notes: 'Классика 9/1: мощная противопехотная атака для мажоров без просадки по организации.',
          }
        : {
            id: 'line_infantry',
            name: 'Усиленная пехота (24w)',
            role: 'Плотная оборона',
            clausewitzRole: 'infantry',
            regiments: [
              { type: 'infantry', label: 'Пехота', count: 9, width: 2, org: 60 },
              { type: 'artillery_brigade', label: 'Артиллерия', count: 2, width: 3, org: 0 },
            ],
            support: [
              { type: 'engineer', label: 'Сапёрная рота' },
              { type: 'artillery', label: 'Артиллерия поддержки' },
              { type: 'anti_air', label: 'ПВО поддержки' },
              { type: 'logistics_company', label: 'Рота обеспечения' },
            ],
            notes: 'Тяжёлый огневой вал 9/2 для промышленно развитых стран.',
          };

  const shockInfantry: DivisionTemplateSpec = {
    id: 'shock_infantry',
    name: 'Штурмовая пехота (27w)',
    role: 'Локальные прорывы',
    clausewitzRole: 'infantry',
    regiments: [
      { type: 'infantry', label: 'Пехота', count: 9, width: 2, org: 60 },
      { type: 'artillery_brigade', label: 'Артиллерия', count: 3, width: 3, org: 0 },
    ],
    support: [
      { type: 'engineer', label: 'Сапёрная рота' },
      { type: 'artillery', label: 'Артиллерия поддержки' },
      { type: 'anti_air', label: 'ПВО поддержки' },
      { type: 'recon', label: 'Разведрота' },
      { type: 'logistics_company', label: 'Рота обеспечения' },
    ],
    notes: '9/3 ударные пехотные дивизии для прорыва в лесах и против укреплённых линий.',
  };

  const armorTemplate: DivisionTemplateSpec =
    armorMeta === '30w'
      ? {
          id: 'medium_armor',
          name: 'Танковая дивизия прорыва (30w)',
          role: 'Прорыв и окружение',
          clausewitzRole: 'armor',
          regiments: [
            { type: 'medium_armor', label: 'Средние танки', count: 8, width: 2, org: 10 },
            { type: 'motorized', label: 'Мотопехота', count: 7, width: 2, org: 60 },
          ],
          support: [
            { type: 'engineer', label: 'Сапёрная рота' },
            { type: 'logistics_company', label: 'Рота обеспечения' },
            { type: 'anti_air', label: 'ПВО поддержки' },
            { type: 'maintenance_company', label: 'Ремрота' },
            { type: 'artillery', label: 'Артиллерия поддержки' },
          ],
          notes: 'Идеальный баланс брони, прорыва и организации (>33 ед.), чтобы танки не выдыхались после первого боя.',
        }
      : {
          id: 'medium_armor',
          name: 'Тяжёлый танковый кулак (36w)',
          role: 'Массированный блицкриг',
          clausewitzRole: 'armor',
          regiments: [
            { type: 'medium_armor', label: 'Средние танки', count: 10, width: 2, org: 10 },
            { type: 'mechanized', label: 'Мехпехота', count: 8, width: 2, org: 60 },
          ],
          support: [
            { type: 'engineer', label: 'Сапёрная рота' },
            { type: 'logistics_company', label: 'Рота обеспечения' },
            { type: 'anti_air', label: 'ПВО поддержки' },
            { type: 'maintenance_company', label: 'Ремрота' },
            { type: 'signal_company', label: 'Рота связи' },
          ],
          notes: 'Мета-дивизия 36w для равнин Восточной и Западной Европы с максимальной концентрацией прорыва.',
        };

  const motorizedTemplate: DivisionTemplateSpec = {
    id: 'motorized_exploit',
    name: 'Моторизованная дивизия (18w)',
    role: 'Закрытие котлов',
    clausewitzRole: 'mobile',
    regiments: [{ type: 'motorized', label: 'Мотопехота', count: 9, width: 2, org: 60 }],
    support: [
      { type: 'engineer', label: 'Сапёрная рота' },
      { type: 'artillery', label: 'Артиллерия поддержки' },
      { type: 'anti_air', label: 'ПВО поддержки' },
      { type: 'logistics_company', label: 'Рота обеспечения' },
    ],
    notes: 'Быстро заполняет фланги за танковыми клиньями, не давая противнику срезать прорыв.',
  };

  const garrisonTemplate: DivisionTemplateSpec = {
    id: 'coastal_garrison',
    name: 'Береговой гарнизон (10w)',
    role: 'Охрана портов',
    clausewitzRole: 'garrison',
    regiments: [{ type: 'infantry', label: 'Пехота', count: 5, width: 2, org: 60 }],
    support: [{ type: 'engineer', label: 'Сапёрная рота' }],
    notes: 'Дешёвая и надёжная охрана портов, чтобы ИИ не держал танковые дивизии на пляжах.',
  };

  const mountaineerTemplate: DivisionTemplateSpec = {
    id: 'mountaineers',
    name: 'Горнострелки (25w)',
    role: 'Горы и холмы',
    clausewitzRole: 'mountaineers',
    regiments: [
      { type: 'mountaineers', label: 'Горнострелки', count: 8, width: 2, org: 70 },
      { type: 'artillery_brigade', label: 'Артиллерия', count: 3, width: 3, org: 0 },
    ],
    support: [
      { type: 'engineer', label: 'Сапёрная рота' },
      { type: 'artillery', label: 'Артиллерия поддержки' },
      { type: 'anti_air', label: 'ПВО поддержки' },
      { type: 'logistics_company', label: 'Рота обеспечения' },
    ],
    notes: 'Ровная ширина 25w идеально укладывается в горный бой (50w/75w) без штрафов.',
  };

  return [
    lineInfantry,
    shockInfantry,
    armorTemplate,
    motorizedTemplate,
    garrisonTemplate,
    mountaineerTemplate,
  ];
}

export function computeTemplateStats(spec: DivisionTemplateSpec): ComputedTemplateStats {
  let combatWidth = 0;
  let battalionCount = 0;
  let orgSum = 0;

  for (const reg of spec.regiments) {
    combatWidth += reg.count * reg.width;
    battalionCount += reg.count;
    orgSum += reg.count * reg.org;
  }

  const supportCount = spec.support.length;
  // Support companies average ~20 base org impact in HOI4 formula (total org / total battalions + support)
  const totalUnits = battalionCount + supportCount;
  const estimatedOrg =
    totalUnits > 0 ? Math.round((orgSum + supportCount * 20) / totalUnits) : 0;

  const isMetaWidth = [10, 18, 21, 24, 25, 27, 30, 35, 36].includes(combatWidth);

  return {
    combatWidth,
    battalionCount,
    supportCount,
    estimatedOrg,
    isMetaWidth,
  };
}
