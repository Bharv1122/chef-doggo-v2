import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const distIndex = readFileSync('dist/index.html', 'utf8');
const scriptMatch = distIndex.match(/<script[^>]+src=["']([^"']+\.js)["']/i);

if (!scriptMatch) {
  throw new Error('Could not find the root-linked main JavaScript bundle in dist/index.html');
}

const scriptPath = scriptMatch[1].replace(/^\//, '');
const bundlePath = join('dist', scriptPath);
const bundle = readFileSync(bundlePath, 'utf8');
const required = ['Trash2', 'aria-pressed', 'hasIngredientsSection'];
const missing = required.filter(marker => !bundle.includes(marker));

if (missing.length > 0) {
  throw new Error(`Root-linked bundle ${scriptPath} is missing audit marker(s): ${missing.join(', ')}`);
}

const anyBundle = readdirSync('dist/assets')
  .filter(name => name.endsWith('.js'))
  .map(name => readFileSync(join('dist/assets', name), 'utf8'))
  .join('\n');

for (const marker of required) {
  if (!anyBundle.includes(marker)) {
    throw new Error(`Built JavaScript assets are missing audit marker: ${marker}`);
  }
}

console.log(`Audit bundle markers present in ${scriptPath}: ${required.join(', ')}`);
