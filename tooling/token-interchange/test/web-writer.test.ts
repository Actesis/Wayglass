import { mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { writeWebArtifacts } from '../src/web-writer.js';

const roots: string[] = [];

async function root(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), 'wayglass-web-writer-'));
  roots.push(path);
  return path;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe('atomic web artifact writer', () => {
  it('creates, updates, and leaves identical artifacts unchanged', async () => {
    const destination = await root();
    const first = join(destination, 'tokens.css');
    const second = join(destination, 'tokens.json');

    await expect(
      writeWebArtifacts([
        { path: first, content: 'first\n' },
        { path: second, content: 'second\n' },
      ]),
    ).resolves.toMatchObject({ created: [first, second], unchanged: [], updated: [] });
    await expect(
      writeWebArtifacts([
        { path: first, content: 'changed\n' },
        { path: second, content: 'second\n' },
      ]),
    ).resolves.toMatchObject({ created: [], unchanged: [second], updated: [first] });
    expect(await readFile(first, 'utf8')).toBe('changed\n');
  });

  it('removes stages and preserves accepted files after a staging failure', async () => {
    const destination = await root();
    const first = join(destination, 'tokens.css');
    const second = join(destination, 'tokens.json');
    await writeFile(first, 'accepted-one\n', 'utf8');
    await writeFile(second, 'accepted-two\n', 'utf8');

    await expect(
      writeWebArtifacts(
        [
          { path: first, content: 'candidate-one\n' },
          { path: second, content: 'candidate-two\n' },
        ],
        { simulateFailureAfterStagedFiles: 1 },
      ),
    ).rejects.toThrow('failure after staging 1 files');
    expect(await readFile(first, 'utf8')).toBe('accepted-one\n');
    expect(await readFile(second, 'utf8')).toBe('accepted-two\n');
    expect((await readdir(destination)).some((name) => name.includes('.wayglass-tmp-'))).toBe(
      false,
    );
  });

  it('rolls back every replacement when committing the set fails', async () => {
    const destination = await root();
    const first = join(destination, 'tokens.css');
    const second = join(destination, 'tokens.json');
    await writeFile(first, 'accepted-one\n', 'utf8');
    await writeFile(second, 'accepted-two\n', 'utf8');

    await expect(
      writeWebArtifacts(
        [
          { path: first, content: 'candidate-one\n' },
          { path: second, content: 'candidate-two\n' },
        ],
        { simulateFailureAfterReplacements: 1 },
      ),
    ).rejects.toThrow('failure after replacing 1 files');
    expect(await readFile(first, 'utf8')).toBe('accepted-one\n');
    expect(await readFile(second, 'utf8')).toBe('accepted-two\n');
    expect((await readdir(destination)).some((name) => name.includes('.wayglass-'))).toBe(false);
  });

  it('rejects duplicate outputs before replacing anything', async () => {
    const destination = await root();
    const path = join(destination, 'tokens.css');
    await writeFile(path, 'accepted\n', 'utf8');

    await expect(
      writeWebArtifacts([
        { path, content: 'one\n' },
        { path, content: 'two\n' },
      ]),
    ).rejects.toThrow('is duplicated');
    expect(await readFile(path, 'utf8')).toBe('accepted\n');
  });

  it('rejects a symbolic-link output without changing its target', async () => {
    const destination = await root();
    const target = join(destination, 'user-data');
    const path = join(destination, 'tokens.css');
    await writeFile(target, 'keep\n', 'utf8');
    await symlink(target, path);

    await expect(writeWebArtifacts([{ path, content: 'replace\n' }])).rejects.toThrow(
      'must be a regular file and not a symbolic link',
    );
    expect(await readFile(target, 'utf8')).toBe('keep\n');
  });

  it('requires at least one safe output path', async () => {
    await expect(writeWebArtifacts([])).rejects.toThrow('requires at least one output');
    await expect(writeWebArtifacts([{ path: '/', content: 'unsafe' }])).rejects.toThrow(
      'is unsafe',
    );
  });
});
