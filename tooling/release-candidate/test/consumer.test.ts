import { describe, expect, it } from 'vitest';

import {
  consumerPackageNames,
  consumerScenarios,
  projectConsumerMaterialManifest,
  projectConsumerManifest,
  projectConsumerWorkspace,
  validateConsumerTemplate,
} from '../src/consumer.ts';
import type { ConsumerScenario, ConsumerTemplate } from '../src/types.ts';

function tarballs(kind: 'vanilla' | 'react'): Record<string, string> {
  return Object.fromEntries(
    consumerPackageNames(kind).map((name) => [
      name,
      `file:./vendor/${name.replace('@wayglass/', 'wayglass-')}-0.1.0.tgz`,
    ]),
  );
}

describe('release-candidate consumer contract', () => {
  it('defines the exact two Vanilla and four React compatibility scenarios', () => {
    expect(consumerScenarios().map(({ id }) => id)).toEqual([
      'vanilla-ts-5.9.3',
      'vanilla-ts-6.0.3',
      'react-19.0.0-ts-5.9.3',
      'react-19.2.8-ts-5.9.3',
      'react-19.0.0-ts-6.0.3',
      'react-19.2.8-ts-6.0.3',
    ]);
  });

  it('projects private script-free manifests with local Wayglass tarballs only', () => {
    const [vanilla, , react] = consumerScenarios();
    const vanillaManifest = projectConsumerManifest(vanilla!, tarballs('vanilla'));
    const reactManifest = projectConsumerManifest(react!, tarballs('react'));
    expect(vanillaManifest).toMatchObject({
      private: true,
      dependencies: {
        '@wayglass/core': 'file:./vendor/wayglass-core-0.1.0.tgz',
        '@wayglass/icons': 'file:./vendor/wayglass-icons-0.1.0.tgz',
      },
      devDependencies: { typescript: '5.9.3', vite: '8.1.5' },
    });
    expect(reactManifest).toMatchObject({
      dependencies: { react: '19.0.0', 'react-dom': '19.0.0' },
      devDependencies: {
        '@types/react': '19.0.0',
        '@types/react-dom': '19.0.0',
        typescript: '5.9.3',
      },
    });
    expect(vanillaManifest).not.toHaveProperty('scripts');
    expect(vanillaManifest).not.toHaveProperty('pnpm');
    expect(JSON.stringify(vanillaManifest)).not.toContain('workspace:');
    expect(JSON.stringify(vanillaManifest)).not.toContain('https:');
    expect(projectConsumerWorkspace(vanilla!, tarballs('vanilla'))).toContain(
      '"@wayglass/themes": "file:./vendor/wayglass-themes-0.1.0.tgz"',
    );
  });

  it('projects third-party-only material preflight manifests for every scenario', () => {
    const manifests = consumerScenarios().map(projectConsumerMaterialManifest);
    expect(manifests[0]).toMatchObject({
      name: 'wayglass-release-material-vanilla-ts-5.9.3',
      private: true,
      dependencies: {},
      devDependencies: { typescript: '5.9.3', vite: '8.1.5' },
    });
    expect(manifests[2]).toMatchObject({
      dependencies: { react: '19.0.0', 'react-dom': '19.0.0' },
      devDependencies: {
        '@types/react': '19.0.0',
        '@types/react-dom': '19.0.0',
        typescript: '5.9.3',
        vite: '8.1.5',
      },
    });
    expect(JSON.stringify(manifests)).not.toContain('@wayglass/');
    expect(JSON.stringify(manifests)).not.toContain('workspace:');
  });

  it('rejects unsafe, reserved, colliding, empty, and mismatched templates', () => {
    const scenario = consumerScenarios()[0]!;
    const template = (files: ConsumerTemplate['files']): ConsumerTemplate => ({ scenario, files });
    for (const path of [
      '/tmp/x.ts',
      '../x.ts',
      'src\\x.ts',
      '.npmrc',
      '.git/config',
      'node_modules/x.ts',
      'package.json',
      'pnpm-workspace.yaml',
    ]) {
      expect(() => validateConsumerTemplate(template([{ path, contents: '' }]))).toThrowError(
        /WG_RC_CONSUMER_PATH/,
      );
    }
    expect(() => validateConsumerTemplate(template([]))).toThrowError(/WG_RC_CONSUMER_FILES/);
    expect(() =>
      validateConsumerTemplate(
        template([
          { path: 'src/café.ts', contents: '' },
          { path: 'SRC/CAFÉ.TS', contents: '' },
        ]),
      ),
    ).toThrowError(/WG_RC_CONSUMER_COLLISION/);
    expect(() =>
      validateConsumerTemplate({
        scenario: { ...scenario, typescript: '6.0.3' } as ConsumerScenario,
        files: [{ path: 'src/index.ts', contents: '' }],
      }),
    ).toThrowError(/WG_RC_CONSUMER_SCENARIO/);
  });

  it('rejects missing, remote, or mismatched React inputs', () => {
    const scenario = consumerScenarios()[0]!;
    expect(() => projectConsumerManifest(scenario, {})).toThrowError(/WG_RC_CONSUMER_TARBALL/);
    expect(() =>
      projectConsumerManifest(scenario, {
        ...tarballs('vanilla'),
        '@wayglass/core': 'https://registry.example/core.tgz',
      }),
    ).toThrowError(/WG_RC_CONSUMER_TARBALL/);
    expect(() =>
      projectConsumerManifest(scenario, {
        ...tarballs('vanilla'),
        '@wayglass/react': 'file:./vendor/wayglass-react-0.1.0.tgz',
      }),
    ).toThrowError(/WG_RC_CONSUMER_TARBALL/);
    expect(() =>
      projectConsumerManifest(
        { ...scenario, react: consumerScenarios()[2]!.react! },
        tarballs('vanilla'),
      ),
    ).toThrowError(/WG_RC_CONSUMER_SCENARIO/);
  });
});
