import { execFile } from 'node:child_process';
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, relative, resolve } from 'node:path';
import { promisify } from 'node:util';

import { fail } from './error.ts';
import { maximumReceiptBytes, reviewedStageIdentity } from './staging-protocol.ts';
import type { StageUploadIntent } from './staging-protocol.ts';

const execute = promisify(execFile);
const version = '11.21.2';
// Resource bounds for one child; neither timeout nor output overflow permits a retry.
const uploadTimeoutMs = 120_000;
const versionTimeoutMs = 10_000;

function regular(path: string): void {
  if (!lstatSync(path).isFile()) fail('WG_STAGE_TRANSPORT', 'A required regular file is missing.');
}

/** Unwired transport. Only a reviewed wrapper may supply a verified CLI install, signed
 * provenance and the separately authorized stage-only credential. */
export function createRestrictedNpmUpload(options: {
  readonly npmCli: string;
  readonly provenance: (intent: StageUploadIntent) => Promise<Uint8Array>;
  readonly stageToken: () => string;
}): (intent: StageUploadIntent, ownedRoot: string) => Promise<string> {
  const { npmCli, provenance, stageToken } = options;
  return async (intent, ownedRoot) => {
    let scratch: string | undefined;
    try {
      const root = realpathSync(ownedRoot);
      const child = relative(realpathSync(tmpdir()), root);
      if (
        !child ||
        child === '..' ||
        child.startsWith('../') ||
        isAbsolute(child) ||
        root !== ownedRoot ||
        !lstatSync(root).isDirectory() ||
        !isAbsolute(npmCli)
      )
        fail('WG_STAGE_TRANSPORT', 'Transport paths must be canonical and isolated.');
      regular(npmCli);
      if (realpathSync(npmCli) !== npmCli) fail('WG_STAGE_TRANSPORT', 'Unexpected CLI path.');
      const file = intent.package.file;
      if (
        intent.operation !== 'stage-upload' ||
        intent.npmVersion !== version ||
        !/^wayglass-(core|tokens|themes|elements|icons|react)-0\.1\.0\.tgz$/.test(file)
      )
        fail('WG_STAGE_TRANSPORT', 'Upload intent is outside the reviewed scope.');
      const packages = resolve(root, 'packages');
      if (!lstatSync(packages).isDirectory())
        fail('WG_STAGE_TRANSPORT', 'Unexpected package directory.');
      const archivePath = resolve(packages, file);
      regular(archivePath);
      const archive = readFileSync(archivePath);
      const identity = reviewedStageIdentity({ file, bytes: archive });
      if (
        Object.keys(identity).some(
          (key) =>
            identity[key as keyof typeof identity] !== intent.package[key as keyof typeof identity],
        )
      )
        fail('WG_STAGE_TRANSPORT', 'Upload intent does not match the exact reviewed archive.');

      const bundle = Buffer.from(await provenance(intent));
      if (bundle.length === 0 || bundle.length > maximumReceiptBytes)
        fail('WG_STAGE_TRANSPORT', 'A bounded, signed provenance bundle is required.');
      scratch = mkdtempSync(resolve(root, 'npm-upload-'));
      const userconfig = resolve(scratch, 'stage.npmrc');
      const globalconfig = resolve(scratch, 'empty.npmrc');
      const archiveCopy = resolve(scratch, file);
      const provenanceFile = resolve(scratch, 'provenance.sigstore.json');
      mkdirSync(resolve(scratch, 'home'), { mode: 0o700 });
      for (const [path, bytes] of [
        [userconfig, '//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\n'],
        [globalconfig, ''],
        [archiveCopy, archive],
        [provenanceFile, bundle],
      ] as const)
        writeFileSync(path, bytes, { mode: 0o600, flag: 'wx' });

      const env = { HOME: resolve(scratch, 'home'), CI: 'true', NO_COLOR: '1' };
      const config = [
        `--userconfig=${userconfig}`,
        `--globalconfig=${globalconfig}`,
        `--cache=${resolve(scratch, 'cache')}`,
        `--prefix=${scratch}`,
        '--logs-max=0',
        '--loglevel=silent',
        '--update-notifier=false',
      ];
      const run = (args: string[], timeout: number, childEnv: NodeJS.ProcessEnv) =>
        execute(process.execPath, [npmCli, ...config, ...args], {
          cwd: scratch,
          env: childEnv,
          timeout,
          killSignal: 'SIGKILL',
          maxBuffer: maximumReceiptBytes,
          shell: false,
        });
      const reported = await run(['--version'], versionTimeoutMs, env);
      if (reported.stdout.trim() !== version)
        fail('WG_STAGE_TRANSPORT', 'Pinned npm version mismatch.');
      const token = stageToken();
      if (!/^npm_[A-Za-z0-9]+$/.test(token))
        fail('WG_STAGE_TRANSPORT', 'An authorized stage-only token is required.');

      // Do not forward the intent argv or ambient OIDC variables. npm verifies the supplied
      // provenance bundle and its subject; the wrapper must verify signer and run policy separately.
      const result = await run(
        [
          'stage',
          'publish',
          `./${file}`,
          '--registry=https://registry.npmjs.org/',
          '--access=public',
          '--tag=next',
          '--ignore-scripts',
          '--workspaces=false',
          '--provenance=false',
          `--provenance-file=${provenanceFile}`,
          '--json',
          '--fetch-retries=0',
          '--audit=false',
          '--fund=false',
        ],
        uploadTimeoutMs,
        { ...env, NODE_AUTH_TOKEN: token },
      );
      if (result.stdout.includes(token))
        fail('WG_STAGE_TRANSPORT', 'Child output contained credential material.');
      return result.stdout;
    } catch {
      return fail(
        'WG_STAGE_TRANSPORT',
        'Restricted npm transport stopped; inspect the retained intent. No retry is authorized.',
      );
    } finally {
      if (scratch !== undefined) rmSync(scratch, { recursive: true, force: true });
    }
  };
}
