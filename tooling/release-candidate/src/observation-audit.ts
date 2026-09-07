import { compactCanonicalJson, serializeCanonicalJson } from './canonical-json.ts';
import {
  candidateDirectories,
  candidateToolVersions,
  consumerBuildVersions,
  consumerReactVersions,
  consumerTypeScriptVersions,
  frozenSource,
  qualityGateIds,
} from './constants.ts';
import { fail } from './error.ts';
import { assertSupportedNode } from './environment.ts';
import {
  exactObservationObject,
  validateEvidenceNotices,
  type EvidenceNotice,
} from './observation.ts';

export interface EnvironmentAuditInput {
  readonly platform: string;
  readonly operatingSystemVersion: string;
  readonly architecture: string;
  readonly node: string;
  readonly pnpm: string;
  readonly npm: string;
  readonly playwright: string;
  readonly browsers: Readonly<Record<'chromium' | 'firefox' | 'webkit', string>>;
  readonly observedAt: string;
  readonly notices?: readonly EvidenceNotice[];
}

export interface EnvironmentAuditEvidence {
  readonly schemaVersion: 1;
  readonly runner: {
    readonly platform: 'darwin' | 'linux' | 'win32';
    readonly operatingSystemVersion: string;
    readonly architecture: 'arm64' | 'x64';
    readonly node: string;
    readonly pnpm: '11.9.0';
    readonly npm: string;
  };
  readonly matrix: {
    readonly typescript: readonly ['5.9.3', '6.0.3'];
    readonly vite: '8.1.5';
    readonly react: typeof consumerReactVersions;
    readonly playwright: '1.62.0';
    readonly browsers: readonly BrowserObservation[];
  };
  readonly controls: {
    readonly registryAccess: 'disabled';
    readonly lifecycleScripts: 'disabled';
    readonly updateChecks: 'disabled';
    readonly turboCache: 'bypassed';
  };
  readonly observedAt: string;
  readonly notices: readonly EvidenceNotice[];
}

export interface BrowserObservation {
  readonly engine: 'chromium' | 'firefox' | 'webkit';
  readonly version: string;
}

export interface QualityGateResult {
  readonly id: (typeof qualityGateIds)[number];
  readonly passed: true;
}

export interface QualityGateEvidence {
  readonly schemaVersion: 1;
  readonly command: {
    readonly program: 'pnpm';
    readonly arguments: readonly ['check'];
    readonly workingDirectory: 'repository-root';
  };
  readonly controls: {
    readonly uncached: true;
    readonly offline: true;
    readonly lifecycleScripts: 'disabled';
  };
  readonly exitCode: 0;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly results: readonly QualityGateResult[];
  readonly notices: readonly EvidenceNotice[];
}

export interface ProvenanceEvidenceInput {
  readonly toolingCommit: string;
  readonly toolingTree: string;
  readonly advisoryInputSha256: string;
  readonly notices?: readonly EvidenceNotice[];
}

export interface ProvenanceEvidence {
  readonly schemaVersion: 1;
  readonly source: typeof frozenSource;
  readonly tooling: { readonly commit: string; readonly tree: string };
  readonly cleanWorktree: true;
  readonly command: {
    readonly program: 'pnpm';
    readonly script: 'release-candidate:integrated';
  };
  readonly inputs: {
    readonly source: 'frozen-source-commit';
    readonly output: 'new-absolute-directory';
    readonly advisorySnapshot: 'approved-local-file';
  };
  readonly packageOrder: readonly string[];
  readonly advisoryInputSha256: string;
  readonly notices: readonly EvidenceNotice[];
}

const versionPattern = /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const browserVersionPattern = /^\d+(?:\.\d+){1,3}$/;
const gitPattern = /^[a-f0-9]{40}$/;
const digestPattern = /^[a-f0-9]{64}$/;
const platforms = new Set(['darwin', 'linux', 'win32']);
const architectures = new Set(['arm64', 'x64']);
const browserEngines = ['chromium', 'firefox', 'webkit'] as const;

function auditFailure(message: string): never {
  return fail('WG_RC_OBSERVATION_AUDIT', message);
}

function exactVersion(value: unknown, label: string): string {
  if (typeof value !== 'string' || !versionPattern.test(value)) {
    auditFailure(`${label} must be an exact semantic version.`);
  }
  return value;
}

function exactBrowserVersion(value: unknown, label: string): string {
  if (typeof value !== 'string' || !browserVersionPattern.test(value)) {
    auditFailure(`${label} must be an exact browser version.`);
  }
  return value;
}

function instant(value: unknown, label: string): { readonly value: string; readonly time: number } {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) {
    auditFailure(`${label} must be a whole-second UTC timestamp.`);
  }
  const time = Date.parse(value);
  if (!Number.isFinite(time) || new Date(time).toISOString() !== value.replace(/Z$/, '.000Z')) {
    auditFailure(`${label} is not a real canonical timestamp.`);
  }
  return { value, time };
}

function notices(value: unknown, label: string): readonly EvidenceNotice[] {
  return validateEvidenceNotices(value ?? [], label);
}

