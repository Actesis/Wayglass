import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { packageManagerInvocation } from './assembler.ts';
import { validateConsumerStore } from './consumer-harness.ts';
import { consumerScenarios, projectConsumerMaterialManifest } from './consumer.ts';
import { offlineEnvironment } from './environment.ts';
import { validateNewOutputPath } from './path-safety.ts';
import type { CommandRunner } from './types.ts';

// Explicit preparation only: never called by an offline build or consumer proof.
export async function provisionConsumerMaterial(
  repositoryRoot: string,
  storePath: string,
  outputPath: string,
  runner: CommandRunner,
  inputEnvironment: NodeJS.ProcessEnv,
): Promise<void> {
  const offline = offlineEnvironment(inputEnvironment); // Reject release credentials first.
  const store = validateConsumerStore(storePath);
  const output = validateNewOutputPath(outputPath, repositoryRoot);
  const root = mkdtempSync(resolve(tmpdir(), 'wayglass-consumer-provision-'));
  mkdirSync(output);
  try {
    const userConfig = resolve(root, 'empty-npmrc');
    writeFileSync(userConfig, '', { flag: 'wx' });
    const environment = {
      ...offline,
      PNPM_CONFIG_OFFLINE: 'false',
      npm_config_offline: 'false',
      npm_config_registry: 'https://registry.npmjs.org/',
      npm_config_userconfig: userConfig,
      npm_config_cache: resolve(root, '.npm-cache'),
    };
    for (const scenario of consumerScenarios()) {
      const project = resolve(root, scenario.id);
      mkdirSync(project);
      const manifest = `${JSON.stringify(projectConsumerMaterialManifest(scenario), null, 2)}\n`;
      writeFileSync(resolve(project, 'package.json'), manifest, { flag: 'wx' });
      await runner({
        ...packageManagerInvocation(environment, [
          'install',
          '--no-frozen-lockfile',
          '--ignore-scripts',
          '--offline=false',
          '--registry',
          'https://registry.npmjs.org/',
          '--store-dir',
          store,
        ]),
        cwd: project,
        environment,
      });
      const retained = resolve(output, scenario.id);
      mkdirSync(retained);
      writeFileSync(resolve(retained, 'package.json'), manifest, { flag: 'wx' });
      writeFileSync(
        resolve(retained, 'pnpm-lock.yaml'),
        readFileSync(resolve(project, 'pnpm-lock.yaml')),
        { flag: 'wx' },
      );
    }
    writeFileSync(
      resolve(output, 'complete.json'),
      `${JSON.stringify({ scenarios: 6, registry: 'https://registry.npmjs.org/', scripts: false, publication: false }, null, 2)}\n`,
      { flag: 'wx' },
    );
  } finally {
    // Only ephemeral projects are removed. Retain successful lockfiles if preparation fails.
    rmSync(root, { recursive: true, force: true });
  }
}
