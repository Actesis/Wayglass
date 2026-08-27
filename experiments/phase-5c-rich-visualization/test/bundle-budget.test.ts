import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { build } from 'vite';

const experimentRoot = fileURLToPath(new URL('..', import.meta.url));
const entries = {
  native: fileURLToPath(new URL('../src/native-adapter.ts', import.meta.url)),
  uplot: fileURLToPath(new URL('../src/uplot-adapter.ts', import.meta.url)),
  d3: fileURLToPath(new URL('../src/d3-adapter.ts', import.meta.url)),
} as const;

async function measureEntry(entry: string) {
  const result = await build({
    configFile: false,
    root: experimentRoot,
    logLevel: 'silent',
    build: {
      write: false,
      minify: 'esbuild',
      target: 'es2022',
      cssCodeSplit: false,
      lib: { entry, formats: ['es'], fileName: 'adapter' },
    },
  });
  const builds = Array.isArray(result) ? result : [result];
  const chunks = builds
    .flatMap((candidate) => ('output' in candidate ? candidate.output : []))
    .filter((item) => item.type === 'chunk');
  return {
    rawBytes: chunks.reduce((total, { code }) => total + Buffer.byteLength(code), 0),
    gzipBytes: chunks.reduce((total, { code }) => total + gzipSync(code).byteLength, 0),
  };
}

describe('Phase 5C isolated production JavaScript budgets', () => {
  it('keeps every self-contained adapter entry below the candidate budget', async () => {
    const measurements = Object.fromEntries(
      await Promise.all(
        Object.entries(entries).map(async ([name, entry]) => [name, await measureEntry(entry)]),
      ),
    );
    console.info(`P5C_BUNDLE_MEASUREMENTS ${JSON.stringify(measurements)}`);
    expect(measurements.native!.gzipBytes).toBeLessThan(40 * 1_024);
    expect(measurements.uplot!.gzipBytes).toBeLessThan(40 * 1_024);
    expect(measurements.d3!.gzipBytes).toBeLessThan(40 * 1_024);
  });
});
