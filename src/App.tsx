import { useMemo, useState } from 'react';
import { CheckCircle2, Download, Menu } from 'lucide-react';
import { applyPreset, createInitialConfig, PRESETS } from './mod/presets';
import { generateModFiles } from './mod/generators';
import { validateModPackage } from './mod/validator';
import { exportModAsZip } from './mod/zipExporter';
import type {
  ArmorWidthMeta,
  DefinesConfig,
  GameVersion,
  InfantryWidthMeta,
  ModConfig,
  ModuleToggles,
  PresetId,
} from './mod/types';
import { Sidebar, type ActiveTab } from './components/Sidebar';
import { OverviewSection } from './components/OverviewSection';
import { DefinesEditor } from './components/DefinesEditor';
import { TemplatesSection } from './components/TemplatesSection';
import { NationsSection } from './components/NationsSection';
import { FilesExplorer } from './components/FilesExplorer';
import { InstallGuide } from './components/InstallGuide';
import bannerImg from './assets/images/hoi4_staff_map_banner_1795331123202.jpg';

const BANNER_THUMBNAIL = bannerImg;

const TAB_TITLES: Record<ActiveTab, string> = {
  overview: 'Обзор и пресеты',
  defines: 'Параметры ИИ',
  templates: 'Шаблоны дивизий',
  nations: 'Стратегии стран',
  files: 'Файлы мода',
  install: 'Установка',
};

export function App() {
  const [config, setConfig] = useState<ModConfig>(() => createInitialConfig('balanced'));
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const generatedFiles = useMemo(() => generateModFiles(config), [config]);
  const validation = useMemo(() => validateModPackage(generatedFiles), [generatedFiles]);

  const luaFile = useMemo(
    () => generatedFiles.find((f) => f.language === 'lua'),
    [generatedFiles]
  );

  const majorsFile = useMemo(
    () => generatedFiles.find((f) => f.path.endsWith('iron_doctrine_majors.txt')),
    [generatedFiles]
  );

  const handleSelectPreset = (preset: PresetId) => {
    setConfig((prev) => applyPreset(prev, preset));
  };

  const handleVersionChange = (version: GameVersion) => {
    setConfig((prev) => ({ ...prev, supportedVersion: version }));
  };

  const handleUpdateDefine = <K extends keyof DefinesConfig>(
    key: K,
    value: DefinesConfig[K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      defines: {
        ...prev.defines,
        [key]: value,
      },
    }));
  };

  const handleToggleModule = (key: keyof ModuleToggles) => {
    setConfig((prev) => ({
      ...prev,
      toggles: {
        ...prev.toggles,
        [key]: !prev.toggles[key],
      },
    }));
  };

  const handleResetDefaults = () => {
    setConfig((prev) => applyPreset(prev, prev.preset));
  };

  const handleChangeInfantryMeta = (meta: InfantryWidthMeta) => {
    setConfig((prev) => ({ ...prev, infantryMeta: meta }));
  };

  const handleChangeArmorMeta = (meta: ArmorWidthMeta) => {
    setConfig((prev) => ({ ...prev, armorMeta: meta }));
  };

  const handleToggleDirective = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      nationDirectives: {
        ...prev.nationDirectives,
        [id]: !prev.nationDirectives[id],
      },
    }));
  };

  const handleToggleAllDirectives = (enabled: boolean) => {
    setConfig((prev) => {
      const updated: Record<string, boolean> = {};
      for (const key of Object.keys(prev.nationDirectives)) {
        updated[key] = enabled;
      }
      return { ...prev, nationDirectives: updated };
    });
  };

  const handleUpdateModIdentity = (modName: string, folderName: string) => {
    setConfig((prev) => ({ ...prev, modName, folderName }));
  };

  const handleExportZip = async () => {
    if (!validation.valid || isExporting) return;
    setIsExporting(true);
    setExportMessage(null);
    try {
      const result = await exportModAsZip(config, generatedFiles, BANNER_THUMBNAIL);
      const kb = (result.sizeBytes / 1024).toFixed(1);
      setExportMessage(
        `Архив ${result.filename} (${result.fileCount} файлов · ${kb} КБ) готов — распакуйте его в папку mod/ Hearts of Iron IV.`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0e1116] text-[#e6eaf0]">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        supportedVersion={config.supportedVersion}
        onVersionChange={handleVersionChange}
        validation={validation}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Contextual Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 bg-[#0e1116]/95 backdrop-blur-sm border-b border-[#232b37]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Открыть меню навигации"
              className="lg:hidden rounded-md p-2 text-[#9aa4b5] hover:bg-[#1a212c] hover:text-[#f0f3f7] focus-visible:outline-2 focus-visible:outline-[#d49b35]"
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav aria-label="Навигационная цепочка" className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-[#788397] hidden sm:inline whitespace-nowrap">
                {PRESETS[config.preset].name}
              </span>
              <span aria-hidden="true" className="text-[#4a5568] hidden sm:inline">
                /
              </span>
              <span className="font-medium text-[#f0f3f7] truncate">
                {TAB_TITLES[activeTab]}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden md:inline text-xs font-mono tabular-nums text-[#8e98a8] whitespace-nowrap">
              HOI4 {config.supportedVersion} · {validation.checkedFiles} файлов
            </span>
            <button
              type="button"
              onClick={handleExportZip}
              disabled={isExporting || !validation.valid}
              className="inline-flex items-center gap-2 rounded-md bg-[#d49b35] px-3.5 py-1.5 text-xs font-semibold text-[#111419] hover:bg-[#e1aa45] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d49b35]"
            >
              <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{isExporting ? 'Сборка...' : 'Скачать мод (.zip)'}</span>
            </button>
          </div>
        </header>

        {/* Export Feedback Banner */}
        {exportMessage && (
          <div
            role="status"
            className="mx-4 sm:mx-6 lg:mx-8 mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#1f4d35] bg-[#11241b] px-4 py-3 text-sm text-[#bbf7d0]"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#4ade80] shrink-0" aria-hidden="true" />
              <span>{exportMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setExportMessage(null)}
              className="text-xs font-medium text-[#86efac] hover:text-white whitespace-nowrap"
            >
              Скрыть
            </button>
          </div>
        )}

        {/* Main Workspace Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1360px] w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewSection
              config={config}
              validation={validation}
              onSelectPreset={handleSelectPreset}
              onNavigate={setActiveTab}
              onExportZip={handleExportZip}
              isExporting={isExporting}
            />
          )}

          {activeTab === 'defines' && (
            <DefinesEditor
              config={config}
              luaFile={luaFile}
              onUpdateDefine={handleUpdateDefine}
              onToggleModule={handleToggleModule}
              onResetDefaults={handleResetDefaults}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesSection
              config={config}
              onChangeInfantryMeta={handleChangeInfantryMeta}
              onChangeArmorMeta={handleChangeArmorMeta}
            />
          )}

          {activeTab === 'nations' && (
            <NationsSection
              config={config}
              majorsFile={majorsFile}
              onToggleDirective={handleToggleDirective}
              onToggleAllDirectives={handleToggleAllDirectives}
            />
          )}

          {activeTab === 'files' && (
            <FilesExplorer files={generatedFiles} validation={validation} />
          )}

          {activeTab === 'install' && (
            <InstallGuide
              config={config}
              onUpdateModIdentity={handleUpdateModIdentity}
              onExportZip={handleExportZip}
              isExporting={isExporting}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
