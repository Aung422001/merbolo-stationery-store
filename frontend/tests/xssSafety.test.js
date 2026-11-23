import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../src/', import.meta.url);
const sourceFiles = async dir => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(jsx?|tsx?)$/.test(entry.name) ? [full] : [];
  }));
  return files.flat();
};

test('frontend contains no unsafe HTML injection or script execution sinks', async () => {
  const files = await sourceFiles(root.pathname);
  assert.ok(files.length > 0, 'frontend source files must be scanned');
  const banned = [
    /dangerouslySetInnerHTML\s*=/,
    /\.innerHTML\s*=/,
    /\.outerHTML\s*=/,
    /\binsertAdjacentHTML\s*\(/,
    /\bdocument\.write\s*\(/,
    /\beval\s*\(/,
    /\bnew\s+Function\s*\(/,
    /\bjavascript\s*:/i
  ];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const pattern of banned) {
      assert.doesNotMatch(source, pattern, 'unsafe DOM/script sink in ' + file);
    }
  }
});
