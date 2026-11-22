import { RotateCcw } from 'lucide-react';
import { VANILLA_DEFINES_BASELINE } from '../mod/presets';
import type { DefinesConfig, GeneratedModFile, ModConfig, ModuleToggles } from '../mod/types';

interface DefinesEditorProps {
  config: ModConfig;
  luaFile: GeneratedModFile | undefined;
  onUpdateDefine: <K extends keyof DefinesConfig>(key: K, value: DefinesConfig[K]) => void;
  onToggleModule: (key: keyof ModuleToggles) => void;
  onResetDefaults: () => void;
}

interface SliderSpec {
  key: keyof DefinesConfig;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  vanillaLabel: string;
}

const SLIDERS: SliderSpec[] = [
  {
    key: 'planAttackMinOrg',
    label: 'Порог организации для атаки по батлплану',
    description: 'Ниже этого значения ИИ останавливает штурм и восстанавливает организацию дивизий.',
    min: 0.3,
    max: 0.75,
    step: 0.05,
    format: (v) => `${Math.round(v * 100)}%`,
    vanillaLabel: `${Math.round(VANILLA_DEFINES_BASELINE.planAttackMinOrg * 100)}%`,
  },
  {
    key: 'planAttackMinStrength',
    label: 'Минимальная укомплектованность для наступления',
    description: 'Запрещает ИИ гнать в бой «голые» дивизии без винтовок и артиллерии.',
    min: 0.45,
    max: 0.9,
    step: 0.05,
    format: (v) => `${Math.round(v * 100)}%`,
    vanillaLabel: `${Math.round(VANILLA_DEFINES_BASELINE.planAttackMinStrength * 100)}%`,
  },
  {
    key: 'attackHeavilyDefendedLimit',
    label: 'Лимит атак в укрепрайоны и горы',
    description: 'Чем ниже число, тем неохотнее ИИ бьётся лбом о Мажино, Альпы и форты 5+ уровня.',
    min: 0.3,
    max: 0.9,
    step: 0.02,
    format: (v) => v.toFixed(2),
    vanillaLabel: VANILLA_DEFINES_BASELINE.attackHeavilyDefendedLimit.toFixed(2),
  },
  {
    key: 'frontReassignPenalty',
    label: 'Анти-суета на фронте (штраф перебросок)',
    description: 'Снижает бессмысленное катание дивизий с одного конца фронта на другой по ЖД.',
    min: 1.2,
    max: 4.5,
    step: 0.1,
    format: (v) => `×${v.toFixed(1)}`,
    vanillaLabel: `×${VANILLA_DEFINES_BASELINE.frontReassignPenalty.toFixed(1)}`,
  },
  {
    key: 'encirclementPriority',
    label: 'Приоритет котлов и танковых клиньев',
    description: 'Усиливает желание ИИ замыкать окружения и добивать попавшие в котёл дивизии.',
    min: 1.2,
    max: 3.5,
    step: 0.1,
    format: (v) => `×${v.toFixed(1)}`,
    vanillaLabel: `×${VANILLA_DEFINES_BASELINE.encirclementPriority.toFixed(1)}`,
  },
  {
    key: 'deployMinEquipmentSurplus',
    label: 'Запас снаряжения на складе перед наймом новых дивизий',
    description: 'ИИ сначала пополняет воюющие части и создаёт буфер, а только потом штампует новые.',
    min: 0.1,
    max: 0.5,
    step: 0.05,
    format: (v) => `${Math.round(v * 100)}%`,
    vanillaLabel: `${Math.round(VANILLA_DEFINES_BASELINE.deployMinEquipmentSurplus * 100)}%`,
  },
  {
    key: 'airSuperiorityFocus',
    label: 'Приоритет господства в воздухе и CAS',
    description: 'Повышает долю заводов на современные истребители и штурмовики непосредственной поддержки.',
    min: 1.0,
    max: 2.6,
    step: 0.05,
    format: (v) => `×${v.toFixed(2)}`,
    vanillaLabel: `×${VANILLA_DEFINES_BASELINE.airSuperiorityFocus.toFixed(2)}`,
  },
  {
    key: 'maxInvasionSize',
    label: 'Размер волны морской высадки',
    description: 'Увеличивает максимальное количество дивизий в одном десантном плане (D-Day, Сицилия).',
    min: 10,
    max: 28,
    step: 2,
    format: (v) => `${Math.round(v)} див.`,
    vanillaLabel: `${VANILLA_DEFINES_BASELINE.maxInvasionSize} див.`,
  },
  {
    key: 'minorDivisionCap',
    label: 'Лимит дивизий для миноров (Анти-лаг)',
    description: 'Ограничивает количество дивизий у мирных второстепенных стран для стабильного FPS.',
    min: 10,
    max: 60,
    step: 2,
    format: (v) => `${Math.round(v)} див.`,
    vanillaLabel: 'Без лимита',
  },
];

