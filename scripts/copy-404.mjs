import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist', 'tower-angular', 'browser');
const indexPath = join(outDir, 'index.html');
const fallbackPath = join(outDir, '404.html');

if (!existsSync(indexPath)) {
  console.error(`copy-404: ng build did not write ${indexPath}`);
  process.exit(1);
}

copyFileSync(indexPath, fallbackPath);
console.log(`copy-404: wrote ${fallbackPath}`);
