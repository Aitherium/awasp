/**
 * awasp stays a THIN RE-EXPORT.
 *
 * The one invariant worth a test here is not "does it run" — the implementation is
 * imported, so running it proves the peer is installed, not that this package is
 * correct. The invariant is that nobody ever "fixes a bug" by pasting a copy of the
 * loader into this package. A second copy of a streaming loader is how "how many
 * bytes may be in flight" drifts between two trees, and the drift is invisible until
 * a phone is killed for memory mid-load.
 *
 * So: this file asserts the SHAPE. It needs no network, no peer install and no build.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.join(here, '..');
const readSrc = (rel) => fs.readFileSync(path.join(pkgRoot, 'src', rel), 'utf8');

test('the package declares itself and exports one entry point', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));
  assert.equal(pkg.name, '@aitherium/awasp');
  assert.equal(pkg.type, 'module');
  assert.deepEqual(Object.keys(pkg.exports), ['.']);
  assert.equal(pkg.exports['.'].import, './src/index.ts');
  assert.equal(pkg.publishConfig.exports['.'].import, './dist/index.js');
});

test('the adopt sentence names no sibling package', () => {
  // The registry rule: a brick`s one-line pitch must describe what it does ALONE.
  // If that sentence needs another brick, this is a subsystem, not a brick — and
  // the description is where the slip happens first, so it is checked here too.
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));
  for (const sibling of ['awbonsai', 'awkit', 'awrtifact', 'awdk']) {
    assert.ok(
      !pkg.description.includes(sibling),
      `description names the sibling ${sibling}; describe what awasp does alone`,
    );
  }
});

test('index.ts re-exports and vendors no implementation', () => {
  const src = readSrc('index.ts');
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  assert.deepEqual(
    code,
    ["export * from '@aitherium/awkit/webml/bonsai/wasp';"],
    'awasp must stay one re-export line — a vendored copy of the loader drifts silently',
  );
});

test('no source file defines a streaming constant of its own', () => {
  // A copied `32 * 1024 * 1024` here is the drift this package is shaped to prevent:
  // two trees disagreeing about the in-flight ceiling, discovered on a dead phone.
  for (const f of fs.readdirSync(path.join(pkgRoot, 'src'))) {
    const src = readSrc(f);
    assert.ok(
      !/\b(CHUNK|MAX_IN_FLIGHT|maxBufferSize)\b\s*=/.test(src),
      `${f} defines a streaming constant; it belongs in the canonical runtime`,
    );
  }
});
