import { mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { iconCatalog } from '../src/catalog.js';
import { generateIconArtifacts, generatedArtifactPaths } from '../src/generation.js';
import type { IconRecord } from '../src/types.js';
import {
  readCommittedIconArtifacts,
  recoverStaleIconWriterLock,
  verifyCommittedIconArtifacts,
  writeIconArtifacts,
} from '../src/writer.js';

const roots: string[] = [];
const owner = '01234567-89ab-4cde-8fab-0123456789ab';
const lockName = '.wayglass-icon-tooling.lock';

async function root(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), 'wayglass-icon-writer-'));
  roots.push(path);
  return path;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

function generated(catalog: readonly IconRecord[] = iconCatalog, version = '0.0.0') {
  return generateIconArtifacts(catalog, { iconPackageVersion: version });
}

function changedCatalog(): readonly IconRecord[] {
  const catalog = structuredClone(iconCatalog) as unknown as Array<Record<string, unknown>>;
  const primitives = catalog[0]!.primitives as Array<Record<string, unknown>>;
  const commands = primitives[0]!.commands as Array<Record<string, unknown>>;
  commands[0]!.x = 7;
  return catalog as unknown as readonly IconRecord[];
}

async function ownedSiblings(directory: string): Promise<readonly string[]> {
  const matches: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.name.includes('.wayglass-icon-')) matches.push(path);
    if (entry.isDirectory()) matches.push(...(await ownedSiblings(path)));
  }
  return matches;
}