const MODULE_TOGGLES: Array<{
  key: keyof ModuleToggles;
  label: string;
  description: string;
}> = [
  {
    key: 'smartFrontline',
    label: 'Умный фронт и отказ от мясорубки',
    description: 'Перезаписывает NDefines.NAI по атакам, укрепрайонам, переброскам и котлам.',
  },
  {
    key: 'metaTemplates',
    label: 'Мета-шаблоны дивизий',
    description: 'Заставляет ИИ собирать правильную ширину фронта (18w/21w пехота, 30w/36w танки, 10w порты).',
  },
  {
    key: 'metaDesigners',
    label: 'Умные конструкторы техники (NSB / BBA / MtG)',
    description: 'Средние танки с радио и пушками, истребители 4×HMG, пикирующие CAS и эсминцы ПЛО.',
  },
  {
    key: 'peaceSanity',
    label: 'Анти-бордергор на мирных конференциях',
    description: 'Запрещает ИИ забирать случайные анклавы без выхода к морю и поощряет марионеток.',
  },
  {
    key: 'minorAntiLag',
    label: 'Ограничитель спама миноров (Анти-лаг)',
    description: 'Тормозит бесконечный найм дивизий у нейтральных стран с малым числом заводов.',
  },
  {
    key: 'inGameControlPanel',
    label: 'Внутриигровая панель решений',
    description: 'Добавляет категорию решений для переключения хардкора и анти-лага прямо в партии.',
  },
  {
    key: 'hardcoreSupplyAssist',
    label: 'Стартовая помощь логистике ИИ-мажоров',
    description: 'Скрытый мягкий бонус (+20% скорость планирования, -15% истощение) для опытных игроков.',
  },
];

export function DefinesEditor({
  config,
  luaFile,
  onUpdateDefine,
  onToggleModule,
  onResetDefaults,
}: DefinesEditorProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#f0f3f7]">
            Тонкая настройка параметров ИИ
          </h1>
          <p className="text-sm text-[#8e98a8] mt-1">
            Любое изменение ползунков и переключателей мгновенно обновляет скрипты Lua и Clausewitz.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetDefaults}
          className="inline-flex items-center gap-2 rounded-lg border border-[#2d3646] bg-[#151a22] px-4 py-2 text-sm font-medium text-[#d5dce7] hover:bg-[#1c232f] transition-colors self-start sm:self-auto whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#d49b35]"
        >
          <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Сбросить настройки</span>
        </button>
      </div>

      {/* Module Toggles */}
      <section aria-labelledby="modules-heading" className="space-y-3">
        <h2 id="modules-heading" className="font-display text-lg font-semibold text-[#f0f3f7]">
          Подключаемые модули модификации
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MODULE_TOGGLES.map((mod) => {
            const enabled = config.toggles[mod.key];
            const isFullWidth = mod.key === 'hardcoreSupplyAssist';
            return (
              <div
                key={mod.key}
                className={`flex items-start justify-between gap-4 rounded-lg border border-[#232b37] bg-[#151a22] p-4 ${
                  isFullWidth ? 'md:col-span-2' : ''
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#eef2f7]">{mod.label}</p>
                  <p className="text-xs text-[#8e98a8] mt-1 leading-relaxed">{mod.description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={mod.label}
                  onClick={() => onToggleModule(mod.key)}
                  className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d49b35] ${
                    enabled ? 'bg-[#d49b35]' : 'bg-[#2a3342]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-[#0e1116] transition-transform ${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sliders + Live Lua Preview Split */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 space-y-4">
          <h2 className="font-display text-lg font-semibold text-[#f0f3f7]">
            Константы движка (NDefines.NAI)
          </h2>

          <div className="rounded-lg border border-[#232b37] bg-[#151a22] divide-y divide-[#1f2632]">
            {SLIDERS.map((slider) => {
              const currentVal = config.defines[slider.key];
              const inputId = `slider-${slider.key}`;
              return (
                <div key={slider.key} className="p-4 space-y-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <label
                      htmlFor={inputId}
                      className="text-sm font-medium text-[#e6eaf0]"
                    >
                      {slider.label}
                    </label>
                    <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
                      <span className="text-[#788397]">Ванилла: {slider.vanillaLabel}</span>
                      <span aria-hidden="true" className="text-[#4a5568]">
                        →
                      </span>
                      <span className="font-semibold text-[#e9c478]">
                        {slider.format(currentVal)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8e98a8]">{slider.description}</p>
                  <input
                    id={inputId}
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={currentVal}
                    onChange={(e) =>
                      onUpdateDefine(slider.key, parseFloat(e.target.value))
                    }
                    className="w-full accent-[#d49b35] cursor-pointer"
                  />
                </div>
              );
            })}

            {/* Year of CIV -> MIL pivot */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="civ-mil-year" className="text-sm font-medium text-[#e6eaf0]">
                  Год перехода мажоров с фабрик на военные заводы
                </label>
                <span className="font-mono text-xs font-semibold tabular-nums text-[#e9c478]">
                  {config.defines.civToMilYear} г.
                </span>
              </div>
              <p className="text-xs text-[#8e98a8]">
                До этого года (или до 25% мировой напряжённости) мажоры разгоняют гражданскую экономику.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[1937, 1938, 1939].map((year) => {
                  const active = config.defines.civToMilYear === year;
                  return (
                    <button
                      key={year}
                      id={year === 1938 ? 'civ-mil-year' : undefined}
                      type="button"
                      onClick={() => onUpdateDefine('civToMilYear', year)}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono tabular-nums font-medium transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-[#d49b35] text-[#111419]'
                          : 'bg-[#1c232f] text-[#b4bece] hover:bg-[#252e3d]'
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Live Lua Output Preview */}
        <div className="xl:col-span-5 space-y-3 xl:sticky xl:top-20">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-[#f0f3f7]">
              Предпросмотр Lua Defines
            </h2>
            <span className="font-mono text-xs text-[#8e98a8]">
              01_iron_doctrine_ai.lua
            </span>
          </div>
          <div className="rounded-lg border border-[#232b37] bg-[#0b0e13] overflow-hidden">
            <pre className="p-4 text-xs font-mono leading-relaxed text-[#c9d2e0] overflow-x-auto max-h-[640px] overflow-y-auto">
              <code>{luaFile?.content ?? ''}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
