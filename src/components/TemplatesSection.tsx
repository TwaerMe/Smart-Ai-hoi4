import { buildDivisionTemplates, computeTemplateStats } from '../mod/presets';
import type { ArmorWidthMeta, InfantryWidthMeta, ModConfig } from '../mod/types';

interface TemplatesSectionProps {
  config: ModConfig;
  onChangeInfantryMeta: (meta: InfantryWidthMeta) => void;
  onChangeArmorMeta: (meta: ArmorWidthMeta) => void;
}

const INFANTRY_OPTIONS: Array<{ value: InfantryWidthMeta; label: string; note: string }> = [
  { value: '18w', label: '18w (9 пех.)', note: 'Оптимум под все типы местности' },
  { value: '21w', label: '21w (9 пех. + 1 арт.)', note: 'Классика с усиленной атакой' },
  { value: '24w', label: '24w (9 пех. + 2 арт.)', note: 'Плотный огневой вал для мажоров' },
];

const ARMOR_OPTIONS: Array<{ value: ArmorWidthMeta; label: string; note: string }> = [
  { value: '30w', label: '30w (8 ср. танк. + 7 мото)', note: 'Сбалансированный блицкриг' },
  { value: '36w', label: '36w (10 ср. танк. + 8 мех)', note: 'Тяжёлый прорывной кулак' },
];

const EQUIPMENT_DESIGNS = [
  {
    dlc: 'No Step Back',
    name: 'Средний танк прорыва (1940)',
    chassis: 'medium_tank_chassis_1',
    modules: 'Средняя гаубица / пушка II · 3-местная башня · Радио II · Наклонная броня · Мокрая БК · Подвеска Кристи',
    purpose: 'Высокая противопехотная атака и надёжность ≥80%, вместо ванильных картонных коробок.',
  },
  {
    dlc: 'By Blood Alone',
    name: 'Истребитель господства (1940)',
    chassis: 'small_plane_airframe_2',
    modules: '2× счетверённые тяжёлые пулемёты (4×HMG) · Двигатель III · Протектированные баки · Бронеплиты · ПТБ',
    purpose: 'Реально сбивает вражескую авиацию и перестаёт штамповать бесполезные 1×LMG бипланы.',
  },
  {
    dlc: 'By Blood Alone',
    name: 'Штурмовик CAS (1940)',
    chassis: 'small_plane_cas_airframe_2',
    modules: 'Тяжёлые бомбодержатели · Тормозные щитки · Двигатель III · Протектированные баки · ПТБ',
    purpose: 'Наносит мощный урон по наземным дивизиям и поддерживает танковые прорывы.',
  },
  {
    dlc: 'Man the Guns',
    name: 'Эсминец ПЛО / эскорт (1940)',
    chassis: 'ship_hull_light_2',
    modules: 'Сонар II · 2× глубинные бомбы II · Зенитная батарея II · Лёгкое орудие II',
    purpose: 'Защищает торговые конвои союзников от тотального подводного блока.',
  },
];

