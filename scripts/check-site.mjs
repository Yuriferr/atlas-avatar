import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('dist');
const context = vm.createContext({});
const data = ['data.js', 'atlas-data.js', 'portrait-sources.js']
  .map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
vm.runInContext(data + `;globalThis.result = {
  cast: CAST, techniques: BENDING, creatures: CREATURES, avatars: AVATARS, sources: SOURCES
};`, context);
const { cast, techniques, creatures, avatars, sources } = context.result;
const records = [...cast, ...techniques, ...creatures, ...avatars];
for (const record of records) {
  assert.ok(sources[record.source], `Fonte ausente: ${record.name}`);
  const images = [...(record.image ? [record.image] : []), ...(record.pairedImages || []).map(pair => pair[0])];
  if (!techniques.includes(record)) assert.ok(images.length, `Retrato ausente: ${record.name}`);
  for (const image of images) assert.ok(fs.existsSync(path.join(root, 'assets', image)), `Imagem ausente: ${image}`);
}
const ids = [...cast, ...techniques, ...creatures].map(item => item.id);
assert.equal(new Set(ids).size, ids.length, 'Identificadores duplicados no atlas');
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
assert.equal(pages.length, 14);
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.ok(html.includes('lang="pt-BR"'));
  assert.ok(html.includes('name="viewport"'));
  for (const [, target] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(target)) continue;
    assert.ok(fs.existsSync(path.join(root, target.split(/[?#]/)[0])), `Link ausente: ${page} → ${target}`);
  }
}
console.log(JSON.stringify({ pages: pages.length, characters: cast.length, techniques: techniques.length,
  creatures: creatures.length, avatars: avatars.length, localAssets: 'ok', sources: 'ok' }, null, 2));
