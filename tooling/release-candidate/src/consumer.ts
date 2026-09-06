import {
  consumerBuildVersions,
  consumerPackageDirectories,
  consumerReactVersions,
  consumerTypeScriptVersions,
} from './constants.ts';
import { fail } from './error.ts';
import type { ConsumerKind, ConsumerScenario, ConsumerTemplate, JsonValue } from './types.ts';

const reservedRoots = new Set([
  '.git',
  '.npmrc',
  '.pnpmfile.cjs',
  'node_modules',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'vendor',
]);

function acceptedScenario(scenario: ConsumerScenario): ConsumerScenario {
  const expected = consumerScenarios().find(({ id }) => id === scenario.id);
  if (expected === undefined || JSON.stringify(expected) !== JSON.stringify(scenario)) {
    fail('WG_RC_CONSUMER_SCENARIO', `Unsupported consumer scenario ${scenario.id}.`);
  }
  return expected;
}

function validateTemplatePath(path: string): void {
  const segments = path.split('/');
  if (
    path.length === 0 ||
    path.startsWith('/') ||
    path.includes('\\') ||
    segments.some((segment) => segment === '' || segment === '.' || segment === '..') ||
    reservedRoots.has(segments[0]!.toLowerCase()) ||
    [...path].some((character) => {
      const code = character.codePointAt(0)!;
      return code <= 31 || code === 127;
    })
  ) {
    fail('WG_RC_CONSUMER_PATH', `Unsafe consumer-template path "${path}".`);
  }
}

export function consumerScenarios(): readonly ConsumerScenario[] {
  return Object.freeze([
    ...consumerTypeScriptVersions.map((typescript) =>
      Object.freeze({ id: `vanilla-ts-${typescript}`, kind: 'vanilla' as const, typescript }),
    ),
    ...consumerTypeScriptVersions.flatMap((typescript) =>
      consumerReactVersions.map((react) =>
        Object.freeze({
          id: `react-${react.react}-ts-${typescript}`,
          kind: 'react' as const,
          typescript,
          react,
        }),
      ),
    ),
  ]);
}

export function validateConsumerTemplate(template: ConsumerTemplate): void {
  acceptedScenario(template.scenario);
  const portablePaths = new Set<string>();
  for (const file of template.files) {
    validateTemplatePath(file.path);
    const portable = file.path.normalize('NFC').toLowerCase();
    if (portablePaths.has(portable)) {
      fail('WG_RC_CONSUMER_COLLISION', `Consumer-template path ${file.path} collides.`);
    }
    portablePaths.add(portable);
  }
  if (template.files.length === 0) {
    fail('WG_RC_CONSUMER_FILES', 'Consumer template must contain at least one authored file.');
  }
}

export function projectConsumerManifest(
  scenario: ConsumerScenario,
  tarballs: Readonly<Record<string, string>>,
): JsonValue {
  acceptedScenario(scenario);
  const directories = consumerPackageDirectories[scenario.kind];
  const expectedNames = directories.map((directory) => `@wayglass/${directory}`).sort();
  if (JSON.stringify(Object.keys(tarballs).sort()) !== JSON.stringify(expectedNames)) {
    fail('WG_RC_CONSUMER_TARBALL', 'Consumer tarballs must match the exact scenario package set.');
  }
  const dependencies: Record<string, string> = {};
  for (const directory of directories) {
    const name = `@wayglass/${directory}`;
    const tarball = tarballs[name];
    if (tarball === undefined || !/^file:\.\/vendor\/[a-z0-9._-]+\.tgz$/.test(tarball)) {
      fail('WG_RC_CONSUMER_TARBALL', `Missing safe local tarball for ${name}.`);
    }
    dependencies[name] = tarball;
  }
  const external = consumerMaterialDependencies(scenario);
  Object.assign(dependencies, external.dependencies);
  return Object.freeze({
    name: `wayglass-release-probe-${scenario.id}`,
    version: '0.0.0',
    private: true,
    type: 'module',
    dependencies: Object.freeze(dependencies),
    devDependencies: external.devDependencies,
  });
}

export function consumerPackageNames(kind: ConsumerKind): readonly string[] {
  return Object.freeze(
    consumerPackageDirectories[kind].map((directory) => `@wayglass/${directory}`),
  );
}

export function projectConsumerMaterialManifest(scenario: ConsumerScenario): JsonValue {
  acceptedScenario(scenario);
  const external = consumerMaterialDependencies(scenario);
  return Object.freeze({
    name: `wayglass-release-material-${scenario.id}`,
    version: '0.0.0',
    private: true,
    dependencies: external.dependencies,
    devDependencies: external.devDependencies,
  });
}

function consumerMaterialDependencies(scenario: ConsumerScenario): {
  readonly dependencies: Readonly<Record<string, string>>;
  readonly devDependencies: Readonly<Record<string, string>>;
} {
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {
    typescript: scenario.typescript,
    vite: consumerBuildVersions.vite,
  };
  if (scenario.kind === 'react') {
    if (scenario.react === undefined) {
      fail('WG_RC_CONSUMER_REACT', 'React scenario requires an exact React version line.');
    }
    dependencies.react = scenario.react.react;
    dependencies['react-dom'] = scenario.react.reactDom;
    devDependencies['@types/react'] = scenario.react.reactTypes;
    devDependencies['@types/react-dom'] = scenario.react.reactDomTypes;
  } else if (scenario.react !== undefined) {
    fail('WG_RC_CONSUMER_REACT', 'Vanilla scenario cannot declare React versions.');
  }
  return Object.freeze({
    dependencies: Object.freeze(dependencies),
    devDependencies: Object.freeze(devDependencies),
  });
}
