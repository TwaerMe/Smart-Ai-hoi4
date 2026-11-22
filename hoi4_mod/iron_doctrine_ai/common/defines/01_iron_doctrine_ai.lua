-- Железная Доктрина: Умный ИИ (Iron Doctrine Improved AI)
-- Пресет: BALANCED | Версия игры: 1.15.*
-- Сгенерировано автоматически для Hearts of Iron IV

-- ============================================================================
-- 1. ФРОНТ, БАТЛПЛАНЫ И ОТКАЗ ОТ МЯСОРУБКИ (STOP MEATGRINDER & SHUFFLING)
-- ============================================================================
NDefines.NAI.PLAN_ATTACK_MIN_ORG_FACTOR_LOW = 0.55          -- Ванилла: 0.25 (ИИ больше не атакует с пустой оргой)
NDefines.NAI.PLAN_ATTACK_MIN_ORG_FACTOR_MED = 0.67          -- Ванилла: 0.45
NDefines.NAI.PLAN_ATTACK_MIN_ORG_FACTOR_HIGH = 0.77         -- Ванилла: 0.60
NDefines.NAI.PLAN_ATTACK_MIN_STRENGTH_FACTOR_LOW = 0.72     -- Ванилла: 0.40 (стоп атак без снаряжения)
NDefines.NAI.PLAN_ATTACK_MIN_STRENGTH_FACTOR_MED = 0.82     -- Ванилла: 0.60
NDefines.NAI.PLAN_ATTACK_MIN_STRENGTH_FACTOR_HIGH = 0.90    -- Ванилла: 0.75
NDefines.NAI.ATTACK_HEAVILY_DEFENDED_LIMIT = 0.52          -- Ванилла: 1.0 (не биться лбом о форты и горы)
NDefines.NAI.MIN_PLAN_VALUE_TO_MICRO_INACTIVE = 0.25
NDefines.NAI.MAX_MICRO_ATTACKS_PER_ORDER = 4
NDefines.NAI.ORG_UNIT_STRONG = 0.78
NDefines.NAI.ORG_UNIT_WEAK = 0.38
NDefines.NAI.STR_UNIT_STRONG = 0.82
NDefines.NAI.STR_UNIT_WEAK = 0.45

-- Анти-суета на фронте (убираем постоянное перебрасывание по ЖД туда-сюда)
NDefines.NAI.FRONT_REASSIGN_DISTANCE = 252
NDefines.NAI.FRONTLINE_REASSIGN_PENALTY = 2.80
NDefines.NAI.UNIT_ASSIGNMENT_TERRAIN_IMPORTANCE = 8.0
NDefines.NAI.MAX_DISTANCE_NAL_INVASION = 400.0

-- Приоритет окружений, котлов и танковых клиньев
NDefines.NAI.ENCIRCLEMENT_PRIORITY = 2.10
NDefines.NAI.POCKET_DESTRUCTION_PRIORITY = 2.63
NDefines.NAI.BREAKTHROUGH_PRIORITY_BONUS = 1.89
NDefines.NAI.SPEARHEAD_REASSIGN_PENALTY = 3.2
NDefines.NAI.PLAN_FACTION_STRONG_TO_EXECUTE = 0.62
NDefines.NAI.PLAN_FACTION_WEAK_TO_ABORT = 0.48

-- ============================================================================
-- 2. ПРОИЗВОДСТВО, ШАБЛОНЫ И ЗАПРЕТ НА СПАМ ГОЛЫХ ДИВИЗИЙ
-- ============================================================================
NDefines.NAI.DEPLOY_MIN_EQUIPMENT_SURPLUS_FOR_DEPLOYMENT = 0.25  -- Не развёртывать дивизии при дефиците склада
NDefines.NAI.TRAINING_MIN_EQUIPMENT_FACTOR = 0.82
NDefines.NAI.DIVISION_UPGRADE_MIN_XP = 15
NDefines.NAI.DIVISION_CREATE_MIN_XP = 45
NDefines.NAI.VARIANT_UPGRADE_MIN_XP = 35
NDefines.NAI.UPGRADE_XP_RUSH_UPDATE = 140
NDefines.NAI.PRODUCTION_EQUIPMENT_SURPLUS_FACTOR = 0.35
NDefines.NAI.WANTED_UNITS_MANPOWER_DIVISOR = 26000
NDefines.NAI.MIN_MANPOWER_TO_TRAIN = 25000
NDefines.NAI.DAYS_BETWEEN_CHECK_IN_THEATERS = 7
NDefines.NAI.TRADE_SCORE_MULTIPLIER = 1.45
NDefines.NAI.RESEARCH_AHEAD_OF_TIME_FACTOR = 1.65
NDefines.NAI.RESEARCH_BONUS_FACTOR = 4.2

-- ============================================================================
-- 3. АВИАЦИЯ, ФЛОТ И МОРСКИЕ ВЫСАДКИ
-- ============================================================================
NDefines.NAI.AIR_SUPERIORITY_PRIORITY = 2.45
NDefines.NAI.CAS_PRIORITY = 2.19
NDefines.NAI.STRATEGIC_BOMBING_PRIORITY = 1.22
NDefines.NAI.NAVAL_MISSION_MIN_FLEET_SIZE = 8
NDefines.NAI.MAX_INVASION_SIZE = 16
NDefines.NAI.INVASION_DISTANCE_RANDOMNESS = 120
NDefines.NAI.INVASION_COASTAL_PROVS_PER_ORDER = 8
NDefines.NAI.NAVAL_INVASION_PLAN_CAP = 3

-- ============================================================================
-- 4. ОПТИМИЗАЦИЯ ПОЗДНЕЙ ИГРЫ И СОЮЗНЫЕ ЭКСПЕДИЦИИ
-- ============================================================================
NDefines.NAI.DIPLOMACY_SEND_EXPEDITIONARY_BASE = 12
NDefines.NAI.GARRISON_FRACTION = 0.14
NDefines.NAI.AREA_DEFENSE_SETTING_BASE = 1.35
NDefines.NAI.SUPPLY_DISTRIBUTION_PRIORITY = 1.85
