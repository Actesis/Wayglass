import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { buildPublicationArtifacts } from '../src/assembler.ts';
import { candidateDirectories, frozenSource } from '../src/constants.ts';
import { sha256 } from '../src/hash.ts';
import { serializeProjectedManifest } from '../src/manifest.ts';
import { runCommand } from '../src/process.ts';
import { verifyPublicationArtifacts } from '../src/publication-artifacts.ts';
import { projectPublicationManifest } from '../src/publication-plan.ts';
import type { CommandRunner, PublicationEvidence } from '../src/types.ts';
import { repositoryRoot, sourceManifest } from './fixtures.ts';

let root: string | undefined;
afterEach(() => {
  if (root !== undefined) rmSync(root, { recursive: true, force: true });
  root = undefined;
});

function fixture() {
  root = mkdtempSync(resolve(tmpdir(), 'wayglass-public-review-'));
  mkdirSync(resolve(root, 'packages'));
  const manifests = new Map<string, string>();
  const packages = candidateDirectories.map((directory) => {
    const file = `wayglass-${directory}-0.1.0.tgz`;
    const bytes = Buffer.from(directory);
    const manifest = serializeProjectedManifest(
      projectPublicationManifest(directory, sourceManifest(directory)),
    );
    manifests.set(file, manifest);
    writeFileSync(resolve(root!, 'packages', file), bytes);
    return {
      directory,
      name: `@wayglass/${directory}`,
      version: '0.1.0' as const,
      file,
      bytes: bytes.length,
      sha256: sha256(bytes),
      manifestSha256: sha256(manifest),
      inventorySha256: 'a'.repeat(64),
      unpackedBytes: 1,
      files: [],
    };
  });
  const evidence: PublicationEvidence = {
    schemaVersion: 1,
    artifactKind: 'publication-review',
    publicationAuthorized: false,
    distTag: null,
    source: frozenSource,
    tooling: { commit: 'c'.repeat(40), tree: 'd'.repeat(40) },
    environment: {
      platform: 'test',
      architecture: 'test',
      node: 'v26.8.1',
      pnpm: '11.9.0',
      npm: '11.19.0',
    },
    reproducibility: { runs: 2, byteIdentical: true },
    packages,
  };
  const path = resolve(root, 'publication-evidence.json');
  writeFileSync(path, JSON.stringify(evidence));
  const runner: CommandRunner = async (request) =>
    request.command === 'tar'
      ? { stdout: manifests.get(basename(request.arguments[1]!))!, stderr: '' }
      : runCommand(request);
  return { path, evidence, manifests, runner };
}

describe('public-review artifact boundary', () => {
  it('authenticates the frozen source and verifies six public manifests and tarball hashes', async () => {
    const { path, runner, evidence } = fixture();
    await expect(verifyPublicationArtifacts(repositoryRoot, path, runner, {})).resolves.toEqual(
      evidence,
    );
  });
  it('rejects private or altered manifests even when the archive hash has been recorded', async () => {
    const { path, runner, manifests } = fixture();
    const [file, manifest] = manifests.entries().next().value!;
    manifests.set(file, manifest.replace('"private": false', '"private": true'));
    await expect(verifyPublicationArtifacts(repositoryRoot, path, runner, {})).rejects.toThrow(
      /WG_RC_PUBLICATION_MANIFEST/,
    );
  });
  it('rejects artifact corruption before reading archive contents', async () => {
    const { path, runner, evidence } = fixture();
    writeFileSync(resolve(root!, 'packages', evidence.packages[0]!.file), 'corrupt');
    await expect(verifyPublicationArtifacts(repositoryRoot, path, runner, {})).rejects.toThrow(
      /WG_RC_EVIDENCE_HASH/,
    );
  });
  it('rejects missing review identity and any implied publication authorization', async () => {
    const { path, runner, evidence } = fixture();
    for (const change of [
      { artifactKind: 'private' },
      { publicationAuthorized: true },
      { distTag: 'latest' },
    ]) {
      writeFileSync(path, JSON.stringify({ ...evidence, ...change }));
      await expect(verifyPublicationArtifacts(repositoryRoot, path, runner, {})).rejects.toThrow(
        /WG_RC_EVIDENCE_KIND/,
      );
    }
  });
  it('rejects credentials before starting assembly or verification', async () => {
    const runner: CommandRunner = async () => {
      throw new Error('must not run');
    };
    await expect(
      buildPublicationArtifacts('/absent', 'bad', '/absent', runner, { NPM_TOKEN: 'test' }),
    ).rejects.toThrow(/WG_RC_CREDENTIAL_EXPOSURE/);
    await expect(
      verifyPublicationArtifacts('/absent', '/absent', runner, { NODE_AUTH_TOKEN: 'test' }),
    ).rejects.toThrow(/WG_RC_CREDENTIAL_EXPOSURE/);
  });
});
