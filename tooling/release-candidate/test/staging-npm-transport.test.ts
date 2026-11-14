import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { retainedPublicationArchive } from '../src/publication-preflight.ts';
import { createRestrictedNpmUpload } from '../src/staging-npm-transport.ts';
import { reviewedStageIdentity } from '../src/staging-protocol.ts';
import type { StageUploadIntent } from '../src/staging-protocol.ts';
import { repositoryRoot } from './fixtures.ts';

const file = 'wayglass-core-0.1.0.tgz';
const bytes = execFileSync('unzip', [
  '-p',
  resolve(repositoryRoot, retainedPublicationArchive.path),
  `assembly/packages/${file}`,
]);
const intent: StageUploadIntent = {
  operation: 'stage-upload',
  npmVersion: '11.21.2',
  package: reviewedStageIdentity({ file, bytes }),
  arguments: ['publish', '--registry=https://example.invalid/'],
};

async function fixture(
  source: string,
  run: (input: { root: string; npmCli: string; archive: string }) => Promise<void>,
) {
  const root = mkdtempSync(resolve(realpathSync(tmpdir()), 'wayglass-npm-transport-test-'));
  try {
    const npmCli = resolve(root, 'fake-cli.cjs');
    const archive = resolve(root, 'packages', file);
    mkdirSync(resolve(root, 'packages'));
    writeFileSync(archive, bytes);
    writeFileSync(npmCli, source);
    await run({ root, npmCli, archive });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const versionProbe = `if (process.argv.includes('--version')) {
  if (process.env.NODE_AUTH_TOKEN) process.exit(10);
  console.log('11.21.2'); process.exit(0);
}`;

describe('restricted npm child transport', () => {
  it('uses only fixed staging arguments and isolates the credential and config', async () => {
    await fixture(
      `${versionProbe}
      const fs = require('node:fs');
      const args = process.argv.slice(2);
      const conf = args.find(x => x.startsWith('--userconfig=')).split('=')[1];
      const proof = args.find(x => x.startsWith('--provenance-file=')).split('=')[1];
      console.log(JSON.stringify({
        placeholder: fs.readFileSync(conf, 'utf8').includes('${'${NODE_AUTH_TOKEN}'}'),
        tokenCorrect: process.env.NODE_AUTH_TOKEN === 'npm_FictionalToken',
        keys: Object.keys(process.env).sort(),
        proofCorrect: fs.readFileSync(proof, 'utf8') === 'fictional-bundle',
        args: args.filter(x => !x.includes(process.cwd())),
      }));
    `,
      async ({ root, npmCli }) => {
        const upload = createRestrictedNpmUpload({
          npmCli,
          provenance: async () => Buffer.from('fictional-bundle'),
          stageToken: () => 'npm_FictionalToken',
        });
        const { args, keys, ...checks } = JSON.parse(await upload(intent, root));
        expect(checks).toEqual({ placeholder: true, tokenCorrect: true, proofCorrect: true });
        expect(keys.filter((key: string) => key !== '__CF_USER_TEXT_ENCODING')).toEqual([
          'CI',
          'HOME',
          'NODE_AUTH_TOKEN',
          'NO_COLOR',
        ]);
        expect(args).toEqual([
          '--logs-max=0',
          '--loglevel=silent',
          '--update-notifier=false',
          'stage',
          'publish',
          `./${file}`,
          '--registry=https://registry.npmjs.org/',
          '--access=public',
          '--tag=next',
          '--ignore-scripts',
          '--workspaces=false',
          '--provenance=false',
          '--json',
          '--fetch-retries=0',
          '--audit=false',
          '--fund=false',
        ]);
        expect(readdirSync(root).sort()).toEqual(['fake-cli.cjs', 'packages']);
      },
    );
  });

  it('does not obtain a token for a wrong npm version, missing bundle, or changed archive', async () => {
    await fixture("console.log('11.19.0')", async ({ root, npmCli, archive }) => {
      let tokenRequests = 0;
      let bundle = Buffer.from('fictional-bundle');
      const upload = createRestrictedNpmUpload({
        npmCli,
        provenance: async () => bundle,
        stageToken: () => {
          tokenRequests++;
          return 'npm_FictionalToken';
        },
      });
      await expect(upload(intent, root)).rejects.toThrow(/WG_STAGE_TRANSPORT/);
      writeFileSync(npmCli, versionProbe);
      bundle = Buffer.alloc(0);
      await expect(upload(intent, root)).rejects.toThrow(/WG_STAGE_TRANSPORT/);
      bundle = Buffer.from('fictional-bundle');
      writeFileSync(archive, 'changed');
      await expect(upload(intent, root)).rejects.toThrow(/WG_STAGE_TRANSPORT/);
      expect(tokenRequests).toBe(0);
    });
  });

  it('discards credential-like child errors and stops on oversized output', async () => {
    await fixture(
      `${versionProbe}
      process.stderr.write(process.env.NODE_AUTH_TOKEN);
      process.exit(15);
    `,
      async ({ root, npmCli }) => {
        const upload = createRestrictedNpmUpload({
          npmCli,
          provenance: async () => Buffer.from('fictional-bundle'),
          stageToken: () => 'npm_FictionalToken',
        });
        for (const oversized of [false, true]) {
          if (oversized)
            writeFileSync(npmCli, `${versionProbe}\nconsole.log('x'.repeat(3 * 1024 * 1024));`);
          const error: unknown = await upload(intent, root).catch((err: unknown) => err);
          expect(String(error)).toMatch(/WG_STAGE_TRANSPORT.*No retry/);
          expect(String(error)).not.toContain('npm_FictionalToken');
        }
        expect(readdirSync(root).sort()).toEqual(['fake-cli.cjs', 'packages']);
      },
    );
  });
});
