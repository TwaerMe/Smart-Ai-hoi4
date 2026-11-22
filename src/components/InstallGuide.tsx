import { useState } from 'react';
import { Check, Copy, Download, FolderOpen } from 'lucide-react';
import type { ModConfig } from '../mod/types';

interface InstallGuideProps {
  config: ModConfig;
  onUpdateModIdentity: (modName: string, folderName: string) => void;
  onExportZip: () => void;
  isExporting: boolean;
}

const OS_PATHS = [
  {
    os: 'Windows',
    path: 'C:\\Users\\<Имя>\\Documents\\Paradox Interactive\\Hearts of Iron IV\\mod\\',
  },
  {
    os: 'Linux (Steam / Proton)',
    path: '~/.local/share/Paradox Interactive/Hearts of Iron IV/mod/',
  },
  {
    os: 'macOS',
    path: '~/Documents/Paradox Interactive/Hearts of Iron IV/mod/',
  },
];

export function InstallGuide({
  config,
  onUpdateModIdentity,
  onExportZip,
  isExporting,
}: InstallGuideProps) {
  const [nameInput, setNameInput] = useState(config.modName);
  const [folderInput, setFolderInput] = useState(config.folderName);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedOs, setCopiedOs] = useState<string | null>(null);

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedFolder = folderInput.trim();

    if (!trimmedName) {
      setFormError('Укажите название мода для Paradox Launcher.');
      return;
    }
    if (!/^[a-z0-9_]{3,40}$/.test(trimmedFolder)) {
      setFormError(
        'Имя папки должно содержать только латинские строчные буквы, цифры и "_" (от 3 до 40 символов).'
      );
      return;
    }

    setFormError(null);
    onUpdateModIdentity(trimmedName, trimmedFolder);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleCopyPath = async (os: string, path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopiedOs(os);
      setTimeout(() => setCopiedOs(null), 1800);
    } catch {
      // Safe fallback
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#f0f3f7]">
          Установка мода в Hearts of Iron IV
        </h1>
        <p className="text-sm text-[#8e98a8] mt-1">
          Скачайте готовый ZIP-архив (или возьмите готовую папку <code className="font-mono text-[#e9c478]">hoi4_mod/</code> прямо из репозитория) и подключите мод в Paradox Launcher за минуту.
        </p>
      </div>

      {/* Mod Identity Customization Form */}
      <section className="rounded-lg border border-[#232b37] bg-[#151a22] p-5 space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold text-[#f0f3f7]">
            Название мода и директории в Paradox Launcher
          </h2>
          <p className="text-xs text-[#8e98a8] mt-0.5">
            Изменяет поля <code className="font-mono">name</code> и{' '}
            <code className="font-mono">path</code> внутри дескриптора <code className="font-mono">.mod</code>.
          </p>
        </div>

        <form onSubmit={handleSaveIdentity} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mod-name-input" className="block text-xs font-medium text-[#b4bece] mb-1.5">
              Название в лаунчере
            </label>
            <input
              id="mod-name-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full rounded-md bg-[#0e1116] border border-[#2a3342] px-3 py-2 text-sm text-[#e6eaf0] focus:border-[#d49b35] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="mod-folder-input" className="block text-xs font-medium text-[#b4bece] mb-1.5">
              Папка мода (латиница)
            </label>
            <input
              id="mod-folder-input"
              type="text"
              value={folderInput}
              onChange={(e) => setFolderInput(e.target.value)}
              className="w-full rounded-md bg-[#0e1116] border border-[#2a3342] px-3 py-2 text-sm font-mono text-[#e6eaf0] focus:border-[#d49b35] focus:outline-none"
            />
          </div>

          {formError && (
            <div role="alert" className="sm:col-span-2 text-xs text-[#f87171]">
              {formError}
            </div>
          )}

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-[#1e2633] border border-[#323d4e] px-4 py-2 text-xs font-semibold text-[#f0f3f7] hover:bg-[#273142] transition-colors whitespace-nowrap"
            >
              Применить название
            </button>
            {savedNotice && (
              <span className="text-xs font-medium text-[#4ade80]">
                Дескрипторы и пути обновлены
              </span>
            )}
          </div>
        </form>
      </section>

      {/* 3 Steps */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-[#f0f3f7]">
          Пошаговая инструкция
        </h2>

        <ol className="space-y-3">
          <li className="rounded-lg border border-[#232b37] bg-[#151a22] p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-base font-semibold text-[#f0f3f7]">
                01. Скачайте готовый ZIP-архив мода
              </h3>
              <button
                type="button"
                onClick={onExportZip}
                disabled={isExporting}
                className="inline-flex items-center gap-2 rounded-md bg-[#d49b35] px-4 py-2 text-xs font-semibold text-[#111419] hover:bg-[#e1aa45] transition-colors whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isExporting ? 'Сборка...' : 'Скачать мод (.zip)'}</span>
              </button>
            </div>
            <p className="text-sm text-[#b4bece] leading-relaxed">
              Архив уже содержит внешний файл <code className="font-mono text-[#e9c478]">{config.folderName}.mod</code>,
              папку <code className="font-mono text-[#e9c478]">{config.folderName}/</code> со всеми скриптами и обложку{' '}
              <code className="font-mono text-[#e9c478]">thumbnail.png</code>.
            </p>
          </li>

          <li className="rounded-lg border border-[#232b37] bg-[#151a22] p-5 space-y-3">
            <h3 className="font-display text-base font-semibold text-[#f0f3f7]">
              02. Распакуйте содержимое архива в папку mod/
            </h3>
            <p className="text-sm text-[#b4bece]">
              Внутри директории <code className="font-mono">Hearts of Iron IV/mod/</code> должны
              лежать рядом файл <code className="font-mono text-[#e9c478]">{config.folderName}.mod</code> и папка{' '}
              <code className="font-mono text-[#e9c478]">{config.folderName}/</code>.
            </p>
            <div className="space-y-2 pt-1">
              {OS_PATHS.map((item) => (
                <div
                  key={item.os}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#0e1116] border border-[#232b37] px-3 py-2"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-[#8e98a8] block">{item.os}</span>
                    <code className="text-xs font-mono text-[#d5dce7] break-all">{item.path}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPath(item.os, item.path)}
                    aria-label={`Скопировать путь для ${item.os}`}
                    className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs text-[#b4bece] hover:bg-[#1a212c] hover:text-[#f0f3f7] transition-colors shrink-0"
                  >
                    {copiedOs === item.os ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#4ade80]" aria-hidden="true" />
                        <span>Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Копировать</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </li>

          <li className="rounded-lg border border-[#232b37] bg-[#151a22] p-5 space-y-2">
            <h3 className="font-display text-base font-semibold text-[#f0f3f7]">
              03. Включите мод в Paradox Launcher и запустите новую партию
            </h3>
            <p className="text-sm text-[#b4bece] leading-relaxed">
              Откройте Paradox Launcher → «Игровые наборы» (Playsets) → «Добавить моды» → выберите{' '}
              <strong className="text-[#f0f3f7]">{config.modName}</strong>. Во время игры в разделе
              «Решения» (Decisions) появится панель переключения хардкор-режима и анти-лага.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#8e98a8]">
              <FolderOpen className="h-4 w-4 text-[#d49b35] shrink-0" aria-hidden="true" />
              <span>
                Совместимость: работает со всеми DLC (NSB, BBA, AAT, Götterdämmerung) · не
                конфликтует с графическими и музыкальными модами.
              </span>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
