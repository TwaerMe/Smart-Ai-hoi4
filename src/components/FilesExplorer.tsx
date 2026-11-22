import { useMemo, useState } from 'react';
import { Check, CheckCircle2, Copy, Download, FileCode, Search, ShieldAlert } from 'lucide-react';
import type { GeneratedModFile, ValidationSummary } from '../mod/types';

interface FilesExplorerProps {
  files: GeneratedModFile[];
  validation: ValidationSummary;
}

const CATEGORY_LABELS: Record<GeneratedModFile['category'], string> = {
  descriptor: 'Дескриптор',
  defines: 'Defines',
  templates: 'Шаблоны',
  equipment: 'Конструкторы',
  strategy: 'Стратегии',
  peace: 'Мирные конф.',
  decisions: 'Решения',
  localisation: 'Локализация',
  docs: 'Инструкция',
};

export function FilesExplorer({ files, validation }: FilesExplorerProps) {
  const [search, setSearch] = useState('');
  const [selectedPath, setSelectedPath] = useState<string>(
    files[2]?.path ?? files[0]?.path ?? ''
  );
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const filteredFiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter(
      (f) =>
        f.path.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        CATEGORY_LABELS[f.category].toLowerCase().includes(q)
    );
  }, [files, search]);

  const activeFile =
    files.find((f) => f.path === selectedPath) ?? filteredFiles[0] ?? files[0];

  const activeLines = useMemo(
    () => (activeFile ? activeFile.content.replace(/^\uFEFF/, '').split('\n') : []),
    [activeFile]
  );

  const handleCopy = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedPath(activeFile.path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch {
      // Fallback ignored safely in sandboxed frames
    }
  };

  const handleDownloadSingle = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.path.split('/').pop() ?? 'mod_file.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#f0f3f7]">
            Файлы модификации и валидатор Clausewitz
          </h1>
          <p className="text-sm text-[#8e98a8] mt-1">
            Все {validation.checkedFiles} файлов генерируются полностью и проверяются на баланс
            скобок, синтаксис Lua и наличие UTF-8 BOM для локализации.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm shrink-0">
          {validation.valid ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-[#4ade80] whitespace-nowrap font-mono tabular-nums text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>0 ошибок · {validation.totalLines} стр.</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-[#f87171] whitespace-nowrap">
              <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Ошибок: {validation.errors.length}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Split Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left File Tree List */}
        <div className="lg:col-span-4 rounded-lg border border-[#232b37] bg-[#151a22] overflow-hidden">
          <div className="p-3 border-b border-[#232b37]">
            <label htmlFor="file-search-input" className="sr-only">
              Поиск файла в моде
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#788397]"
                aria-hidden="true"
              />
              <input
                id="file-search-input"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Фильтр файлов (defines, majors, yml)..."
                className="w-full rounded-md bg-[#0e1116] border border-[#283140] pl-9 pr-3 py-2 text-xs text-[#e6eaf0] placeholder:text-[#6b7689] focus:border-[#d49b35] focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-[#1e2531] max-h-[600px] overflow-y-auto">
            {filteredFiles.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8e98a8]">
                Файлы по запросу «{search}» не найдены.
              </div>
            ) : (
              filteredFiles.map((file) => {
                const isSelected = activeFile?.path === file.path;
                const lineCount = file.content.split('\n').length;
                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedPath(file.path)}
                    aria-current={isSelected ? 'true' : undefined}
                    className={`w-full text-left px-3.5 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#d49b35] ${
                      isSelected ? 'bg-[#1f2734]' : 'hover:bg-[#19202b]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCode
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isSelected ? 'text-[#d49b35]' : 'text-[#788397]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="font-mono text-xs text-[#e6eaf0] truncate">
                        {file.path}
                      </span>
                    </div>
                    <div className="mt-1 pl-5 flex items-center gap-2 text-[11px] text-[#788397]">
                      <span>{CATEGORY_LABELS[file.category]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{lineCount} стр.</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="lg:col-span-8 rounded-lg border border-[#232b37] bg-[#0b0e13] overflow-hidden">
          {activeFile && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#151a22] border-b border-[#232b37]">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-medium text-[#f0f3f7] truncate">
                    {activeFile.path}
                  </p>
                  <p className="text-xs text-[#8e98a8] mt-0.5">{activeFile.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#2d3646] bg-[#1a212c] px-3 py-1.5 text-xs font-medium text-[#e6eaf0] hover:bg-[#232c3b] transition-colors whitespace-nowrap"
                  >
                    {copiedPath === activeFile.path ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#4ade80]" aria-hidden="true" />
                        <span>Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Скопировать файл</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSingle}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#2d3646] bg-[#1a212c] px-3 py-1.5 text-xs font-medium text-[#e6eaf0] hover:bg-[#232c3b] transition-colors whitespace-nowrap"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Скачать файл</span>
                  </button>
                </div>
              </div>

              {activeFile.language === 'yaml' && (
                <div className="px-4 py-2 bg-[#12171f] border-b border-[#1f2632] text-xs text-[#9aa4b5]">
                  Кодировка файла: UTF-8 с BOM (U+FEFF) — обязательное требование движка Clausewitz
                  для загрузки YAML-локализации.
                </div>
              )}

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto p-4 font-mono text-xs leading-6">
                <table className="w-full border-collapse">
                  <tbody>
                    {activeLines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-[#141a23]">
                        <td className="select-none pr-4 text-right text-[#546074] tabular-nums align-top w-10">
                          {idx + 1}
                        </td>
                        <td className="whitespace-pre text-[#d2dae6]">{line || ' '}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