export function TemplatesSection({
  config,
  onChangeInfantryMeta,
  onChangeArmorMeta,
}: TemplatesSectionProps) {
  const templates = buildDivisionTemplates(config.infantryMeta, config.armorMeta);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#f0f3f7]">
          Мета-шаблоны дивизий и конструкторы техники
        </h1>
        <p className="text-sm text-[#8e98a8] mt-1">
          ИИ перестаёт тратить опыт армии на хаотичные дивизии с кавалерией и строит сбалансированные
          боевые соединения.
        </p>
      </div>

      {/* Meta Width Controls */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#232b37] bg-[#151a22] p-5 space-y-3">
          <div>
            <h2 className="font-display text-base font-semibold text-[#f0f3f7]">
              Ширина линейной пехоты
            </h2>
            <p className="text-xs text-[#8e98a8] mt-0.5">
              Основной костяк армии, удерживающий линию фронта.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {INFANTRY_OPTIONS.map((opt) => {
              const active = config.infantryMeta === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChangeInfantryMeta(opt.value)}
                  aria-pressed={active}
                  className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#d49b35] ${
                    active
                      ? 'bg-[#d49b35] text-[#111419] font-semibold'
                      : 'bg-[#1c232f] text-[#c3cbd8] hover:bg-[#252e3d]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#9aa4b5]">
            {INFANTRY_OPTIONS.find((o) => o.value === config.infantryMeta)?.note}
          </p>
        </div>

        <div className="rounded-lg border border-[#232b37] bg-[#151a22] p-5 space-y-3">
          <div>
            <h2 className="font-display text-base font-semibold text-[#f0f3f7]">
              Ширина танковых дивизий прорыва
            </h2>
            <p className="text-xs text-[#8e98a8] mt-0.5">
              Всегда включает достаточно мото/мехпехоты для организации выше 30 ед.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ARMOR_OPTIONS.map((opt) => {
              const active = config.armorMeta === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChangeArmorMeta(opt.value)}
                  aria-pressed={active}
                  className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#d49b35] ${
                    active
                      ? 'bg-[#d49b35] text-[#111419] font-semibold'
                      : 'bg-[#1c232f] text-[#c3cbd8] hover:bg-[#252e3d]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#9aa4b5]">
            {ARMOR_OPTIONS.find((o) => o.value === config.armorMeta)?.note}
          </p>
        </div>
      </section>

      {/* Division Templates Grid */}
      <section aria-labelledby="templates-grid-heading" className="space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="templates-grid-heading" className="font-display text-lg font-semibold text-[#f0f3f7]">
            Состав дивизий в файле ai_templates
          </h2>
          <span className="text-xs text-[#8e98a8]">
            {config.toggles.metaTemplates ? 'Модуль активен' : 'Модуль отключён в параметрах'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const stats = computeTemplateStats(tpl);
            return (
              <article
                key={tpl.id}
                className="rounded-lg border border-[#232b37] bg-[#151a22] p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#8e98a8]">
                      {tpl.role} · role = {tpl.clausewitzRole}
                    </p>
                    <h3 className="font-display text-base font-semibold text-[#f0f3f7] mt-0.5">
                      {tpl.name}
                    </h3>
                  </div>

                  {/* Numeric KPI row */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#212936] text-xs">
                    <div>
                      <span className="text-[#788397] block">Ширина</span>
                      <span className="font-mono text-sm font-semibold tabular-nums text-[#e9c478]">
                        {stats.combatWidth}w
                      </span>
                    </div>
                    <div>
                      <span className="text-[#788397] block">Батальоны</span>
                      <span className="font-mono text-sm font-semibold tabular-nums text-[#e6eaf0]">
                        {stats.battalionCount} + {stats.supportCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#788397] block">Орг. (оценка)</span>
                      <span className="font-mono text-sm font-semibold tabular-nums text-[#4ade80]">
                        ~{stats.estimatedOrg}
                      </span>
                    </div>
                  </div>

                  {/* Regiments & Support */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-[#788397] mb-1">Боевые полки</p>
                      <ul className="space-y-1 text-[#d5dce7]">
                        {tpl.regiments.map((reg) => (
                          <li key={reg.type} className="flex justify-between font-mono tabular-nums">
                            <span className="font-sans">{reg.label}</span>
                            <span>×{reg.count} ({reg.count * reg.width}w)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-1">
                      <p className="text-[#788397] mb-1">Роты поддержки</p>
                      <p className="text-[#b4bece]">
                        {tpl.support.map((s) => s.label).join(' · ')}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#8e98a8] pt-3 border-t border-[#212936] leading-relaxed">
                  {tpl.notes}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Equipment Designers Table */}
      <section aria-labelledby="designers-heading" className="space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="designers-heading" className="font-display text-lg font-semibold text-[#f0f3f7]">
            Проекты техники в конструкторах (ai_equipment)
          </h2>
          <span className="text-xs text-[#8e98a8]">
            {config.toggles.metaDesigners ? 'Модуль активен' : 'Модуль отключён в параметрах'}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#232b37] bg-[#151a22]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#232b37] text-xs font-medium text-[#8e98a8]">
                <th className="py-3 px-4">Техника / DLC</th>
                <th className="py-3 px-4">Ключевые модули</th>
                <th className="py-3 px-4">Зачем это нужно</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2632] text-sm">
              {EQUIPMENT_DESIGNS.map((item) => (
                <tr key={item.name} className="hover:bg-[#19202b] transition-colors">
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-medium text-[#e6eaf0]">{item.name}</div>
                    <div className="text-xs text-[#788397] font-mono mt-0.5">
                      {item.dlc} · {item.chassis}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-top text-xs text-[#d5dce7] leading-relaxed">
                    {item.modules}
                  </td>
                  <td className="py-3.5 px-4 align-top text-xs text-[#9aa4b5] leading-relaxed">
                    {item.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
