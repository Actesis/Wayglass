import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, resolve } from 'node:path';

import {
  consumerPackageNames,
  projectConsumerManifest,
  projectConsumerWorkspace,
  validateConsumerTemplate,
} from './consumer.ts';
import { offlineEnvironment } from './environment.ts';
import { readEvidence, verifyEvidenceFiles } from './evidence.ts';
import { fail } from './error.ts';
import type {
  CommandRunner,
  ConsumerProjectContext,
  ConsumerTemplate,
  JsonValue,
} from './types.ts';

export interface ConsumerHarnessRequest {
  readonly evidencePath: string;
  readonly storePath: string;
  readonly template: ConsumerTemplate;
  readonly runner: CommandRunner;
  readonly environment: NodeJS.ProcessEnv;
}

function serialize(value: JsonValue): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function validateConsumerStore(path: string): string {
  if (!isAbsolute(path) || !existsSync(path)) {
    fail('WG_RC_CONSUMER_STORE', 'Consumer store must be an existing absolute path.');
  }
  const store = realpathSync(path);
  if (!lstatSync(store).isDirectory()) {
    fail('WG_RC_CONSUMER_STORE', 'Consumer store must be a directory.');
  }
  return store;
}

export async function withConsumerProject<T>(
  request: ConsumerHarnessRequest,
  use: (context: ConsumerProjectContext) => Promise<T>,
): Promise<T> {
  const environment = offlineEnvironment(request.environment);
  const store = validateConsumerStore(request.storePath);
  validateConsumerTemplate(request.template);
  const evidence = readEvidence(request.evidencePath);
  verifyEvidenceFiles(request.evidencePath, evidence);

  const root = mkdtempSync(resolve(tmpdir(), `wayglass-rc-${request.template.scenario.kind}-`));
  try {
    const vendor = resolve(root, 'vendor');
    mkdirSync(vendor);
    const tarballs: Record<string, string> = {};
    for (const name of consumerPackageNames(request.template.scenario.kind)) {
      const candidate = evidence.packages.find((entry) => entry.name === name);
      if (candidate === undefined) {
        fail('WG_RC_CONSUMER_TARBALL', `Evidence does not contain ${name}.`);
      }
      const source = resolve(dirname(request.evidencePath), 'packages', candidate.file);
      if (!lstatSync(source).isFile()) {
        fail('WG_RC_CONSUMER_TARBALL', `${name} candidate must be a regular file.`);
      }
      cpSync(source, resolve(vendor, candidate.file), { errorOnExist: true });
      tarballs[name] = `file:./vendor/${candidate.file}`;
    }

    writeFileSync(
      resolve(root, 'package.json'),
      serialize(projectConsumerManifest(request.template.scenario, tarballs)),
      { encoding: 'utf8', flag: 'wx' },
    );
    writeFileSync(
      resolve(root, 'pnpm-workspace.yaml'),
      projectConsumerWorkspace(request.template.scenario, tarballs),
      { encoding: 'utf8', flag: 'wx' },
    );
    for (const file of request.template.files) {
      const destination = resolve(root, file.path);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, file.contents, { encoding: 'utf8', flag: 'wx' });
    }
    const userConfig = resolve(root, '.empty-npmrc');
    writeFileSync(userConfig, '', { encoding: 'utf8', flag: 'wx' });
    const isolatedEnvironment = Object.freeze({
      ...environment,
      npm_config_cache: resolve(root, '.npm-cache'),
      pnpm_config_store_dir: store,
      npm_config_userconfig: userConfig,
    });
    const sharedArguments = ['--offline', '--ignore-scripts', '--store-dir', store] as const;
    try {
      await request.runner({
        command: 'pnpm',
        arguments: ['install', '--lockfile-only', '--no-frozen-lockfile', ...sharedArguments],
        cwd: root,
        environment: isolatedEnvironment,
      });
      await request.runner({
        command: 'pnpm',
        arguments: ['install', '--frozen-lockfile', ...sharedArguments],
        cwd: root,
        environment: isolatedEnvironment,
      });
    } catch (error) {
      fail(
        'WG_RC_CONSUMER_OFFLINE_MATERIAL',
        `Offline consumer installation failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
    return await use({
      root,
      scenario: request.template.scenario,
      run: request.runner,
      environment: isolatedEnvironment,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
