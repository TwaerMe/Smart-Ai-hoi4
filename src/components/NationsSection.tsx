import { useState } from 'react';
import { NATION_DIRECTIVES, NATION_META } from '../mod/presets';
import type { GeneratedModFile, ModConfig, NationTag } from '../mod/types';

interface NationsSectionProps {
  config: ModConfig;
  majorsFile: GeneratedModFile | undefined;
  onToggleDirective: (id: string) => void;
  onToggleAllDirectives: (enabled: boolean) => void;
}

const TAG_FILTERS: Array<'ALL' | NationTag> = [
  'ALL',
  'GER',
  'SOV',
  'USA',
  'ENG',
  'JAP',
  'ITA',
  'FRA',
  'CHI',
];

export function NationsSection({
  config,
  majorsFile,
  onToggleDirective,
  onToggleAllDirectives,
}: NationsSectionProps) {
  const [selectedTag, setSelectedTag] = useState<'ALL' | NationTag>('ALL');

  const filtered =
    selectedTag === 'ALL'
      ? NATION_DIRECTIVES
      : NATION_DIRECTIVES.filter((d) => d.tag === selectedTag);

  const enabledCount = Object.values(config.nationDirectives).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#f0f3f7]">
            Индивидуальные стратегии ключевых стран
          </h1>
          <p className="text-sm text-[#8e98a8] mt-1">
            Точечные директивы `ai_strategy` устраняют типичные ошибки мажоров: пустой Атлантический
            вал, потерю Суэца и высадку в пустую Японию.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggleAllDirectives(true)}
            className="px-3 py-1.5 rounded-md border border-[#2d3646] bg-[#151a22] text-xs font-medium text-[#d5dce7] hover:bg-[#1c232f] transition-colors whitespace-nowrap"
          >
            Включить все
          </button>
          <button
            type="button"
            onClick={() => onToggleAllDirectives(false)}
            className="px-3 py-1.5 rounded-md border border-[#2d3646] bg-[#151a22] text-xs font-medium text-[#9aa4b5] hover:bg-[#1c232f] transition-colors whitespace-nowrap"
          >
            Отключить все
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Фильтр по тегу страны"
          className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#151a22] border border-[#232b37]"
        >
          {TAG_FILTERS.map((tag) => {
            const active = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#d49b35] ${
                  active
                    ? 'bg-[#d49b35] text-[#111419] font-semibold'
                    : 'text-[#9aa4b5] hover:text-[#e6eaf0]'
                }`}
              >
                {tag === 'ALL' ? 'Все страны' : `${tag} · ${NATION_META[tag].name}`}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-mono tabular-nums text-[#8e98a8]">
          Активно директив: {enabledCount} / {NATION_DIRECTIVES.length}
        </span>
      </div>

      {/* Directives + Live Strategy File Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 space-y-3">
          {filtered.map((dir) => {
            const enabled = !!config.nationDirectives[dir.id];
            const nation = NATION_META[dir.tag];
            return (
              <div
                key={dir.id}
                className="rounded-lg border border-[#232b37] bg-[#151a22] p-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#8e98a8]">
                    <span className="font-mono font-semibold text-[#e9c478]">{dir.tag}</span>
                    <span aria-hidden="true">·</span>
                    <span>{nation.name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{nation.theatre}</span>
                  </div>
                  <h2 className="font-display text-base font-semibold text-[#f0f3f7]">
                    {dir.title}
                  </h2>
                  <p className="text-sm text-[#b4bece] leading-relaxed">{dir.description}</p>
                  <p className="text-xs font-mono text-[#788397] pt-0.5">
                    {dir.strategyType} → {dir.snippetSummary}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${nation.name}: ${dir.title}`}
                  onClick={() => onToggleDirective(dir.id)}
                  className={`relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d49b35] ${
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

        <div className="xl:col-span-5 space-y-3 xl:sticky xl:top-20">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-[#f0f3f7]">
              Скрипт iron_doctrine_majors.txt
            </h2>
            <span className="text-xs font-mono text-[#8e98a8]">Clausewitz</span>
          </div>
          <div className="rounded-lg border border-[#232b37] bg-[#0b0e13] overflow-hidden">
            <pre className="p-4 text-xs font-mono leading-relaxed text-[#c9d2e0] overflow-x-auto max-h-[640px] overflow-y-auto">
              <code>{majorsFile?.content ?? ''}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
