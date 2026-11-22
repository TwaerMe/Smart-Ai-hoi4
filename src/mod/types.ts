export type PresetId = 'balanced' | 'meta' | 'performance';

export type GameVersion = '1.15.*' | '1.14.*' | '1.16.*';

export type InfantryWidthMeta = '18w' | '21w' | '24w';

export type ArmorWidthMeta = '30w' | '36w';

export type NationTag = 'GER' | 'SOV' | 'USA' | 'ENG' | 'JAP' | 'ITA' | 'FRA' | 'CHI';

export interface DefinesConfig {
  /** Minimum org factor for AI to launch battleplan attacks (Vanilla: 0.25) */
  planAttackMinOrg: number;
  /** Minimum strength factor before halting meatgrinder attacks (Vanilla: 0.40) */
  planAttackMinStrength: number;
  /** Resistance threshold before aborting attacks into forts/mountains (Vanilla: 1.0) */
  attackHeavilyDefendedLimit: number;
  /** Frontline unit shuffle penalty to stop railroad chaos (Vanilla: 1.0) */
  frontReassignPenalty: number;
  /** Encirclement & pocket destruction weight multiplier (Vanilla: 1.0) */
  encirclementPriority: number;
  /** Minimum equipment stockpile ratio before deploying new divisions (Vanilla: 0.05) */
  deployMinEquipmentSurplus: number;
  /** Air superiority & CAS focus multiplier (Vanilla: 1.0) */
  airSuperiorityFocus: number;
  /** Naval invasion max divisions per wave (Vanilla: 10) */
  maxInvasionSize: number;
  /** Year month threshold for major CIV -> MIL pivot (e.g. 1938) */
  civToMilYear: number;
  /** Minor nation division cap for late-game performance */
  minorDivisionCap: number;
}

export interface ModuleToggles {
  smartFrontline: boolean;
  metaTemplates: boolean;
  metaDesigners: boolean;
  peaceSanity: boolean;
  minorAntiLag: boolean;
  inGameControlPanel: boolean;
  hardcoreSupplyAssist: boolean;
}

export interface NationDirective {
  id: string;
  tag: NationTag;
  title: string;
  description: string;
  enabled: boolean;
  strategyType: string;
  snippetSummary: string;
}

export interface ModConfig {
  modName: string;
  folderName: string;
  supportedVersion: GameVersion;
  preset: PresetId;
  infantryMeta: InfantryWidthMeta;
  armorMeta: ArmorWidthMeta;
  defines: DefinesConfig;
  toggles: ModuleToggles;
  nationDirectives: Record<string, boolean>;
}

export interface GeneratedModFile {
  path: string;
  language: 'lua' | 'clausewitz' | 'yaml' | 'mod' | 'text';
  category: 'descriptor' | 'defines' | 'templates' | 'equipment' | 'strategy' | 'peace' | 'decisions' | 'localisation' | 'docs';
  description: string;
  content: string;
}

export interface FileValidationIssue {
  filePath: string;
  severity: 'error' | 'warning';
  line?: number;
  message: string;
}

export interface ValidationSummary {
  valid: boolean;
  checkedFiles: number;
  totalLines: number;
  errors: FileValidationIssue[];
  warnings: FileValidationIssue[];
}

export interface DivisionTemplateSpec {
  id: string;
  name: string;
  role: string;
  clausewitzRole: string;
  regiments: Array<{ type: string; label: string; count: number; width: number; org: number }>;
  support: Array<{ type: string; label: string }>;
  notes: string;
}

export interface ComputedTemplateStats {
  combatWidth: number;
  battalionCount: number;
  supportCount: number;
  estimatedOrg: number;
  isMetaWidth: boolean;
}