describe('transactional icon writer', () => {
  it('rejects an invalid output set before acquiring the lock', async () => {
    const destination = await root();
    await expect(
      writeIconArtifacts(destination, { ...generated(), '../outside': 'unsafe\n' } as never),
    ).rejects.toThrow(/WG_ICON_INTEGRITY_INVENTORY/);
    expect(await readdir(destination)).not.toContain(lockName);
  });

  it('creates, leaves identical bytes unchanged, and updates the exact four files', async () => {
    const destination = await root();
    await expect(writeIconArtifacts(destination, generated())).resolves.toMatchObject({
      created: [
        generatedArtifactPaths[0],
        generatedArtifactPaths[1],
        generatedArtifactPaths[3],
        generatedArtifactPaths[2],
      ],
      unchanged: [],
      updated: [],
    });
    await expect(writeIconArtifacts(destination, generated())).resolves.toMatchObject({
      created: [],
      unchanged: expect.arrayContaining([...generatedArtifactPaths]),
      updated: [],
    });
    await expect(
      writeIconArtifacts(destination, generated(iconCatalog, '0.0.1')),
    ).resolves.toMatchObject({
      created: [],
      updated: expect.arrayContaining([
        'tooling/icon-pipeline/generated/source-manifest.json',
        'tooling/icon-pipeline/generated/output-manifest.json',
      ]),
    });
    await expect(verifyCommittedIconArtifacts(destination)).resolves.toMatchObject({
      authenticatedArtifacts: 3,
    });
  });

  it('cleans stages and preserves the accepted set after a staging failure', async () => {
    const destination = await root();
    const accepted = generated();
    await writeIconArtifacts(destination, accepted);
    await expect(
      writeIconArtifacts(destination, generated(changedCatalog()), {
        simulateFailureAfterStagedFiles: 2,
      }),
    ).rejects.toThrow('failure after staging 2 files');
    expect(await readCommittedIconArtifacts(destination)).toEqual(accepted);
    expect((await readdir(destination)).includes(lockName)).toBe(false);
    expect(await ownedSiblings(destination)).toEqual([]);
  });

  it('rolls back every replacement after an ordinary commit failure', async () => {
    const destination = await root();
    const accepted = generated();
    await writeIconArtifacts(destination, accepted);
    await expect(
      writeIconArtifacts(destination, generated(changedCatalog()), {
        simulateFailureAfterReplacements: 3,
      }),
    ).rejects.toThrow('failure after replacing 3 files');
    expect(await readCommittedIconArtifacts(destination)).toEqual(accepted);
    expect((await readdir(destination)).includes(lockName)).toBe(false);
    expect(await ownedSiblings(destination)).toEqual([]);
  });

  it('commits the output manifest last and recovers an interrupted replacement', async () => {
    const destination = await root();
    const accepted = generated();
    const candidate = generated(changedCatalog());
    await writeIconArtifacts(destination, accepted);
    await expect(
      writeIconArtifacts(destination, candidate, { simulateInterruptionAfterReplacements: 3 }),
    ).rejects.toThrow('interruption after replacing 3 files');
    const interrupted = await readCommittedIconArtifacts(destination);
    expect(interrupted['tooling/icon-pipeline/generated/output-manifest.json']).toBe(
      accepted['tooling/icon-pipeline/generated/output-manifest.json'],
    );
    await expect(
      recoverStaleIconWriterLock(destination, { processState: () => 'absent' }),
    ).resolves.toMatchObject({ status: 'removed' });
    expect(await readCommittedIconArtifacts(destination)).toEqual(accepted);
  });

  it('fails safely for a live, unverifiable, malformed, or symbolic lock', async () => {
    const destination = await root();
    await writeIconArtifacts(destination, generated());
    const lock = { format: 1, owner, pid: process.pid, state: 'acquired' };
    await writeFile(join(destination, lockName), `${JSON.stringify(lock)}\n`, 'utf8');
    await expect(writeIconArtifacts(destination, generated())).rejects.toThrow(
      `held by process ${process.pid}`,
    );
    await expect(
      recoverStaleIconWriterLock(destination, { processState: () => 'live' }),
    ).rejects.toThrow('belongs to live process');
    await expect(
      recoverStaleIconWriterLock(destination, { processState: () => 'unverifiable' }),
    ).rejects.toThrow('cannot be verified as absent');
    await rm(join(destination, lockName));
    await writeFile(join(destination, lockName), '{bad', 'utf8');
    await expect(recoverStaleIconWriterLock(destination)).rejects.toThrow('not valid JSON');
    await rm(join(destination, lockName));
    const target = join(destination, 'user-lock-data');
    await writeFile(target, 'keep\n', 'utf8');
    await symlink(target, join(destination, lockName));
    await expect(recoverStaleIconWriterLock(destination)).rejects.toThrow('must be a regular file');
    expect(await readFile(target, 'utf8')).toBe('keep\n');
  });

  it('refuses stale-lock removal when the committed set cannot verify', async () => {
    const destination = await root();
    await writeFile(
      join(destination, lockName),
      `${JSON.stringify({ format: 1, owner, pid: 999_999, state: 'acquired' })}\n`,
      'utf8',
    );
    await expect(
      recoverStaleIconWriterLock(destination, { processState: () => 'absent' }),
    ).rejects.toThrow(/missing/);
    expect(await readdir(destination)).toContain(lockName);
  });

  it('rejects a symbolic-link parent and preserves its external target', async () => {
    const destination = await root();
    const external = await root();
    await writeFile(join(external, 'keep'), 'keep\n', 'utf8');
    await symlink(external, join(destination, 'packages'));
    await expect(writeIconArtifacts(destination, generated())).rejects.toThrow(
      'not a safe directory',
    );
    expect(await readFile(join(external, 'keep'), 'utf8')).toBe('keep\n');
  });

  it('preserves similarly prefixed unknown files during rollback and recovery', async () => {
    const destination = await root();
    const accepted = generated();
    await writeIconArtifacts(destination, accepted);
    const runtime = join(destination, ...generatedArtifactPaths[0].split('/'));
    const unknown = `${runtime}.wayglass-icon-stage-${owner}-user`;
    await writeFile(unknown, 'keep\n', 'utf8');
    await expect(
      writeIconArtifacts(destination, generated(changedCatalog()), {
        simulateFailureAfterReplacements: 1,
      }),
    ).rejects.toThrow('failure after replacing 1 files');
    expect(await readFile(unknown, 'utf8')).toBe('keep\n');

    await expect(
      writeIconArtifacts(destination, generated(changedCatalog()), {
        simulateInterruptionAfterReplacements: 1,
      }),
    ).rejects.toThrow('interruption after replacing 1 files');
    const lock = JSON.parse(await readFile(join(destination, lockName), 'utf8')) as {
      owner: string;
    };
    const interruptedUnknown = `${runtime}.wayglass-icon-stage-${lock.owner}-user`;
    await writeFile(interruptedUnknown, 'keep-interrupted\n', 'utf8');
    await recoverStaleIconWriterLock(destination, { processState: () => 'absent' });
    expect(await readFile(interruptedUnknown, 'utf8')).toBe('keep-interrupted\n');
  });
});
