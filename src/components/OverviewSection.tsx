import { useState } from 'react';
import { ArrowRight, Check, Download, ShieldAlert } from 'lucide-react';
import {
  NATION_DIRECTIVES,
  PRESETS,
  VANILLA_DEFINES_BASELINE,
} from '../mod/presets';
import type { ModConfig, PresetId, ValidationSummary } from '../mod/types';
import type { ActiveTab } from './Sidebar';
import bannerImg from '../assets/images/hoi4_staff_map_banner_1795331123202.jpg';

const BANNER_IMAGE_PATH = bannerImg;

interface OverviewSectionProps {
  config: ModConfig;
  validation: ValidationSummary;
  onSelectPreset: (preset: PresetId) => void;
  onNavigate: (tab: ActiveTab) => void;
  onExportZip: () => void;
  isExporting: boolean;
}

export function OverviewSection({
  config,
  validation,
  onSelectPreset,
  onNavigate,
  onExportZip,
  isExporting,
}: OverviewSectionProps) {
  const [imageError, setImageError] = useState(false);

  const activeDirectivesCount = Object.values(config.nationDirectives).filter(Boolean).length;

  const comparisonRows = [
    {
      area: 'Атаки по батлпланам',
      vanilla: `Бьётся до ${Math.round(VANILLA_DEFINES_BASELINE.planAttackMinOrg * 100)}% орги и ${Math.round(VANILLA_DEFINES_BASELINE.planAttackMinStrength * 100)}% силы`,
      modded: `Стоп при < ${Math.round(config.defines.planAttackMinOrg * 100)}% орги и < ${Math.round(config.defines.planAttackMinStrength * 100)}% силы`,
      effect: 'Прекращает бессмысленный слив людей и винтовок',
    },
    {
      area: 'Переброска дивизий по фронту',
      vanilla: `Штраф переназначения ${VANILLA_DEFINES_BASELINE.frontReassignPenalty.toFixed(1)}`,
      modded: `Штраф ${config.defines.frontReassignPenalty.toFixed(1)} · дистанция ×${config.defines.frontReassignPenalty.toFixed(1)}`,
      effect: 'Убирает хаотичную катавасию по железным дорогам',
    },
    {
      area: 'Окружения и котлы',
      vanilla: `Приоритет ${VANILLA_DEFINES_BASELINE.encirclementPriority.toFixed(1)}`,
      modded: `Приоритет ${config.defines.encirclementPriority.toFixed(1)} (добивание котлов ${(config.defines.encirclementPriority * 1.25).toFixed(2)})`,
      effect: 'Танки и мотопехота закрывают прорывы, а не стоят',
    },
    {
      area: 'Шаблоны дивизий',
      vanilla: 'Случайные 14w / кавалерия + ПТ',
      modded: `Пехота ${config.infantryMeta}, танки ${config.armorMeta} (>30 орги), порты 10w`,
      effect: 'Реальная боеспособность без пустого расхода опыта',
    },
    {
      area: 'Авиация и танки (NSB / BBA)',
      vanilla: 'Бипланы с 1 пулемётом и танки без радио',
      modded: 'Истребители 4×HMG, пикирующие CAS, надёжные средние танки',
      effect: 'ИИ реально борется за воздух и пробивает оборону',
    },
    {
      area: 'Мирные конференции и FPS',
      vanilla: 'Анклавы в Сибири · 80 дивизий у Сальвадора',
      modded: config.toggles.minorAntiLag
        ? `Анти-бордергор · лимит миноров ≤ ${config.defines.minorDivisionCap} див.`
        : 'Анти-бордергор · без лимита миноров',
      effect: 'Аккуратные границы и выше скорость игры в 1943+',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner with Operational Map */}
      <section className="relative overflow-hidden rounded-xl border border-[#232b37] bg-[#151a22]">
        <div className="relative min-h-[260px] lg:min-h-[290px] flex flex-col justify-end p-6 sm:p-8">
          {!imageError ? (
            <img
              src={BANNER_IMAGE_PATH}
              alt="Оперативная штабная карта Европы с тактическими обозначениями"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#1b222d] via-[#131820] to-[#0e1116]"
              aria-hidden="true"
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0e1116] via-[#0e1116]/75 to-[#0e1116]/30"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl space-y-3">
            <p className="text-xs font-medium text-[#d49b35]">
              Hearts of Iron IV {config.supportedVersion} · Готовый пакет модификации
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#f5f7fa] [text-wrap:balance]">
              {config.modName}
            </h1>
            <p className="text-sm sm:text-base text-[#c3cbd8] leading-relaxed max-w-2xl">
              Полная переработка поведения ИИ без костылей: прекращает самоубийственные штурмы,
              собирает рабочие мета-дивизии, проектирует адекватные танки и истребители, охраняет
              порты и наводит порядок на мирных конференциях.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onExportZip}
                disabled={isExporting || !validation.valid}
                className="inline-flex items-center gap-2 rounded-lg bg-[#d49b35] px-5 py-2.5 text-sm font-semibold text-[#111419] hover:bg-[#e1aa45] disabled:opacity-50 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d49b35]"
              >
                <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{isExporting ? 'Сборка архива...' : 'Скачать готовый мод (.zip)'}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('files')}
                className="inline-flex items-center gap-2 rounded-lg border border-[#323d4e] bg-[#151a22]/90 px-4 py-2.5 text-sm font-medium text-[#e6eaf0] hover:bg-[#1e2531] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#d49b35]"
              >
                <span>Посмотреть код скриптов</span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column Key Facts Strip */}
      <section aria-label="Сводка текущей сборки мода" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[#232b37] bg-[#151a22] p-4">
          <p className="text-xs text-[#8e98a8]">Файлов в архиве</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#f0f3f7]">
            {validation.checkedFiles}
          </p>
          <p className="mt-1 text-xs text-[#758094]">defines · templates · strategies · yml</p>
        </div>

        <div className="rounded-lg border border-[#232b37] bg-[#151a22] p-4">
          <p className="text-xs text-[#8e98a8]">Строк Clausewitz / Lua</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#f0f3f7]">
            {validation.totalLines}
          </p>
          <p className="mt-1 text-xs text-[#758094]">Готовый код без заглушек</p>
        </div>

        <div className="rounded-lg border border-[#232b37] bg-[#151a22] p-4">
          <p className="text-xs text-[#8e98a8]">Директив мажоров</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#f0f3f7]">
            {activeDirectivesCount} / {NATION_DIRECTIVES.length}
          </p>
          <p className="mt-1 text-xs text-[#758094]">GER · SOV · USA · ENG · JAP · ITA · FRA · CHI</p>
        </div>

        <div className="rounded-lg border border-[#232b37] bg-[#151a22] p-4">
          <p className="text-xs text-[#8e98a8]">Валидация синтаксиса</p>
          <p
            className={`mt-1 font-display text-2xl font-semibold ${
              validation.valid ? 'text-[#4ade80]' : 'text-[#f87171]'
            }`}
          >
            {validation.valid ? 'Пройдена' : 'Есть ошибки'}
          </p>
          <p className="mt-1 text-xs text-[#758094]">
            Скобки, Lua и UTF-8 BOM проверены
          </p>
        </div>
      </section>

      {/* Preset Selector */}
      <section aria-labelledby="presets-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 id="presets-heading" className="font-display text-xl font-semibold text-[#f0f3f7]">
              Выберите профиль интеллекта ИИ
            </h2>
            <p className="text-sm text-[#8e98a8] mt-1">
              Пресет мгновенно пересчитывает все Lua-константы, шаблоны дивизий и стратегии.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('defines')}
            className="text-sm font-medium text-[#d49b35] hover:text-[#e6b252] self-start sm:self-auto whitespace-nowrap"
          >
            Тонкая настройка параметров →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(Object.keys(PRESETS) as PresetId[]).map((presetKey) => {
            const preset = PRESETS[presetKey];
            const selected = config.preset === presetKey;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                aria-pressed={selected}
                className={`flex flex-col justify-between h-full text-left rounded-lg border p-5 transition-colors focus-visible:outline-2 focus-visible:outline-[#d49b35] ${
                  selected
                    ? 'border-[#d49b35] bg-[#1b2029]'
                    : 'border-[#232b37] bg-[#151a22] hover:border-[#354052] hover:bg-[#181e28]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-semibold text-[#f0f3f7]">
                        {preset.name}
                      </h3>
                      <p className="text-xs text-[#9aa4b5] mt-1">{preset.subtitle}</p>
                    </div>
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? 'border-[#d49b35] bg-[#d49b35] text-[#111419]'
                          : 'border-[#3a4557]'
                      }`}
                      aria-hidden="true"
                    >
                      {selected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-[#b4bece] leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#232b37] flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono tabular-nums text-[#8e98a8]">
                  <span>Пехота {preset.infantryMeta}</span>
                  <span aria-hidden="true">·</span>
                  <span>Танки {preset.armorMeta}</span>
                  <span aria-hidden="true">·</span>
                  <span>Мин. орга {Math.round(preset.defines.planAttackMinOrg * 100)}%</span>
                  <span aria-hidden="true">·</span>
                  <span>Лимит миноров {preset.defines.minorDivisionCap}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Vanilla vs Modded Comparison Table */}
      <section aria-labelledby="diff-table-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="diff-table-heading" className="font-display text-xl font-semibold text-[#f0f3f7]">
              Что именно исправлено по сравнению с ваниллой
            </h2>
            <p className="text-sm text-[#8e98a8] mt-1">
              Реальные значения текущей конфигурации, которые попадут в файлы мода.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#232b37] bg-[#151a22]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#232b37] text-xs font-medium text-[#8e98a8]">
                <th className="py-3 px-4">Подсистема ИИ</th>
                <th className="py-3 px-4">Ванильный HOI4</th>
                <th className="py-3 px-4">Железная Доктрина</th>
                <th className="py-3 px-4">Результат в игре</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2632] text-sm">
              {comparisonRows.map((row) => (
                <tr key={row.area} className="hover:bg-[#19202b] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#e6eaf0]">{row.area}</td>
                  <td className="py-3 px-4 text-[#94a0b2] font-mono text-xs tabular-nums">
                    {row.vanilla}
                  </td>
                  <td className="py-3 px-4 text-[#e9c478] font-mono text-xs tabular-nums">
                    {row.modded}
                  </td>
                  <td className="py-3 px-4 text-[#c3cbd8]">{row.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!validation.valid && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-[#7f1d1d] bg-[#2a1417] p-4 text-sm text-[#fecaca]"
          >
            <ShieldAlert className="h-5 w-5 text-[#f87171] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Обнаружены ошибки в конфигурации мода</p>
              <p className="text-xs mt-1 text-[#fca5a5]">
                Откройте вкладку «Файлы мода» для просмотра деталей перед экспортом архива.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
