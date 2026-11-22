import { buildDivisionTemplates } from './presets';
import type { DivisionTemplateSpec, GeneratedModFile, ModConfig } from './types';

function formatNum(value: number, decimals = 2): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(decimals);
}

function generateDescriptor(config: ModConfig, includePath: boolean): string {
  const safeName = config.modName.replace(/"/g, "'");
  const lines = [
    'version="1.0.0"',
    'tags={',
    '\t"Balance"',
    '\t"Gameplay"',
    '\t"Military"',
    '\t"Fixes"',
    '}',
    `name="${safeName}"`,
    'picture="thumbnail.png"',
    `supported_version="${config.supportedVersion}"`,
  ];

  if (includePath) {
    lines.push(`path="mod/${config.folderName}"`);
  }

  return lines.join('\n') + '\n';
}

function generateLuaDefines(config: ModConfig): string {
  const d = config.defines;
  const t = config.toggles;

  const orgMedium = Math.min(0.85, +(d.planAttackMinOrg + 0.12).toFixed(2));
  const orgHigh = Math.min(0.95, +(d.planAttackMinOrg + 0.22).toFixed(2));
  const strMedium = Math.min(0.92, +(d.planAttackMinStrength + 0.1).toFixed(2));
  const strHigh = Math.min(0.98, +(d.planAttackMinStrength + 0.18).toFixed(2));

  const frontLines = t.smartFrontline
    ? [
        '-- ============================================================================',
        '-- 1. ФРОНТ, БАТЛПЛАНЫ И ОТКАЗ ОТ МЯСОРУБКИ (STOP MEATGRINDER & SHUFFLING)',
        '-- ============================================================================',
        `NDefines.NAI.PLAN_ATTACK_MIN_ORG_FACTOR_LOW = ${formatNum(d.planAttackMinOrg)}          -- Ванилла: 0.25 (ИИ больше не атакует с пустой оргой)`,
        `NDefines.NAI.PLAN_ATTACK_MIN_ORG_FACTOR_MED = ${formatNum(orgMedium)}          -- Ванилла: 0.45`,
        `NDefines.NAI.PLAN_ATTACK_MIN_ORG_FACTOR_HIGH = ${formatNum(orgHigh)}         -- Ванилла: 0.60`,
        `NDefines.NAI.PLAN_ATTACK_MIN_STRENGTH_FACTOR_LOW = ${formatNum(d.planAttackMinStrength)}     -- Ванилла: 0.40 (стоп атак без снаряжения)`,
        `NDefines.NAI.PLAN_ATTACK_MIN_STRENGTH_FACTOR_MED = ${formatNum(strMedium)}     -- Ванилла: 0.60`,
        `NDefines.NAI.PLAN_ATTACK_MIN_STRENGTH_FACTOR_HIGH = ${formatNum(strHigh)}    -- Ванилла: 0.75`,
        `NDefines.NAI.ATTACK_HEAVILY_DEFENDED_LIMIT = ${formatNum(d.attackHeavilyDefendedLimit)}          -- Ванилла: 1.0 (не биться лбом о форты и горы)`,
        `NDefines.NAI.MIN_PLAN_VALUE_TO_MICRO_INACTIVE = 0.25`,
        `NDefines.NAI.MAX_MICRO_ATTACKS_PER_ORDER = 4`,
        `NDefines.NAI.ORG_UNIT_STRONG = 0.78`,
        `NDefines.NAI.ORG_UNIT_WEAK = 0.38`,
        `NDefines.NAI.STR_UNIT_STRONG = 0.82`,
        `NDefines.NAI.STR_UNIT_WEAK = 0.45`,
        '',
        '-- Анти-суета на фронте (убираем постоянное перебрасывание по ЖД туда-сюда)',
        `NDefines.NAI.FRONT_REASSIGN_DISTANCE = ${Math.round(90 * d.frontReassignPenalty)}`,
        `NDefines.NAI.FRONTLINE_REASSIGN_PENALTY = ${formatNum(d.frontReassignPenalty)}`,
        `NDefines.NAI.UNIT_ASSIGNMENT_TERRAIN_IMPORTANCE = 8.0`,
        `NDefines.NAI.MAX_DISTANCE_NAL_INVASION = 400.0`,
        '',
        '-- Приоритет окружений, котлов и танковых клиньев',
        `NDefines.NAI.ENCIRCLEMENT_PRIORITY = ${formatNum(d.encirclementPriority)}`,
        `NDefines.NAI.POCKET_DESTRUCTION_PRIORITY = ${formatNum(d.encirclementPriority * 1.25)}`,
        `NDefines.NAI.BREAKTHROUGH_PRIORITY_BONUS = ${formatNum(d.encirclementPriority * 0.9)}`,
        `NDefines.NAI.SPEARHEAD_REASSIGN_PENALTY = 3.2`,
        `NDefines.NAI.PLAN_FACTION_STRONG_TO_EXECUTE = 0.62`,
        `NDefines.NAI.PLAN_FACTION_WEAK_TO_ABORT = 0.48`,
      ]
    : [
        '-- Фронтовой модуль отключён пользователем (используются базовые значения).',
      ];

  const prodLines = [
    '',
    '-- ============================================================================',
    '-- 2. ПРОИЗВОДСТВО, ШАБЛОНЫ И ЗАПРЕТ НА СПАМ ГОЛЫХ ДИВИЗИЙ',
    '-- ============================================================================',
    `NDefines.NAI.DEPLOY_MIN_EQUIPMENT_SURPLUS_FOR_DEPLOYMENT = ${formatNum(d.deployMinEquipmentSurplus)}  -- Не развёртывать дивизии при дефиците склада`,
    `NDefines.NAI.TRAINING_MIN_EQUIPMENT_FACTOR = ${formatNum(Math.min(0.95, 0.7 + d.deployMinEquipmentSurplus * 0.5))}`,
    `NDefines.NAI.DIVISION_UPGRADE_MIN_XP = 15`,
    `NDefines.NAI.DIVISION_CREATE_MIN_XP = 45`,
    `NDefines.NAI.VARIANT_UPGRADE_MIN_XP = 35`,
    `NDefines.NAI.UPGRADE_XP_RUSH_UPDATE = 140`,
    `NDefines.NAI.PRODUCTION_EQUIPMENT_SURPLUS_FACTOR = 0.35`,
    `NDefines.NAI.WANTED_UNITS_MANPOWER_DIVISOR = ${t.minorAntiLag ? 26000 : 18000}`,
    `NDefines.NAI.MIN_MANPOWER_TO_TRAIN = ${t.minorAntiLag ? 25000 : 12000}`,
    `NDefines.NAI.DAYS_BETWEEN_CHECK_IN_THEATERS = 7`,
    `NDefines.NAI.TRADE_SCORE_MULTIPLIER = 1.45`,
    `NDefines.NAI.RESEARCH_AHEAD_OF_TIME_FACTOR = 1.65`,
    `NDefines.NAI.RESEARCH_BONUS_FACTOR = 4.2`,
    '',
    '-- ============================================================================',
    '-- 3. АВИАЦИЯ, ФЛОТ И МОРСКИЕ ВЫСАДКИ',
    '-- ============================================================================',
    `NDefines.NAI.AIR_SUPERIORITY_PRIORITY = ${formatNum(d.airSuperiorityFocus * 1.4)}`,
    `NDefines.NAI.CAS_PRIORITY = ${formatNum(d.airSuperiorityFocus * 1.25)}`,
    `NDefines.NAI.STRATEGIC_BOMBING_PRIORITY = ${formatNum(d.airSuperiorityFocus * 0.7)}`,
    `NDefines.NAI.NAVAL_MISSION_MIN_FLEET_SIZE = 8`,
    `NDefines.NAI.MAX_INVASION_SIZE = ${Math.round(d.maxInvasionSize)}`,
    `NDefines.NAI.INVASION_DISTANCE_RANDOMNESS = 120`,
    `NDefines.NAI.INVASION_COASTAL_PROVS_PER_ORDER = 8`,
    `NDefines.NAI.NAVAL_INVASION_PLAN_CAP = 3`,
    '',
    '-- ============================================================================',
    '-- 4. ОПТИМИЗАЦИЯ ПОЗДНЕЙ ИГРЫ И СОЮЗНЫЕ ЭКСПЕДИЦИИ',
    '-- ============================================================================',
    `NDefines.NAI.DIPLOMACY_SEND_EXPEDITIONARY_BASE = ${t.minorAntiLag ? 12 : 35}`,
    `NDefines.NAI.GARRISON_FRACTION = 0.14`,
    `NDefines.NAI.AREA_DEFENSE_SETTING_BASE = 1.35`,
    `NDefines.NAI.SUPPLY_DISTRIBUTION_PRIORITY = 1.85`,
  ];

  return [
    '-- Железная Доктрина: Умный ИИ (Iron Doctrine Improved AI)',
    `-- Пресет: ${config.preset.toUpperCase()} | Версия игры: ${config.supportedVersion}`,
    '-- Сгенерировано автоматически для Hearts of Iron IV',
    '',
    ...frontLines,
    ...prodLines,
    '',
  ].join('\n');
}

function renderTemplateBlock(spec: DivisionTemplateSpec, prio: number, targetWidth: number): string {
  const supportLines = spec.support.map((s) => `\t\t\t\t${s.type} = 1`).join('\n');
  const regimentLines = spec.regiments.map((r) => `\t\t\t\t${r.type} = ${r.count}`).join('\n');

  return [
    `\t${spec.id}_iron_doctrine = {`,
    `\t\tupgrade_prio = {`,
    `\t\t\tfactor = ${prio}`,
    `\t\t}`,
    `\t\ttarget_width = ${targetWidth}`,
    `\t\twidth_weight = 3.0`,
    `\t\tcolumn_swap_factor = 0.5`,
    `\t\ttarget_template = {`,
    `\t\t\tsupport = {`,
    supportLines,
    `\t\t\t}`,
    `\t\t\tregiments = {`,
    regimentLines,
    `\t\t\t}`,
    `\t\t}`,
    `\t\treplace_at_match = 0.4`,
    `\t\treplace_with = ${spec.id}_iron_doctrine`,
    `\t\ttarget_min_match = 0.5`,
    `\t}`,
  ].join('\n');
}

function generateInfantryTemplates(config: ModConfig): string {
  const templates = buildDivisionTemplates(config.infantryMeta, config.armorMeta);
  const line = templates.find((t) => t.id === 'line_infantry')!;
  const shock = templates.find((t) => t.id === 'shock_infantry')!;
  const garrison = templates.find((t) => t.id === 'coastal_garrison')!;
  const mtn = templates.find((t) => t.id === 'mountaineers')!;

  const lineWidth = line.regiments.reduce((s, r) => s + r.count * r.width, 0);

  if (!config.toggles.metaTemplates) {
    return '# Модуль мета-шаблонов отключён пользователем.\n';
  }

  return [
    '# Железная Доктрина: Мета-шаблоны пехоты, гарнизонов и горнострелков',
    `# Выбранная ширина линейной пехоты: ${config.infantryMeta}`,
    '',
    'infantry_iron_doctrine = {',
    '\trole = infantry',
    '\tupgrade_prio = {',
    '\t\tfactor = 4.0',
    '\t}',
    renderTemplateBlock(line, 5.0, lineWidth),
    renderTemplateBlock(shock, 3.0, 27),
    '}',
    '',
    'garrison_iron_doctrine = {',
    '\trole = garrison',
    '\tupgrade_prio = {',
    '\t\tfactor = 3.0',
    '\t}',
    renderTemplateBlock(garrison, 4.0, 10),
    '}',
    '',
    'mountaineers_iron_doctrine = {',
    '\trole = mountaineers',
    '\tupgrade_prio = {',
    '\t\tfactor = 3.5',
    '\t}',
    renderTemplateBlock(mtn, 4.0, 25),
    '}',
    '',
  ].join('\n');
}

function generateArmorTemplates(config: ModConfig): string {
  const templates = buildDivisionTemplates(config.infantryMeta, config.armorMeta);
  const armor = templates.find((t) => t.id === 'medium_armor')!;
  const motorized = templates.find((t) => t.id === 'motorized_exploit')!;
  const armorWidth = armor.regiments.reduce((s, r) => s + r.count * r.width, 0);

  if (!config.toggles.metaTemplates) {
    return '# Модуль танковых мета-шаблонов отключён пользователем.\n';
  }

  return [
    '# Железная Доктрина: Танковые дивизии прорыва и моторизованные части',
    `# Выбранная ширина танковой дивизии: ${config.armorMeta} (с организацией > 30)`,
    '',
    'armor_iron_doctrine = {',
    '\trole = armor',
    '\tupgrade_prio = {',
    '\t\tfactor = 6.0',
    '\t\tmodifier = {',
    '\t\t\tfactor = 2.0',
    '\t\t\tnum_of_military_factories > 35',
    '\t\t}',
    '\t}',
    renderTemplateBlock(armor, 6.0, armorWidth),
    '}',
    '',
    'mobile_iron_doctrine = {',
    '\trole = mobile',
    '\tupgrade_prio = {',
    '\t\tfactor = 3.5',
    '\t}',
    renderTemplateBlock(motorized, 4.0, 18),
    '}',
    '',
  ].join('\n');
}

function generateEquipmentDesigns(config: ModConfig): string {
  if (!config.toggles.metaDesigners) {
    return '# Модуль умных конструкторов NSB/BBA/MtG отключён пользователем.\n';
  }

  return [
    '# Железная Доктрина: Умные конструкторы техники (NSB Танки / BBA Авиация / MtG Флот)',
    '# Устраняет выпуск бесполезных бипланов с 1 пулемётом и танков с 40% надёжностью.',
    '',
    'iron_doctrine_medium_tank_design = {',
    '\tcategory = land',
    '\troles = { land_medium_tank }',
    '\tpriority = {',
    '\t\tfactor = 80',
    '\t}',
    '\tiron_medium_breakthrough_1940 = {',
    '\t\tpriority = {',
    '\t\t\tfactor = 100',
    '\t\t}',
    '\t\ttarget_variant = {',
    '\t\t\tmatch_value = 4000',
    '\t\t\ttype = medium_tank_chassis_1',
    '\t\t\tmodules = {',
    '\t\t\t\tmain_armament_slot = { any_of = { tank_medium_howitzer tank_medium_cannon_2 tank_medium_cannon } }',
    '\t\t\t\tturret_type_slot = tank_medium_three_man_tank_turret',
    '\t\t\t\tsuspension_type_slot = tank_christie_suspension',
    '\t\t\t\tarmor_type_slot = tank_welded_armor',
    '\t\t\t\tengine_type_slot = tank_gasoline_engine',
    '\t\t\t\tspecial_type_slot_1 = tank_radio_2',
    '\t\t\t\tspecial_type_slot_2 = sloped_armor',
    '\t\t\t\tspecial_type_slot_3 = wet_ammo_storage',
    '\t\t\t}',
    '\t\t\tupgrades = {',
    '\t\t\t\ttank_nsb_engine_upgrade = 8',
    '\t\t\t\ttank_nsb_armor_upgrade = 6',
    '\t\t\t}',
    '\t\t}',
    '\t}',
    '}',
    '',
    'iron_doctrine_meta_fighter = {',
    '\tcategory = air',
    '\troles = { air_fighter }',
    '\tpriority = {',
    '\t\tfactor = 120',
    '\t}',
    '\tiron_fighter_hmg_1940 = {',
    '\t\tpriority = {',
    '\t\t\tfactor = 150',
    '\t\t}',
    '\t\ttarget_variant = {',
    '\t\t\tmatch_value = 5000',
    '\t\t\ttype = small_plane_airframe_2',
    '\t\t\tmodules = {',
    '\t\t\t\tfixed_main_weapon_slot = heavy_mg_4x',
    '\t\t\t\tfixed_auxiliary_weapon_slot_1 = heavy_mg_4x',
    '\t\t\t\tengine_type_slot = engine_3_1x',
    '\t\t\t\tspecial_type_slot_1 = self_sealing_fuel_tanks_small',
    '\t\t\t\tspecial_type_slot_2 = armor_plate_small',
    '\t\t\t\tspecial_type_slot_3 = drop_tanks',
    '\t\t\t}',
    '\t\t}',
    '\t}',
    '}',
    '',
    'iron_doctrine_meta_cas = {',
    '\tcategory = air',
    '\troles = { air_cas }',
    '\tpriority = {',
    '\t\tfactor = 95',
    '\t}',
    '\tiron_cas_dive_1940 = {',
    '\t\tpriority = {',
    '\t\t\tfactor = 110',
    '\t\t}',
    '\t\ttarget_variant = {',
    '\t\t\tmatch_value = 4200',
    '\t\t\ttype = small_plane_cas_airframe_2',
    '\t\t\tmodules = {',
    '\t\t\t\tfixed_main_weapon_slot = heavy_bomb_locks',
    '\t\t\t\tfixed_auxiliary_weapon_slot_1 = bomb_locks',
    '\t\t\t\tengine_type_slot = engine_3_1x',
    '\t\t\t\tspecial_type_slot_1 = dive_brakes_small',
    '\t\t\t\tspecial_type_slot_2 = self_sealing_fuel_tanks_small',
    '\t\t\t\tspecial_type_slot_3 = drop_tanks',
    '\t\t\t}',
    '\t\t}',
    '\t}',
    '}',
    '',
    'iron_doctrine_asw_destroyer = {',
    '\tcategory = naval',
    '\troles = { naval_screen }',
    '\tpriority = {',
    '\t\tfactor = 70',
    '\t}',
    '\tiron_dd_escort_1940 = {',
    '\t\tpriority = {',
    '\t\t\tfactor = 90',
    '\t\t}',
    '\t\ttarget_variant = {',
    '\t\t\tmatch_value = 3000',
    '\t\t\ttype = ship_hull_light_2',
    '\t\t\tmodules = {',
    '\t\t\t\tfixed_ship_battery_slot = ship_light_battery_2',
    '\t\t\t\tfixed_ship_anti_air_slot = ship_anti_air_2',
    '\t\t\t\tfixed_ship_fire_control_system_slot = ship_sonar_2',
    '\t\t\t\tfixed_ship_engine_slot = light_ship_engine_2',
    '\t\t\t\tmid_1_custom_slot = ship_depth_charge_2',
    '\t\t\t\trear_1_custom_slot = ship_depth_charge_2',
    '\t\t\t}',
    '\t\t}',
    '\t}',
    '}',
    '',
  ].join('\n');
}

function generateGlobalStrategy(config: ModConfig): string {
  const civYear = config.defines.civToMilYear;
  const minorCap = config.defines.minorDivisionCap;
  const airWeight = Math.round(config.defines.airSuperiorityFocus * 35);

  const antiLagBlock = config.toggles.minorAntiLag
    ? [
        'iron_doctrine_minor_anti_lag_limiter = {',
        '\tenable = {',
        '\t\tis_major = no',
        '\t\thas_war = no',
        '\t\tnum_of_factories < 18',
        `\t\tnum_divisions > ${minorCap}`,
        '\t\tNOT = { has_global_flag = iron_doctrine_disable_antilag }',
        '\t}',
        '\tabort_when_not_enabled = yes',
        '\tai_strategy = {',
        '\t\ttype = build_army',
        '\t\tid = infantry',
        '\t\tvalue = -250',
        '\t}',
        '\tai_strategy = {',
        '\t\ttype = force_build_armies',
        '\t\tvalue = -300',
        '\t}',
        '}',
        '',
      ]
    : ['# Анти-лаг ограничитель миноров отключён пользователем.', ''];

  return [
    '# Железная Доктрина: Глобальная экономическая, производственная и военная логика ИИ',
    '',
    'iron_doctrine_early_civ_buildup = {',
    '\tenable = {',
    '\t\tis_major = yes',
    '\t\thas_war = no',
    `\t\tdate < ${civYear}.1.1`,
    '\t\tthreat < 0.25',
    '\t}',
    '\tabort_when_not_enabled = yes',
    '\tai_strategy = {',
    '\t\ttype = building_target',
    '\t\tid = industrial_complex',
    '\t\tvalue = 85',
    '\t}',
    '}',
    '',
    'iron_doctrine_war_economy_mil_pivot = {',
    '\tenable = {',
    '\t\tOR = {',
    `\t\t\tdate > ${civYear}.1.1`,
    '\t\t\tthreat > 0.25',
    '\t\t\thas_war = yes',
    '\t\t}',
    '\t}',
    '\tabort_when_not_enabled = yes',
    '\tai_strategy = {',
    '\t\ttype = building_target',
    '\t\tid = arms_factory',
    '\t\tvalue = 140',
    '\t}',
    '\tai_strategy = {',
    '\t\ttype = equipment_production_factor',
    '\t\tid = fighter',
    `\t\tvalue = ${airWeight}`,
    '\t}',
    '\tai_strategy = {',
    '\t\ttype = equipment_production_factor',
    '\t\tid = cas',
    `\t\tvalue = ${Math.round(airWeight * 0.75)}`,
    '\t}',
    '\tai_strategy = {',
    '\t\ttype = equipment_production_min_factories',
    '\t\tid = anti_air',
    '\t\tvalue = 2',
    '\t}',
    '\tai_strategy = {',
    '\t\ttype = equipment_production_min_factories',
    '\t\tid = artillery',
    '\t\tvalue = 3',
    '\t}',
    '}',
    '',
    'iron_doctrine_stockpile_protection = {',
    '\tenable = {',
    '\t\thas_equipment = {',
    '\t\t\tinfantry_equipment < 2500',
    '\t\t}',
    '\t}',
    '\tabort_when_not_enabled = yes',
    '\tai_strategy = {',
    '\t\ttype = equipment_production_factor',
    '\t\tid = infantry',
    '\t\tvalue = 65',
    '\t}',
    '\tai_strategy = {',
    '\t\ttype = force_build_armies',
    '\t\tvalue = -100',
    '\t}',
    '}',
    '',
    'iron_doctrine_coastal_port_garrison = {',
    '\tenable = {',
    '\t\thas_war = yes',
    '\t\tany_controlled_state = {',
    '\t\t\tis_coastal = yes',
    '\t\t}',
    '\t}',
    '\tabort_when_not_enabled = yes',
    '\tai_strategy = {',
    '\t\ttype = garrison',
    '\t\tvalue = 35',
    '\t}',
    '}',
    '',
    ...antiLagBlock,
  ].join('\n');
}

function generateMajorStrategies(config: ModConfig): string {
  const dirs = config.nationDirectives;
  const blocks: string[] = [
    '# Железная Доктрина: Индивидуальные стратегии для ключевых стран (GER, SOV, USA, ENG, JAP, ITA, FRA, CHI)',
    '',
  ];

  if (dirs.ger_atlantic_wall) {
    blocks.push(
      'iron_doctrine_ger_atlantic_wall = {',
      '\tallowed = { original_tag = GER }',
      '\tenable = {',
      '\t\thas_war_with = ENG',
      '\t\tcontrols_state = 16',
      '\t}',
      '\tabort_when_not_enabled = yes',
      '\tai_strategy = {',
      '\t\ttype = area_priority',
      '\t\tid = western_europe',
      '\t\tvalue = 85',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = garrison',
      '\t\tvalue = 45',
      '\t}',
      '}',
      ''
    );
  }

  if (dirs.ger_panzer_air_focus) {
    blocks.push(
      'iron_doctrine_ger_panzer_luftwaffe = {',
      '\tallowed = { original_tag = GER }',
      '\tenable = {',
      '\t\tdate > 1937.6.1',
      '\t}',
      '\tabort_when_not_enabled = yes',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_factor',
      '\t\tid = armor',
      '\t\tvalue = 65',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_factor',
      '\t\tid = fighter',
      '\t\tvalue = 75',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = building_target',
      '\t\tid = synthetic_refinery',
      '\t\tvalue = 18',
      '\t}',
      '}',
      ''
    );
  }

  if (dirs.sov_deep_defense_aa) {
    blocks.push(
      'iron_doctrine_sov_defense_and_t34 = {',
      '\tallowed = { original_tag = SOV }',
      '\tenable = {',
      '\t\tdate > 1938.1.1',
      '\t}',
      '\tabort_when_not_enabled = yes',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_min_factories',
      '\t\tid = anti_air',
      '\t\tvalue = 6',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_min_factories',
      '\t\tid = artillery',
      '\t\tvalue = 10',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_factor',
      '\t\tid = armor',
      '\t\tvalue = 55',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = role_ratio',
      '\t\tid = infantry',
      '\t\tvalue = 70',
      '\t}',
      '}',
      ''
    );
  }

  if (dirs.usa_industrial_overlord) {
    blocks.push(
      'iron_doctrine_usa_overlord_prep = {',
      '\tallowed = { original_tag = USA }',
      '\tenable = {',
      '\t\thas_war_with = GER',
      '\t\tENG = { has_war_with = GER }',
      '\t}',
      '\tabort_when_not_enabled = yes',
      '\tai_strategy = {',
      '\t\ttype = invade',
      '\t\tid = "GER"',
      '\t\tvalue = 120',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_factor',
      '\t\tid = fighter',
      '\t\tvalue = 80',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_factor',
      '\t\tid = strategic_bomber',
      '\t\tvalue = 40',
      '\t}',
      '}',
      ''
    );
  }

  if (dirs.eng_suez_home_air) {
    blocks.push(
      'iron_doctrine_eng_home_and_suez = {',
      '\tallowed = { original_tag = ENG }',
      '\tenable = {',
      '\t\thas_war = yes',
      '\t}',
      '\tabort_when_not_enabled = yes',
      '\tai_strategy = {',
      '\t\ttype = area_priority',
      '\t\tid = suez',
      '\t\tvalue = 110',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = area_priority',
      '\t\tid = home_islands',
      '\t\tvalue = 130',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_factor',
      '\t\tid = fighter',
      '\t\tvalue = 85',
      '\t}',
      '}',
      ''
    );
  }

  if (dirs.jap_china_logistics_home) {
    blocks.push(
      'iron_doctrine_jap_home_and_china = {',
      '\tallowed = { original_tag = JAP }',
      '\tenable = {',
      '\t\thas_war = yes',
      '\t}',
      '\tabort_when_not_enabled = yes',
      '\tai_strategy = {',
      '\t\ttype = garrison',
      '\t\tvalue = 60',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_factor',
      '\t\tid = naval_bomber',
      '\t\tvalue = 55',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_min_factories',
      '\t\tid = artillery',
      '\t\tvalue = 5',
      '\t}',
      '}',
      ''
    );
  }

  if (dirs.ita_peninsula_med) {
    blocks.push(
      'iron_doctrine_ita_med_defense = {',
      '\tallowed = { original_tag = ITA }',
      '\tenable = {',
      '\t\thas_war = yes',
      '\t}',
      '\tabort_when_not_enabled = yes',
      '\tai_strategy = {',
      '\t\ttype = garrison',
      '\t\tvalue = 75',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_factor',
      '\t\tid = naval_bomber',
      '\t\tvalue = 65',
      '\t}',
      '}',
      ''
    );
  }

  if (dirs.fra_belgian_border) {
    blocks.push(
      'iron_doctrine_fra_belgian_front = {',
      '\tallowed = { original_tag = FRA }',
      '\tenable = {',
      '\t\thas_war_with = GER',
      '\t}',
      '\tabort_when_not_enabled = yes',
      '\tai_strategy = {',
      '\t\ttype = front_unit_request',
      '\t\ttag = GER',
      '\t\tvalue = 65',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_min_factories',
      '\t\tid = anti_air',
      '\t\tvalue = 3',
      '\t}',
      '}',
      ''
    );
  }

  if (dirs.chi_river_hold) {
    blocks.push(
      'iron_doctrine_chi_defense = {',
      '\tallowed = { original_tag = CHI }',
      '\tenable = {',
      '\t\thas_war_with = JAP',
      '\t}',
      '\tabort_when_not_enabled = yes',
      '\tai_strategy = {',
      '\t\ttype = equipment_production_factor',
      '\t\tid = infantry',
      '\t\tvalue = 95',
      '\t}',
      '\tai_strategy = {',
      '\t\ttype = front_control',
      '\t\ttag = JAP',
      '\t\texecution_type = careful',
      '\t\texecute_order = no',
      '\t}',
      '}',
      ''
    );
  }

  if (blocks.length === 2) {
    blocks.push('# Все индивидуальные директивы мажоров отключены пользователем.\n');
  }

  return blocks.join('\n');
}

function generatePeaceAI(config: ModConfig): string {
  if (!config.toggles.peaceSanity) {
    return '# Модуль чистых мирных конференций отключён пользователем.\n';
  }

  return [
    '# Железная Доктрина: Здравый смысл на мирных конференциях (Анти-бордергор)',
    '# ИИ избегает случайных анклавов и предпочитает смежные провинции, корки и марионеток.',
    '',
    'peace_ai_desires = {',
    '\tiron_doctrine_prefer_cores_and_claims = {',
    '\t\tpeace_action_type = take_states',
    '\t\tenable = {',
    '\t\t\tROOT.FROM.FROM.FROM = {',
    '\t\t\t\tOR = {',
    '\t\t\t\t\tis_core_of = ROOT',
    '\t\t\t\t\tis_claimed_by = ROOT',
    '\t\t\t\t}',
    '\t\t\t}',
    '\t\t}',
    '\t\tai_desire = 220',
    '\t}',
    '',
    '\tiron_doctrine_avoid_landlocked_bordergore = {',
    '\t\tpeace_action_type = take_states',
    '\t\tenable = {',
    '\t\t\tROOT.FROM.FROM.FROM = {',
    '\t\t\t\tNOT = { is_core_of = ROOT }',
    '\t\t\t\tNOT = { is_claimed_by = ROOT }',
    '\t\t\t\tis_coastal = no',
    '\t\t\t\tNOT = {',
    '\t\t\t\t\tany_neighbor_state = {',
    '\t\t\t\t\t\tOR = {',
    '\t\t\t\t\t\t\tis_owned_by = ROOT',
    '\t\t\t\t\t\t\tpc_is_state_claimed_by = ROOT',
    '\t\t\t\t\t\t}',
    '\t\t\t\t\t}',
    '\t\t\t\t}',
    '\t\t\t}',
    '\t\t}',
    '\t\tai_desire = -450',
    '\t}',
    '',
    '\tiron_doctrine_prefer_puppet_distant = {',
    '\t\tpeace_action_type = puppet',
    '\t\tenable = {',
    '\t\t\tROOT = { is_major = yes }',
    '\t\t\tROOT.FROM.FROM.FROM = {',
    '\t\t\t\tNOT = { is_core_of = ROOT }',
    '\t\t\t\tNOT = { is_claimed_by = ROOT }',
    '\t\t\t}',
    '\t\t}',
    '\t\tai_desire = 95',
    '\t}',
    '}',
    '',
  ].join('\n');
}

function generateDecisionCategories(config: ModConfig): string {
  if (!config.toggles.inGameControlPanel) {
    return '# Внутриигровая панель решений отключена пользователем.\n';
  }

  return [
    'iron_doctrine_control_category = {',
    '\ticon = generic_army_organization',
    '\tpriority = 95',
    '\tvisible = {',
    '\t\tis_ai = no',
    '\t}',
    '}',
    '',
  ].join('\n');
}

function generateDecisions(config: ModConfig): string {
  if (!config.toggles.inGameControlPanel) {
    return '# Внутриигровые решения управления отключены пользователем.\n';
  }

  return [
    '# Железная Доктрина: Внутриигровое меню настройки ИИ прямо во время партии',
    '',
    'iron_doctrine_control_category = {',
    '\tiron_doctrine_toggle_hardcore_ai = {',
    '\t\ticon = generic_tank',
    '\t\tcost = 0',
    '\t\tavailable = {',
    '\t\t\talways = yes',
    '\t\t}',
    '\t\tcomplete_effect = {',
    '\t\t\tif = {',
    '\t\t\t\tlimit = { has_global_flag = iron_doctrine_hardcore_active }',
    '\t\t\t\tclr_global_flag = iron_doctrine_hardcore_active',
    '\t\t\t\tevery_country = {',
    '\t\t\t\t\tlimit = { is_ai = yes }',
    '\t\t\t\t\tremove_ideas = iron_doctrine_ai_logistics_assist',
    '\t\t\t\t}',
    '\t\t\t}',
    '\t\t\telse = {',
    '\t\t\t\tset_global_flag = iron_doctrine_hardcore_active',
    '\t\t\t\tevery_country = {',
    '\t\t\t\t\tlimit = { is_ai = yes is_major = yes }',
    '\t\t\t\t\tadd_ideas = iron_doctrine_ai_logistics_assist',
    '\t\t\t\t}',
    '\t\t\t}',
    '\t\t}',
    '\t\tai_will_do = {',
    '\t\t\tfactor = 0',
    '\t\t}',
    '\t}',
    '',
    '\tiron_doctrine_toggle_antilag = {',
    '\t\ticon = generic_industry',
    '\t\tcost = 0',
    '\t\tavailable = {',
    '\t\t\talways = yes',
    '\t\t}',
    '\t\tcomplete_effect = {',
    '\t\t\tif = {',
    '\t\t\t\tlimit = { has_global_flag = iron_doctrine_disable_antilag }',
    '\t\t\t\tclr_global_flag = iron_doctrine_disable_antilag',
    '\t\t\t}',
    '\t\t\telse = {',
    '\t\t\t\tset_global_flag = iron_doctrine_disable_antilag',
    '\t\t\t}',
    '\t\t}',
    '\t\tai_will_do = {',
    '\t\t\tfactor = 0',
    '\t\t}',
    '\t}',
    '}',
    '',
  ].join('\n');
}

function generateIdeas(config: ModConfig): string {
  const autoEnabled = config.toggles.hardcoreSupplyAssist;

  return [
    '# Железная Доктрина: Опциональная поддержка планирования и снабжения для хардкор-режима',
    '',
    'ideas = {',
    '\thidden_ideas = {',
    '\t\tiron_doctrine_ai_logistics_assist = {',
    '\t\t\tallowed = {',
    '\t\t\t\talways = no',
    '\t\t\t}',
    '\t\t\tallowed_civil_war = {',
    '\t\t\t\talways = yes',
    '\t\t\t}',
    '\t\t\tmodifier = {',
    '\t\t\t\tplanning_speed = 0.20',
    '\t\t\t\tsupply_consumption_factor = -0.10',
    '\t\t\t\tattrition = -0.15',
    '\t\t\t\texperience_gain_army_factor = 0.25',
    '\t\t\t}',
    '\t\t}',
    '\t}',
    '}',
    '',
    `# Стартовая активация хардкор-поддержки: ${autoEnabled ? 'ВКЛЮЧЕНА' : 'ВЫКЛЮЧЕНА (включается вручную через решения)'}`,
    '',
  ].join('\n');
}

function generateOnActions(config: ModConfig): string {
  return [
    '# Инициализация мода Железная Доктрина при старте кампании',
    '',
    'on_actions = {',
    '\ton_startup = {',
    '\t\teffect = {',
    ...(config.toggles.hardcoreSupplyAssist
      ? [
          '\t\t\tset_global_flag = iron_doctrine_hardcore_active',
          '\t\t\tevery_country = {',
          '\t\t\t\tlimit = { is_ai = yes is_major = yes }',
          '\t\t\t\tadd_ideas = iron_doctrine_ai_logistics_assist',
          '\t\t\t}',
        ]
      : [
          '\t\t\t# Базовый режим: без скрытых бонусов для ИИ',
        ]),
    '\t\t}',
    '\t}',
    '}',
    '',
  ].join('\n');
}

function generateRussianLocalisation(config: ModConfig): string {
  const bom = '\uFEFF';
  return (
    bom +
    [
      'l_russian:',
      ` iron_doctrine_control_category:0 "${config.modName}"`,
      ' iron_doctrine_control_category_desc:0 "Панель управления улучшенным ИИ прямо во время кампании. Вы можете включить или выключить хардкор-поддержку снабжения ИИ и анти-лаг ограничитель миноров без перезапуска партии."',
      ' iron_doctrine_toggle_hardcore_ai:0 "Переключить Хардкор-режим ИИ (Логистика + Планирование)"',
      ' iron_doctrine_toggle_hardcore_ai_desc:0 "Добавляет или убирает у ИИ-мажоров мягкий бонус к скорости планирования (+20%) и снижению истощения (-15%), компенсирующий ошибки микроконтроля."',
      ' iron_doctrine_toggle_antilag:0 "Переключить Анти-лаг ограничитель дивизий миноров"',
      ' iron_doctrine_toggle_antilag_desc:0 "Ограничивает бесконтрольный спам дивизий у второстепенных нейтральных стран для сохранения высокой скорости игры в 1942-1946 годах."',
      ' iron_doctrine_ai_logistics_assist:0 "Штабная координация ИИ"',
      '',
    ].join('\n')
  );
}

function generateEnglishLocalisation(): string {
  const bom = '\uFEFF';
  return (
    bom +
    [
      'l_english:',
      ' iron_doctrine_control_category:0 "Iron Doctrine: Improved AI"',
      ' iron_doctrine_control_category_desc:0 "Live in-game configuration panel for Iron Doctrine Improved AI. Toggle hardcore AI supply coordination or the minor nation anti-lag limiter mid-campaign."',
      ' iron_doctrine_toggle_hardcore_ai:0 "Toggle Hardcore AI Logistics & Planning Assist"',
      ' iron_doctrine_toggle_hardcore_ai_desc:0 "Toggles a modest planning speed (+20%) and attrition reduction (-15%) modifier for major AI nations."',
      ' iron_doctrine_toggle_antilag:0 "Toggle Minor Nation Anti-Lag Limiter"',
      ' iron_doctrine_toggle_antilag_desc:0 "Prevents neutral minor nations from spamming excessive divisions in late game."',
      ' iron_doctrine_ai_logistics_assist:0 "AI Staff Coordination"',
      '',
    ].join('\n')
  );
}

function generateReadme(config: ModConfig): string {
  return [
    `=== ${config.modName} ===`,
    `Поддерживаемая версия Hearts of Iron IV: ${config.supportedVersion}`,
    `Выбранный пресет: ${config.preset}`,
    '',
    'КАК УСТАНОВИТЬ МОД (3 ШАГА):',
    '1. Распакуйте содержимое этого архива в папку модов Paradox:',
    '   Windows: C:\\Users\\<Имя>\\Documents\\Paradox Interactive\\Hearts of Iron IV\\mod\\',
    '   Linux:   ~/.local/share/Paradox Interactive/Hearts of Iron IV/mod/',
    '   macOS:   ~/Documents/Paradox Interactive/Hearts of Iron IV/mod/',
    '',
    '2. Убедитесь, что внутри папки /mod/ лежат ОДНОВРЕМЕННО:',
    `   - файл "${config.folderName}.mod"`,
    `   - папка "${config.folderName}/" (внутри которой common/, localisation/, descriptor.mod)`,
    '',
    '3. Откройте Paradox Launcher -> Игровые наборы (Playsets) -> Добавить моды ->',
    `   включите "${config.modName}" и запускайте новую партию!`,
    '',
    'СОВМЕСТИМОСТЬ:',
    '- Не меняет карту и фокусы, поэтому совместим с большинством ванильных DLC (NSB, BBA, AAT, Götterdämmerung).',
    '- Достижения Ironman будут отключены (как и в любом моде, меняющем checksum / defines).',
    '',
  ].join('\n');
}

export function generateModFiles(config: ModConfig): GeneratedModFile[] {
  const folder = config.folderName;

  return [
    {
      path: `${folder}.mod`,
      language: 'mod',
      category: 'descriptor',
      description: 'Внешний дескриптор для Paradox Launcher (кладётся в корень папки mod/).',
      content: generateDescriptor(config, true),
    },
    {
      path: `${folder}/descriptor.mod`,
      language: 'mod',
      category: 'descriptor',
      description: 'Внутренний дескриптор внутри директории мода.',
      content: generateDescriptor(config, false),
    },
    {
      path: `${folder}/common/defines/01_iron_doctrine_ai.lua`,
      language: 'lua',
      category: 'defines',
      description: 'Ключевые константы движка: отказ от мясорубки, умные окружения, производство, авиация и десанты.',
      content: generateLuaDefines(config),
    },
    {
      path: `${folder}/common/ai_templates/iron_doctrine_infantry.txt`,
      language: 'clausewitz',
      category: 'templates',
      description: 'Мета-шаблоны линейной пехоты, штурмовых дивизий, береговых гарнизонов и горнострелков.',
      content: generateInfantryTemplates(config),
    },
    {
      path: `${folder}/common/ai_templates/iron_doctrine_armor.txt`,
      language: 'clausewitz',
      category: 'templates',
      description: 'Танковые прорывные дивизии (с нормальной оргой >30) и моторизованные части.',
      content: generateArmorTemplates(config),
    },
    {
      path: `${folder}/common/ai_equipment/iron_doctrine_tanks_air.txt`,
      language: 'clausewitz',
      category: 'equipment',
      description: 'Конструкторы NSB/BBA/MtG: средние танки, истребители с 4x HMG, штурмовики CAS и эсминцы ПЛО.',
      content: generateEquipmentDesigns(config),
    },
    {
      path: `${folder}/common/ai_strategy/iron_doctrine_global.txt`,
      language: 'clausewitz',
      category: 'strategy',
      description: 'Глобальная экономика (фабрики -> военные заводы), защита складов, гарнизоны портов и анти-лаг.',
      content: generateGlobalStrategy(config),
    },
    {
      path: `${folder}/common/ai_strategy/iron_doctrine_majors.txt`,
      language: 'clausewitz',
      category: 'strategy',
      description: 'Персональные стратегические директивы для GER, SOV, USA, ENG, JAP, ITA, FRA и CHI.',
      content: generateMajorStrategies(config),
    },
    {
      path: `${folder}/common/ai_peace/iron_doctrine_peace.txt`,
      language: 'clausewitz',
      category: 'peace',
      description: 'Весовые коэффициенты мирных конференций против «бордергора» и случайных анклавов.',
      content: generatePeaceAI(config),
    },
    {
      path: `${folder}/common/decisions/categories/iron_doctrine_categories.txt`,
      language: 'clausewitz',
      category: 'decisions',
      description: 'Категория внутриигрового меню настройки ИИ.',
      content: generateDecisionCategories(config),
    },
    {
      path: `${folder}/common/decisions/iron_doctrine_decisions.txt`,
      language: 'clausewitz',
      category: 'decisions',
      description: 'Решения для переключения хардкор-режима и анти-лага прямо в ходе партии.',
      content: generateDecisions(config),
    },
    {
      path: `${folder}/common/ideas/iron_doctrine_ideas.txt`,
      language: 'clausewitz',
      category: 'decisions',
      description: 'Опциональные скрытые модификаторы штабной координации для хардкор-режима.',
      content: generateIdeas(config),
    },
    {
      path: `${folder}/common/on_actions/iron_doctrine_on_actions.txt`,
      language: 'clausewitz',
      category: 'decisions',
      description: 'Стартовый хук инициализации параметров при запуске новой кампании.',
      content: generateOnActions(config),
    },
    {
      path: `${folder}/localisation/russian/iron_doctrine_l_russian.yml`,
      language: 'yaml',
      category: 'localisation',
      description: 'Русская локализация (UTF-8 с BOM) для меню и решений мода.',
      content: generateRussianLocalisation(config),
    },
    {
      path: `${folder}/localisation/english/iron_doctrine_l_english.yml`,
      language: 'yaml',
      category: 'localisation',
      description: 'Английская локализация (UTF-8 с BOM) на случай игры на английском языке.',
      content: generateEnglishLocalisation(),
    },
    {
      path: 'README_УСТАНОВКА.txt',
      language: 'text',
      category: 'docs',
      description: 'Пошаговая инструкция по установке архива в папку mod/ Paradox Launcher.',
      content: generateReadme(config),
    },
  ];
}
