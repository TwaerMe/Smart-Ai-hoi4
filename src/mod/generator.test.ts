import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPreset,
  buildDivisionTemplates,
  computeTemplateStats,
  createInitialConfig,
} from './presets';
import { generateModFiles } from './generators';
import { validateClausewitzFile, validateModPackage } from './validator';

test('all presets generate syntactically valid HOI4 mod packages with zero errors', () => {
  const presets = ['balanced', 'meta', 'performance'] as const;

  for (const preset of presets) {
    const config = createInitialConfig(preset);
    const files = generateModFiles(config);
    const report = validateModPackage(files);

    assert.equal(report.valid, true, `Preset ${preset} failed validation: ${JSON.stringify(report.errors)}`);
    assert.equal(report.errors.length, 0);
    assert.ok(files.length >= 15, 'Should generate complete set of mod files');
    assert.ok(report.totalLines > 400, 'Generated mod should contain substantive Clausewitz & Lua code');
  }
});

test('localisation YAML files strictly start with UTF-8 BOM and valid language header', () => {
  const config = createInitialConfig('balanced');
  const files = generateModFiles(config);

  const ru = files.find((f) => f.path.endsWith('iron_doctrine_l_russian.yml'));
  const en = files.find((f) => f.path.endsWith('iron_doctrine_l_english.yml'));

  if (!ru || !en) {
    assert.fail('Russian and English localisation files must exist');
  }
  assert.equal(ru.content.startsWith('\uFEFFl_russian:'), true);
  assert.equal(en.content.startsWith('\uFEFFl_english:'), true);
});

test('division template math computes accurate combat widths and meta status', () => {
  const templates18_30 = buildDivisionTemplates('18w', '30w');
  const line18 = templates18_30.find((t) => t.id === 'line_infantry')!;
  const armor30 = templates18_30.find((t) => t.id === 'medium_armor')!;
  const garrison = templates18_30.find((t) => t.id === 'coastal_garrison')!;
  const mtn = templates18_30.find((t) => t.id === 'mountaineers')!;

  assert.equal(computeTemplateStats(line18).combatWidth, 18);
  assert.equal(computeTemplateStats(armor30).combatWidth, 30);
  assert.ok(computeTemplateStats(armor30).estimatedOrg >= 30, 'Armor template must keep >=30 org');
  assert.equal(computeTemplateStats(garrison).combatWidth, 10);
  assert.equal(computeTemplateStats(mtn).combatWidth, 25);

  const templates21_36 = buildDivisionTemplates('21w', '36w');
  assert.equal(computeTemplateStats(templates21_36.find((t) => t.id === 'line_infantry')!).combatWidth, 21);
  assert.equal(computeTemplateStats(templates21_36.find((t) => t.id === 'medium_armor')!).combatWidth, 36);
});

test('toggling presets and nation directives updates generated Lua and Clausewitz output', () => {
  const base = createInitialConfig('balanced');
  const meta = applyPreset(base, 'meta');

  const baseDefines = generateModFiles(base).find((f) => f.language === 'lua')!.content;
  const metaDefines = generateModFiles(meta).find((f) => f.language === 'lua')!.content;

  assert.notEqual(baseDefines, metaDefines);
  assert.ok(metaDefines.includes('PLAN_ATTACK_MIN_ORG_FACTOR_LOW = 0.65'));

  const noGerWall = {
    ...base,
    nationDirectives: {
      ...base.nationDirectives,
      ger_atlantic_wall: false,
    },
  };
  const majorsDefault = generateModFiles(base).find((f) => f.path.includes('majors.txt'))!.content;
  const majorsModified = generateModFiles(noGerWall).find((f) => f.path.includes('majors.txt'))!.content;

  assert.ok(majorsDefault.includes('iron_doctrine_ger_atlantic_wall'));
  assert.ok(!majorsModified.includes('iron_doctrine_ger_atlantic_wall'));
});

test('Clausewitz validator catches unbalanced braces and unclosed quotes', () => {
  const broken = validateClausewitzFile({
    path: 'broken.txt',
    language: 'clausewitz',
    category: 'strategy',
    description: 'broken test',
    content: 'test_block = {\n\tname = "unclosed\n\tvalue = 10\n',
  });

  assert.ok(broken.length >= 2, 'Should catch both unclosed quote and missing closing brace');
});
