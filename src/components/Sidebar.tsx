import {
  BookOpen,
  Code2,
  Compass,
  Flag,
  Layers,
  Shield,
  Sliders,
  X,
} from 'lucide-react';
import type { GameVersion, ValidationSummary } from '../mod/types';

export type ActiveTab =
  | 'overview'
  | 'defines'
  | 'templates'
  | 'nations'
  | 'files'
  | 'install';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  supportedVersion: GameVersion;
  onVersionChange: (version: GameVersion) => void;
  validation: ValidationSummary;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string; icon: typeof Compass }> = [
  { id: 'overview', label: 'Обзор и пресеты', icon: Compass },
  { id: 'defines', label: 'Параметры ИИ', icon: Sliders },
  { id: 'templates', label: 'Шаблоны дивизий', icon: Layers },
  { id: 'nations', label: 'Стратегии стран', icon: Flag },
  { id: 'files', label: 'Файлы мода', icon: Code2 },
  { id: 'install', label: 'Установка', icon: BookOpen },
];

const VERSIONS: GameVersion[] = ['1.15.*', '1.14.*', '1.16.*'];

export function Sidebar({
  activeTab,
  onSelectTab,
  supportedVersion,
  onVersionChange,
  validation,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const sidebarBody = (
    <div className="flex h-full flex-col bg-[#12161d] border-r border-[#232b37]">
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#232b37]">
        <div className="flex items-center gap-2.5 min-w-0">
          <Shield className="h-5 w-5 text-[#d49b35] shrink-0" aria-hidden="true" />
          <span className="font-display text-base font-semibold tracking-tight text-[#f0f3f7] whitespace-nowrap truncate">
            Железная Доктрина
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Закрыть меню навигации"
          className="lg:hidden rounded-md p-1.5 text-[#8e98a8] hover:bg-[#1c232e] hover:text-[#e6eaf0] focus-visible:outline-2 focus-visible:outline-[#d49b35]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Разделы конфигурации мода" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#d49b35] ${
                active
                  ? 'bg-[#1d2430] text-[#f5f7fa]'
                  : 'text-[#9aa4b5] hover:bg-[#171c25] hover:text-[#e6eaf0]'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${active ? 'text-[#d49b35]' : 'text-[#747f92]'}`}
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-[#232b37] space-y-4">
        <div>
          <label
            htmlFor="hoi4-version-select"
            className="block text-xs font-medium text-[#8e98a8] mb-1.5"
          >
            Версия Hearts of Iron IV
          </label>
          <select
            id="hoi4-version-select"
            value={supportedVersion}
            onChange={(e) => onVersionChange(e.target.value as GameVersion)}
            className="w-full rounded-md bg-[#181e28] border border-[#2a3342] px-3 py-2 text-sm text-[#e6eaf0] font-mono tabular-nums focus:border-[#d49b35] focus:outline-none"
          >
            {VERSIONS.map((v) => (
              <option key={v} value={v}>
                HOI4 {v}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#8e98a8] space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="whitespace-nowrap">Файлов в сборке</span>
            <span className="font-mono tabular-nums text-[#d8dee8] whitespace-nowrap">
              {validation.checkedFiles}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="whitespace-nowrap">Синтаксис</span>
            <span
              className={`font-medium whitespace-nowrap ${
                validation.valid ? 'text-[#4ade80]' : 'text-[#f87171]'
              }`}
            >
              {validation.valid ? '0 ошибок' : `Ошибок: ${validation.errors.length}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarBody}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">{sidebarBody}</div>
        </div>
      )}
    </>
  );
}
