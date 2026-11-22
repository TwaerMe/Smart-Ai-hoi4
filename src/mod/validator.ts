import type { FileValidationIssue, GeneratedModFile, ValidationSummary } from './types';

function stripClausewitzComment(line: string): string {
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (ch === '#' && !inQuotes) {
      return line.slice(0, i);
    }
  }
  return line;
}

export function validateClausewitzFile(file: GeneratedModFile): FileValidationIssue[] {
  const issues: FileValidationIssue[] = [];
  const lines = file.content.split(/\r?\n/);
  let depth = 0;

  for (let idx = 0; idx < lines.length; idx++) {
    const lineNum = idx + 1;
    const raw = lines[idx];
    const code = stripClausewitzComment(raw);

    let inQuotes = false;
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      if (ch === '"' && (i === 0 || code[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (!inQuotes) {
        if (ch === '{') {
          depth++;
        } else if (ch === '}') {
          depth--;
          if (depth < 0) {
            issues.push({
              filePath: file.path,
              severity: 'error',
              line: lineNum,
              message: 'Лишняя закрывающая скобка "}" без открывающей.',
            });
            depth = 0;
          }
        }
      }
    }

    if (inQuotes) {
      issues.push({
        filePath: file.path,
        severity: 'error',
        line: lineNum,
        message: 'Незакрытая строковая кавычка " в строке.',
      });
    }
  }

  if (depth > 0) {
    issues.push({
      filePath: file.path,
      severity: 'error',
      line: lines.length,
      message: `Незакрытые фигурные скобки: не хватает ${depth} шт. "}"`,
    });
  }

  return issues;
}

export function validateLuaDefinesFile(file: GeneratedModFile): FileValidationIssue[] {
  const issues: FileValidationIssue[] = [];
  const lines = file.content.split(/\r?\n/);
  let defineCount = 0;

  for (let idx = 0; idx < lines.length; idx++) {
    const lineNum = idx + 1;
    const trimmed = lines[idx].trim();
    if (!trimmed || trimmed.startsWith('--')) continue;

    if (trimmed.startsWith('NDefines.')) {
      defineCount++;
      if (!trimmed.includes('=')) {
        issues.push({
          filePath: file.path,
          severity: 'error',
          line: lineNum,
          message: 'Отсутствует оператор присваивания "=" в определении NDefines.',
        });
      }
      if (trimmed.includes('NaN') || trimmed.includes('undefined')) {
        issues.push({
          filePath: file.path,
          severity: 'error',
          line: lineNum,
          message: 'Некорректное числовое значение (NaN/undefined) в Lua define.',
        });
      }
    }
  }

  if (defineCount === 0) {
    issues.push({
      filePath: file.path,
      severity: 'warning',
      message: 'Файл Lua defines не содержит активных параметров NDefines.',
    });
  }

  return issues;
}

export function validateYamlLocalisationFile(file: GeneratedModFile): FileValidationIssue[] {
  const issues: FileValidationIssue[] = [];

  if (!file.content.startsWith('\uFEFF')) {
    issues.push({
      filePath: file.path,
      severity: 'error',
      line: 1,
      message: 'Отсутствует UTF-8 BOM (\\uFEFF) — HOI4 не загрузит локализацию без BOM.',
    });
  }

  const contentWithoutBom = file.content.replace(/^\uFEFF/, '');
  const lines = contentWithoutBom.split(/\r?\n/);
  const firstNonEmpty = lines.find((l) => l.trim().length > 0 && !l.trim().startsWith('#'));

  if (!firstNonEmpty || !/^l_(russian|english):$/.test(firstNonEmpty.trim())) {
    issues.push({
      filePath: file.path,
      severity: 'error',
      line: 1,
      message: 'Первая строка YAML должна содержать заголовок языка (l_russian: или l_english:).',
    });
  }

  return issues;
}

export function validateDescriptorFile(file: GeneratedModFile): FileValidationIssue[] {
  const issues: FileValidationIssue[] = [];
  if (!file.content.includes('name=')) {
    issues.push({
      filePath: file.path,
      severity: 'error',
      message: 'Отсутствует поле name= в дескрипторе мода.',
    });
  }
  if (!file.content.includes('supported_version=')) {
    issues.push({
      filePath: file.path,
      severity: 'error',
      message: 'Отсутствует поле supported_version= в дескрипторе мода.',
    });
  }
  return issues;
}

export function validateModPackage(files: GeneratedModFile[]): ValidationSummary {
  const errors: FileValidationIssue[] = [];
  const warnings: FileValidationIssue[] = [];
  let totalLines = 0;

  for (const file of files) {
    totalLines += file.content.split(/\r?\n/).length;
    let fileIssues: FileValidationIssue[] = [];

    if (file.language === 'clausewitz') {
      fileIssues = validateClausewitzFile(file);
    } else if (file.language === 'lua') {
      fileIssues = validateLuaDefinesFile(file);
    } else if (file.language === 'yaml') {
      fileIssues = validateYamlLocalisationFile(file);
    } else if (file.language === 'mod') {
      fileIssues = [
        ...validateClausewitzFile(file),
        ...validateDescriptorFile(file),
      ];
    }

    for (const issue of fileIssues) {
      if (issue.severity === 'error') {
        errors.push(issue);
      } else {
        warnings.push(issue);
      }
    }
  }

  return {
    valid: errors.length === 0,
    checkedFiles: files.length,
    totalLines,
    errors,
    warnings,
  };
}
