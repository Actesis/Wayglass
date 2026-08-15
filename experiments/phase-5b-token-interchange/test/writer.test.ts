import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createDtcgExchange } from '../src/dtcg.js';
import type { NormalizedTokenGraph } from '../src/normalize.js';
import { createWayglassTokenGraph } from '../src/source.js';
import {
  readDtcgExchangePointer,
  recoverDtcgExchangeRoot,
  writeDtcgExchange,
} from '../src/writer.js';

const roots: string[] = [];
const policy = {
  defaultTheme: 'wayglass-dark',
  defaultDensity: 'compact',
  sourceRevision: '0123456789abcdef0123456789abcdef01234567',
} as const;

async function root(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), 'wayglass-phase5b-'));
  roots.push(path);
  return path;
}

function exchange(value = '#4f8cff') {
  const graph = createWayglassTokenGraph();
  const changed: NormalizedTokenGraph = {
    ...graph,
    tokens: graph.tokens.map((token) =>
      token.source === 'color.reference.blue.500' ? { ...token, value } : token,
    ),
  };
  return createDtcgExchange(changed, policy);
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe('DTCG exchange filesystem writer', () => {
  it('commits an immutable release and returns unchanged for an identical rewrite', async () => {
    const destination = await root();
    const first = await writeDtcgExchange(exchange(), destination);

    expect(first.status).toBe('created');
    expect(await readDtcgExchangePointer(destination)).toEqual({
      format: 1,
      release: first.release,
      sourceRevision: policy.sourceRevision,
    });
    expect(
      await readFile(join(destination, 'releases', first.release, 'tokens.json'), 'utf8'),
    ).toContain('color.reference.blue.500');

    await expect(writeDtcgExchange(exchange(), destination)).resolves.toMatchObject({
      release: first.release,
      status: 'unchanged',
    });
  });

  it('protects an accepted release unless replacement is explicit', async () => {
    const destination = await root();
    const first = await writeDtcgExchange(exchange(), destination);

    await expect(writeDtcgExchange(exchange('#508dff'), destination)).rejects.toThrow(
      /set replace to update it/,
    );
    expect((await readDtcgExchangePointer(destination))?.release).toBe(first.release);
  });

  it('atomically advances the pointer and removes the superseded release', async () => {
    const destination = await root();
    const first = await writeDtcgExchange(exchange(), destination);
    const second = await writeDtcgExchange(exchange('#508dff'), destination, { replace: true });

    expect(second).toMatchObject({ status: 'replaced' });
    expect(second.release).not.toBe(first.release);
    expect((await readDtcgExchangePointer(destination))?.release).toBe(second.release);
    expect(await readdir(join(destination, 'releases'))).toEqual([second.release]);
  });

  it('removes a partial stage after an ordinary write failure', async () => {
    const destination = await root();

    await expect(
      writeDtcgExchange(exchange(), destination, { simulateFailureAfterFiles: 2 }),
    ).rejects.toThrow('Simulated DTCG exchange write failure after 2 files.');
    expect(await readDtcgExchangePointer(destination)).toBeUndefined();
    expect(await readdir(join(destination, 'releases'))).toEqual([]);
  });

  it('recovers an interrupted stage without changing the accepted release', async () => {
    const destination = await root();
    const first = await writeDtcgExchange(exchange(), destination);

    await expect(
      writeDtcgExchange(exchange('#508dff'), destination, {
        replace: true,
        simulateInterruptionAfter: 'stage',
      }),
    ).rejects.toThrow('Simulated DTCG exchange process interruption after staging.');
    expect((await readDtcgExchangePointer(destination))?.release).toBe(first.release);
    expect(
      (await readdir(join(destination, 'releases'))).some((name) => name.startsWith('.stage-')),
    ).toBe(true);

    const recovery = await recoverDtcgExchangeRoot(destination);
    expect(recovery.retainedRelease).toBe(first.release);
    expect(recovery.removedStages).toHaveLength(1);
    expect(await readdir(join(destination, 'releases'))).toEqual([first.release]);
  });

  it('recovers an orphan release committed before pointer replacement', async () => {
    const destination = await root();
    const first = await writeDtcgExchange(exchange(), destination);

    await expect(
      writeDtcgExchange(exchange('#508dff'), destination, {
        replace: true,
        simulateInterruptionAfter: 'release',
      }),
    ).rejects.toThrow('Simulated DTCG exchange process interruption after release commit.');
    expect((await readDtcgExchangePointer(destination))?.release).toBe(first.release);
    expect(await readdir(join(destination, 'releases'))).toHaveLength(2);

    const recovery = await recoverDtcgExchangeRoot(destination);
    expect(recovery.retainedRelease).toBe(first.release);
    expect(recovery.removedReleases).toHaveLength(1);
    expect(await readdir(join(destination, 'releases'))).toEqual([first.release]);
  });

  it('preserves similarly prefixed entries that the writer does not own', async () => {
    const destination = await root();
    const first = await writeDtcgExchange(exchange(), destination);
    const userStage = '.stage-user-data';
    const userPointerTemp = 'current.json.tmp-user-data';
    await mkdir(join(destination, 'releases', userStage));
    await writeFile(join(destination, userPointerTemp), 'keep', 'utf8');

    const recovery = await recoverDtcgExchangeRoot(destination);
    expect(recovery).toEqual({
      retainedRelease: first.release,
      removedPointerTemps: [],
      removedReleases: [],
      removedStages: [],
    });
    expect(await readdir(join(destination, 'releases'))).toEqual([userStage, first.release]);
    expect(await readFile(join(destination, userPointerTemp), 'utf8')).toBe('keep');
  });

  it('rejects corrupt pointers and references to missing accepted releases', async () => {
    const destination = await root();
    await writeFile(join(destination, 'current.json'), '{bad json', 'utf8');
    await expect(recoverDtcgExchangeRoot(destination)).rejects.toThrow(
      'DTCG exchange pointer is not valid JSON.',
    );

    await writeFile(
      join(destination, 'current.json'),
      `${JSON.stringify({ format: 1, release: 'a'.repeat(64), sourceRevision: 'abcdef0' })}\n`,
      'utf8',
    );
    await expect(recoverDtcgExchangeRoot(destination)).rejects.toThrow(
      `DTCG exchange pointer references missing release "${'a'.repeat(64)}".`,
    );
  });

  it('rejects traversal paths before creating artifact files', async () => {
    const destination = await root();
    const base = exchange();
    const unsafePath = '../escape.json';
    const unsafeContent = '{}\n';
    const manifest = {
      ...base.manifest,
      artifacts: {
        ...base.manifest.artifacts,
        [unsafePath]: {
          sha256: createHash('sha256').update(unsafeContent, 'utf8').digest('hex'),
          bytes: Buffer.byteLength(unsafeContent, 'utf8'),
        },
      },
    };
    const unsafe = {
      manifest,
      files: {
        ...base.files,
        [unsafePath]: unsafeContent,
        'wayglass-manifest.json': `${JSON.stringify(manifest, null, 2)}\n`,
      },
    };

    await expect(writeDtcgExchange(unsafe, destination)).rejects.toThrow(
      'DTCG exchange artifact path "../escape.json" is unsafe.',
    );
    expect(await readDtcgExchangePointer(destination)).toBeUndefined();
  });
});
