import fs from 'node:fs';
import path from 'node:path';
import { createInitialConfig } from '../src/mod/presets';
import { generateModFiles } from '../src/mod/generators';
import { validateModPackage } from '../src/mod/validator';

const config = createInitialConfig('balanced');
const files = generateModFiles(config);
const validation = validateModPackage(files);

if (!validation.valid) {
  console.error('Mod validation failed:', validation.errors);
  process.exit(1);
}

const outRoot = path.resolve(process.cwd(), 'hoi4_mod');
fs.rmSync(outRoot, { recursive: true, force: true });

for (const file of files) {
  const fullPath = path.join(outRoot, file.path);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, file.content, 'utf8');
}

const bannerSrc = path.resolve(
  process.cwd(),
  'src/assets/images/hoi4_staff_map_banner_1795331123202.jpg'
);
if (fs.existsSync(bannerSrc)) {
  fs.copyFileSync(
    bannerSrc,
    path.join(outRoot, config.folderName, 'thumbnail.png')
  );
}

console.log(
  `Built ${files.length} HOI4 mod files (${validation.totalLines} lines) into hoi4_mod/`
);