export function collectEnvironmentAudit(input: EnvironmentAuditInput): EnvironmentAuditEvidence {
  return validateEnvironmentAudit({
    schemaVersion: 1,
    runner: {
      platform: input.platform,
      operatingSystemVersion: input.operatingSystemVersion,
      architecture: input.architecture,
      node: input.node,
      pnpm: input.pnpm,
      npm: input.npm,
    },
    matrix: {
      typescript: consumerTypeScriptVersions,
      vite: consumerBuildVersions.vite,
      react: consumerReactVersions,
      playwright: input.playwright,
      browsers: browserEngines.map((engine) => ({ engine, version: input.browsers[engine] })),
    },
    controls: {
      registryAccess: 'disabled',
      lifecycleScripts: 'disabled',
      updateChecks: 'disabled',
      turboCache: 'bypassed',
    },
    observedAt: input.observedAt,
    notices: input.notices ?? [],
  });
}

export function validateEnvironmentAudit(value: unknown): EnvironmentAuditEvidence {
  const evidence = exactObservationObject(
    value,
    ['schemaVersion', 'runner', 'matrix', 'controls', 'observedAt', 'notices'],
    'environment audit',
  );
  if (evidence.schemaVersion !== 1) auditFailure('Environment audit schema version must be 1.');
  const runner = exactObservationObject(
    evidence.runner,
    ['platform', 'operatingSystemVersion', 'architecture', 'node', 'pnpm', 'npm'],
    'environment runner',
  );
  if (typeof runner.platform !== 'string' || !platforms.has(runner.platform)) {
    auditFailure('Environment platform is unsupported.');
  }
  exactBrowserVersion(runner.operatingSystemVersion, 'operating-system version');
  if (typeof runner.architecture !== 'string' || !architectures.has(runner.architecture)) {
    auditFailure('Environment architecture is unsupported.');
  }
  assertSupportedNode(exactVersion(runner.node, 'Node version'));
  if (runner.pnpm !== candidateToolVersions.pnpm) auditFailure('pnpm version differs from 11.9.0.');
  exactVersion(runner.npm, 'npm version');

  const matrix = exactObservationObject(
    evidence.matrix,
    ['typescript', 'vite', 'react', 'playwright', 'browsers'],
    'environment matrix',
  );
  if (
    JSON.stringify(matrix.typescript) !== JSON.stringify(consumerTypeScriptVersions) ||
    matrix.vite !== consumerBuildVersions.vite ||
    compactCanonicalJson(matrix.react) !== compactCanonicalJson(consumerReactVersions) ||
    matrix.playwright !== candidateToolVersions.playwright
  ) {
    auditFailure('Environment matrix differs from the accepted consumer versions.');
  }
  if (!Array.isArray(matrix.browsers) || matrix.browsers.length !== browserEngines.length) {
    auditFailure('Environment matrix must contain all three browser versions.');
  }
  matrix.browsers.forEach((browserValue, index) => {
    const browser = exactObservationObject(
      browserValue,
      ['engine', 'version'],
      `environment browsers[${String(index)}]`,
    );
    if (browser.engine !== browserEngines[index]) {
      auditFailure('Environment browser observations are incomplete or reordered.');
    }
    exactBrowserVersion(browser.version, `${String(browser.engine)} version`);
  });

  const controls = exactObservationObject(
    evidence.controls,
    ['registryAccess', 'lifecycleScripts', 'updateChecks', 'turboCache'],
    'environment controls',
  );
  if (
    controls.registryAccess !== 'disabled' ||
    controls.lifecycleScripts !== 'disabled' ||
    controls.updateChecks !== 'disabled' ||
    controls.turboCache !== 'bypassed'
  ) {
    auditFailure('Environment controls differ from the accepted offline execution boundary.');
  }
  notices(evidence.notices, 'environment notices');
  instant(evidence.observedAt, 'environment observedAt');
  return value as EnvironmentAuditEvidence;
}

export function serializeEnvironmentAudit(value: unknown): string {
  return serializeCanonicalJson(validateEnvironmentAudit(value));
}

export function collectQualityGateEvidence(
  results: readonly QualityGateResult[],
  timing: { readonly startedAt: string; readonly completedAt: string },
  inputNotices: readonly EvidenceNotice[] = [],
): QualityGateEvidence {
  return validateQualityGateEvidence({
    schemaVersion: 1,
    command: { program: 'pnpm', arguments: ['check'], workingDirectory: 'repository-root' },
    controls: { uncached: true, offline: true, lifecycleScripts: 'disabled' },
    exitCode: 0,
    startedAt: timing.startedAt,
    completedAt: timing.completedAt,
    results,
    notices: inputNotices,
  });
}

export function validateQualityGateEvidence(value: unknown): QualityGateEvidence {
  const evidence = exactObservationObject(
    value,
    [
      'schemaVersion',
      'command',
      'controls',
      'exitCode',
      'startedAt',
      'completedAt',
      'results',
      'notices',
    ],
    'quality-gate evidence',
  );
  if (evidence.schemaVersion !== 1 || evidence.exitCode !== 0) {
    auditFailure('Quality-gate evidence must record a successful schema-version-1 run.');
  }
  const startedAt = instant(evidence.startedAt, 'quality startedAt');
  const completedAt = instant(evidence.completedAt, 'quality completedAt');
  if (completedAt.time < startedAt.time) auditFailure('Quality-gate timing is reversed.');
  const command = exactObservationObject(
    evidence.command,
    ['program', 'arguments', 'workingDirectory'],
    'quality command',
  );
  if (
    command.program !== 'pnpm' ||
    JSON.stringify(command.arguments) !== JSON.stringify(['check']) ||
    command.workingDirectory !== 'repository-root'
  ) {
    auditFailure('Quality command differs from the accepted repository command.');
  }
  const controls = exactObservationObject(
    evidence.controls,
    ['uncached', 'offline', 'lifecycleScripts'],
    'quality controls',
  );
  if (
    controls.uncached !== true ||
    controls.offline !== true ||
    controls.lifecycleScripts !== 'disabled'
  ) {
    auditFailure('Quality-gate controls differ from the accepted boundary.');
  }
  if (!Array.isArray(evidence.results) || evidence.results.length !== qualityGateIds.length) {
    auditFailure('Quality-gate evidence must contain every accepted result category.');
  }
  evidence.results.forEach((resultValue, index) => {
    const result = exactObservationObject(
      resultValue,
      ['id', 'passed'],
      `quality results[${String(index)}]`,
    );
    if (result.id !== qualityGateIds[index] || result.passed !== true) {
      auditFailure('Quality-gate results are incomplete, failed, or reordered.');
    }
  });
  notices(evidence.notices, 'quality notices');
  return value as QualityGateEvidence;
}

export function serializeQualityGateEvidence(value: unknown): string {
  return serializeCanonicalJson(validateQualityGateEvidence(value));
}

export function collectProvenanceEvidence(input: ProvenanceEvidenceInput): ProvenanceEvidence {
  return validateProvenanceEvidence({
    schemaVersion: 1,
    source: frozenSource,
    tooling: { commit: input.toolingCommit, tree: input.toolingTree },
    cleanWorktree: true,
    command: { program: 'pnpm', script: 'release-candidate:integrated' },
    inputs: {
      source: 'frozen-source-commit',
      output: 'new-absolute-directory',
      advisorySnapshot: 'approved-local-file',
    },
    packageOrder: candidateDirectories.map((directory) => `@wayglass/${directory}`),
    advisoryInputSha256: input.advisoryInputSha256,
    notices: input.notices ?? [],
  });
}

export function validateProvenanceEvidence(value: unknown): ProvenanceEvidence {
  const evidence = exactObservationObject(
    value,
    [
      'schemaVersion',
      'source',
      'tooling',
      'cleanWorktree',
      'command',
      'inputs',
      'packageOrder',
      'advisoryInputSha256',
      'notices',
    ],
    'provenance evidence',
  );
  if (evidence.schemaVersion !== 1 || evidence.cleanWorktree !== true) {
    auditFailure('Provenance must record schema version 1 and a clean worktree.');
  }
  if (compactCanonicalJson(evidence.source) !== compactCanonicalJson(frozenSource)) {
    auditFailure('Provenance source differs from the frozen source identity.');
  }
  const tooling = exactObservationObject(
    evidence.tooling,
    ['commit', 'tree'],
    'provenance tooling',
  );
  if (
    typeof tooling.commit !== 'string' ||
    !gitPattern.test(tooling.commit) ||
    typeof tooling.tree !== 'string' ||
    !gitPattern.test(tooling.tree)
  ) {
    auditFailure('Provenance tooling identities must be full lowercase Git hashes.');
  }
  const command = exactObservationObject(
    evidence.command,
    ['program', 'script'],
    'provenance command',
  );
  if (command.program !== 'pnpm' || command.script !== 'release-candidate:integrated') {
    auditFailure('Provenance command identity differs from the future integrated runner.');
  }
  const inputs = exactObservationObject(
    evidence.inputs,
    ['source', 'output', 'advisorySnapshot'],
    'provenance inputs',
  );
  if (
    inputs.source !== 'frozen-source-commit' ||
    inputs.output !== 'new-absolute-directory' ||
    inputs.advisorySnapshot !== 'approved-local-file'
  ) {
    auditFailure('Provenance inputs must use normalized symbolic identities.');
  }
  const expectedOrder = candidateDirectories.map((directory) => `@wayglass/${directory}`);
  if (JSON.stringify(evidence.packageOrder) !== JSON.stringify(expectedOrder)) {
    auditFailure('Provenance package order differs from the accepted release units.');
  }
  if (
    typeof evidence.advisoryInputSha256 !== 'string' ||
    !digestPattern.test(evidence.advisoryInputSha256)
  ) {
    auditFailure('Provenance advisory input hash is invalid.');
  }
  notices(evidence.notices, 'provenance notices');
  return value as ProvenanceEvidence;
}

export function serializeProvenanceEvidence(value: unknown): string {
  return serializeCanonicalJson(validateProvenanceEvidence(value));
}
