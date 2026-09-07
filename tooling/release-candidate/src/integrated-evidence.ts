import { compactCanonicalJson, serializeCanonicalJson } from './canonical-json.ts';
import { candidateDirectories, frozenSource } from './constants.ts';
import { consumerScenarios } from './consumer.ts';
import { fail } from './error.ts';
import { hashFileInventory, sha256 } from './hash.ts';
import type {
  CandidateAttemptEvidence,
  CandidateEvidence,
  ConsumerBrowserProbeResult,
  IntegratedCandidateEvidence,
  IntegratedCandidateRun,
  RetainedEvidenceFile,
} from './types.ts';

type UnknownRecord = Readonly<Record<string, unknown>>;

const digestPattern = /^[a-f0-9]{64}$/;
const gitPattern = /^[a-f0-9]{40}$/;
const attemptCodePattern = /^WG_RC_[A-Z0-9_]+$/;
const browserEngines = ['chromium', 'firefox', 'webkit'] as const;
const buildStages = ['primary', 'removal'] as const;
const sectionPaths = Object.freeze({
  packageAudit: 'audits/packages.json',
  dependencyAudit: 'audits/dependencies.json',
  environment: 'observations/environment.json',
  qualityGates: 'observations/quality-gates.json',
  provenance: 'observations/provenance.json',
  advisories: 'observations/advisories.json',
} as const);

function schema(message: string): never {
  return fail('WG_RC_INTEGRATED_SCHEMA', message);
}

function exactObject(value: unknown, keys: readonly string[], label: string): UnknownRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return schema(`${label} must be an object.`);
  }
  const record = value as UnknownRecord;
  const actual = Object.keys(record).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    return schema(`${label} has missing or unknown fields.`);
  }
  return record;
}

function array(value: unknown, label: string): readonly unknown[] {
  if (!Array.isArray(value)) return schema(`${label} must be an array.`);
  return value;
}

function nonemptyString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) return schema(`${label} must be a string.`);
  return value;
}

function safeInteger(value: unknown, label: string, minimum = 0): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum) {
    return schema(`${label} must be a safe integer of at least ${String(minimum)}.`);
  }
  return value as number;
}

function digest(value: unknown, label: string): string {
  const result = nonemptyString(value, label);
  if (!digestPattern.test(result)) return schema(`${label} must be a lowercase SHA-256.`);
  return result;
}

function gitIdentity(value: unknown, label: string): string {
  const result = nonemptyString(value, label);
  if (!gitPattern.test(result)) return schema(`${label} must be a full lowercase Git identity.`);
  return result;
}

function safeRelativePath(value: unknown, label: string): string {
  const path = nonemptyString(value, label);
  const segments = path.split('/');
  if (
    path.includes('\\') ||
    path.startsWith('/') ||
    !/^[A-Za-z0-9._@/-]+$/.test(path) ||
    segments.some((segment) => segment === '' || segment === '.' || segment === '..') ||
    hasControlCharacter(path)
  ) {
    return schema(`${label} must be a normalized relative path.`);
  }
  return path;
}

function hasControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const code = character.codePointAt(0)!;
    return code <= 31 || code === 127;
  });
}

function validateInspectedFiles(value: unknown, label: string): void {
  const files = array(value, label);
  const paths: string[] = [];
  for (const [index, candidate] of files.entries()) {
    const file = exactObject(candidate, ['path', 'bytes', 'sha256'], `${label}[${String(index)}]`);
    paths.push(safeRelativePath(file.path, `${label}[${String(index)}].path`));
    safeInteger(file.bytes, `${label}[${String(index)}].bytes`);
    digest(file.sha256, `${label}[${String(index)}].sha256`);
  }
  if (JSON.stringify(paths) !== JSON.stringify([...new Set(paths)].sort())) {
    schema(`${label} paths must be unique and sorted.`);
  }
}

function validateCandidateEvidence(value: unknown, label: string): CandidateEvidence {
  const candidate = exactObject(
    value,
    ['schemaVersion', 'source', 'tooling', 'environment', 'reproducibility', 'packages'],
    label,
  );
  if (candidate.schemaVersion !== 1) schema(`${label} must embed assembly schema version 1.`);

  const source = exactObject(
    candidate.source,
    ['commit', 'tree', 'lockfileSha256'],
    `${label}.source`,
  );
  if (
    source.commit !== frozenSource.commit ||
    source.tree !== frozenSource.tree ||
    source.lockfileSha256 !== frozenSource.lockfileSha256
  ) {
    schema(`${label} does not identify the frozen candidate source.`);
  }

  const tooling = exactObject(candidate.tooling, ['commit', 'tree'], `${label}.tooling`);
  gitIdentity(tooling.commit, `${label}.tooling.commit`);
  gitIdentity(tooling.tree, `${label}.tooling.tree`);

  const environment = exactObject(
    candidate.environment,
    ['platform', 'architecture', 'node', 'pnpm', 'npm'],
    `${label}.environment`,
  );
  for (const key of ['platform', 'architecture', 'node', 'pnpm', 'npm']) {
    nonemptyString(environment[key], `${label}.environment.${key}`);
  }

  const reproducibility = exactObject(
    candidate.reproducibility,
    ['runs', 'byteIdentical'],
    `${label}.reproducibility`,
  );
  if (reproducibility.runs !== 2 || reproducibility.byteIdentical !== true) {
    schema(`${label} does not carry the two-pass assembly result.`);
  }

  const packages = array(candidate.packages, `${label}.packages`);
  if (packages.length !== candidateDirectories.length) {
    schema(`${label} must contain the six candidate packages.`);
  }
  for (const [index, value_] of packages.entries()) {
    const directory = candidateDirectories[index]!;
    const package_ = exactObject(
      value_,
      [
        'directory',
        'name',
        'version',
        'file',
        'bytes',
        'sha256',
        'manifestSha256',
        'inventorySha256',
        'unpackedBytes',
        'files',
      ],
      `${label}.packages[${String(index)}]`,
    );
    if (
      package_.directory !== directory ||
      package_.name !== `@wayglass/${directory}` ||
      package_.version !== '0.1.0' ||
      package_.file !== `wayglass-${directory}-0.1.0.tgz`
    ) {
      schema(`${label} package ${String(index)} has an unexpected identity or order.`);
    }
    safeInteger(package_.bytes, `${label}.packages[${String(index)}].bytes`, 1);
    safeInteger(package_.unpackedBytes, `${label}.packages[${String(index)}].unpackedBytes`, 1);
    digest(package_.sha256, `${label}.packages[${String(index)}].sha256`);
    digest(package_.manifestSha256, `${label}.packages[${String(index)}].manifestSha256`);
    const inventory = digest(
      package_.inventorySha256,
      `${label}.packages[${String(index)}].inventorySha256`,
    );
    validateInspectedFiles(package_.files, `${label}.packages[${String(index)}].files`);
    if (
      hashFileInventory(package_.files as CandidateEvidence['packages'][number]['files']) !==
      inventory
    ) {
      schema(`${label} package ${String(index)} inventory hash does not match its files.`);
    }
  }
  return value as CandidateEvidence;
}

function validateVanilla(value: unknown, scenarioId: string, label: string): void {
  const result = exactObject(
    value,
    [
      'scenarioId',
      'declarations',
      'productionBuild',
      'css',
      'runtimeFixture',
      'unusedRuntimeCodeAbsent',
      'removalRebuild',
    ],
    label,
  );
  if (result.scenarioId !== scenarioId) schema(`${label} has the wrong scenario identity.`);
  for (const key of [
    'declarations',
    'productionBuild',
    'css',
    'runtimeFixture',
    'unusedRuntimeCodeAbsent',
    'removalRebuild',
  ]) {
    if (result[key] !== true) schema(`${label}.${key} must be true.`);
  }
}

function validateReact(value: unknown, scenarioId: string, label: string): void {
  const result = exactObject(
    value,
    [
      'scenarioId',
      'declarations',
      'productionBuild',
      'css',
      'clientFallbackFixture',
      'parityAndEventsFixture',
      'guardedRegistrationFixture',
      'unusedWrappersAbsent',
      'bindingRemovalRebuild',
    ],
    label,
  );
  if (result.scenarioId !== scenarioId) schema(`${label} has the wrong scenario identity.`);
  for (const key of [
    'declarations',
    'productionBuild',
    'css',
    'clientFallbackFixture',
    'parityAndEventsFixture',
    'guardedRegistrationFixture',
    'unusedWrappersAbsent',
    'bindingRemovalRebuild',
  ]) {
    if (result[key] !== true) schema(`${label}.${key} must be true.`);
  }
}

function expectedBrowserCases(): readonly Omit<
  ConsumerBrowserProbeResult,
  'runtime' | 'semantics' | 'accessibility'
>[] {
  return consumerScenarios().flatMap((scenario) =>
    buildStages.flatMap((stage) =>
      browserEngines.map((engine) => ({
        scenarioId: scenario.id,
        kind: scenario.kind,
        stage,
        engine,
      })),
    ),
  );
}

function validateRun(
  value: unknown,
  id: IntegratedCandidateRun['id'],
  label: string,
): IntegratedCandidateRun {
  const run = exactObject(value, ['id', 'candidate', 'vanilla', 'react', 'browsers'], label);
  if (run.id !== id) schema(`${label} must have id ${id}.`);
  validateCandidateEvidence(run.candidate, `${label}.candidate`);

  const scenarios = consumerScenarios();
  const vanillaScenarios = scenarios.filter(({ kind }) => kind === 'vanilla');
  const reactScenarios = scenarios.filter(({ kind }) => kind === 'react');
  const vanilla = array(run.vanilla, `${label}.vanilla`);
  const react = array(run.react, `${label}.react`);
  const browsers = array(run.browsers, `${label}.browsers`);
  if (vanilla.length !== 2 || react.length !== 4 || browsers.length !== 36) {
    fail('WG_RC_INTEGRATED_MATRIX', `${label} does not contain the exact 2/4/36 matrix.`);
  }
  vanilla.forEach((result, index) =>
    validateVanilla(result, vanillaScenarios[index]!.id, `${label}.vanilla[${String(index)}]`),
  );
  react.forEach((result, index) =>
    validateReact(result, reactScenarios[index]!.id, `${label}.react[${String(index)}]`),
  );
  const expected = expectedBrowserCases();
  browsers.forEach((value_, index) => {
    const result = exactObject(
      value_,
      ['scenarioId', 'kind', 'stage', 'engine', 'runtime', 'semantics', 'accessibility'],
      `${label}.browsers[${String(index)}]`,
    );
    const identity = expected[index]!;
    for (const key of ['scenarioId', 'kind', 'stage', 'engine'] as const) {
      if (result[key] !== identity[key]) {
        fail('WG_RC_INTEGRATED_MATRIX', `${label} browser case ${String(index)} is out of order.`);
      }
    }
    for (const key of ['runtime', 'semantics', 'accessibility']) {
      if (result[key] !== true)
        schema(`${label} browser case ${String(index)}.${key} must be true.`);
    }
  });
  return value as IntegratedCandidateRun;
}

function deterministicSurface(run: IntegratedCandidateRun): unknown {
  return {
    packages: run.candidate.packages,
    vanilla: run.vanilla,
    react: run.react,
    browsers: run.browsers,
  };
}

export function deterministicRunSha256(run: IntegratedCandidateRun): string {
  validateRun(run, run.id, 'integrated run');
  return sha256(compactCanonicalJson(deterministicSurface(run)));
}

function validateRetainedFiles(value: unknown): readonly RetainedEvidenceFile[] {
  const files = array(value, 'bundle.files');
  const paths: string[] = [];
  for (const [index, value_] of files.entries()) {
    const file = exactObject(value_, ['path', 'bytes', 'sha256'], `bundle.files[${String(index)}]`);
    paths.push(safeRelativePath(file.path, `bundle.files[${String(index)}].path`));
    safeInteger(file.bytes, `bundle.files[${String(index)}].bytes`, 1);
    digest(file.sha256, `bundle.files[${String(index)}].sha256`);
  }
  if (JSON.stringify(paths) !== JSON.stringify([...new Set(paths)].sort())) {
    fail('WG_RC_INTEGRATED_BUNDLE', 'Retained bundle paths must be unique and sorted.');
  }
  return value as readonly RetainedEvidenceFile[];
}

export function integratedBundleInventorySha256(files: readonly RetainedEvidenceFile[]): string {
  const validated = validateRetainedFiles(files);
  return sha256(
    validated
      .map(({ path, bytes, sha256: checksum }) => `${path}\0${bytes}\0${checksum}\n`)
      .join(''),
  );
}

function validateHistory(value: unknown): readonly CandidateAttemptEvidence[] {
  const history = array(value, 'history');
  if (history.length === 0) fail('WG_RC_INTEGRATED_HISTORY', 'Attempt history cannot be empty.');
  for (const [index, value_] of history.entries()) {
    const attempt = exactObject(
      value_,
      ['sequence', 'outcome', 'code', 'summary'],
      `history[${String(index)}]`,
    );
    if (attempt.sequence !== index + 1) {
      fail('WG_RC_INTEGRATED_HISTORY', 'Attempt history sequence must be contiguous and ordered.');
    }
    if (attempt.outcome !== 'failed' && attempt.outcome !== 'passed') {
      schema(`history[${String(index)}].outcome is invalid.`);
    }
    const code = nonemptyString(attempt.code, `history[${String(index)}].code`);
    if (!attemptCodePattern.test(code)) schema(`history[${String(index)}].code is invalid.`);
    const summary = nonemptyString(attempt.summary, `history[${String(index)}].summary`);
    if (summary.length > 500 || hasControlCharacter(summary)) {
      schema(`history[${String(index)}].summary is not normalized.`);
    }
  }
  if ((history.at(-1) as UnknownRecord).outcome !== 'passed') {
    fail('WG_RC_INTEGRATED_HISTORY', 'Attempt history must end with the successful candidate run.');
  }
  return value as readonly CandidateAttemptEvidence[];
}

function validateSections(
  value: unknown,
  retainedByPath: ReadonlyMap<string, RetainedEvidenceFile>,
): IntegratedCandidateEvidence['sections'] {
  const names = Object.keys(sectionPaths) as (keyof typeof sectionPaths)[];
  const sections = exactObject(value, names, 'sections');
  for (const name of names) {
    const section = exactObject(
      sections[name],
      ['schemaVersion', 'path', 'bytes', 'sha256'],
      `sections.${name}`,
    );
    if (section.schemaVersion !== 1 || section.path !== sectionPaths[name]) {
      schema(`sections.${name} has an unexpected schema or path.`);
    }
    const bytes = safeInteger(section.bytes, `sections.${name}.bytes`, 1);
    const checksum = digest(section.sha256, `sections.${name}.sha256`);
    const retained = retainedByPath.get(sectionPaths[name]);
    if (retained?.bytes !== bytes || retained.sha256 !== checksum) {
      fail('WG_RC_INTEGRATED_BUNDLE', `sections.${name} is absent or mismatched in the bundle.`);
    }
  }
  return value as IntegratedCandidateEvidence['sections'];
}

export function validateIntegratedEvidence(value: unknown): IntegratedCandidateEvidence {
  const evidence = exactObject(
    value,
    [
      'schemaVersion',
      'source',
      'tooling',
      'reproducibility',
      'runs',
      'sections',
      'bundle',
      'history',
    ],
    'integrated evidence',
  );
  if (evidence.schemaVersion !== 2) schema('Integrated evidence schema version must be 2.');

  const source = exactObject(evidence.source, ['commit', 'tree', 'lockfileSha256'], 'source');
  if (
    source.commit !== frozenSource.commit ||
    source.tree !== frozenSource.tree ||
    source.lockfileSha256 !== frozenSource.lockfileSha256
  ) {
    schema('Integrated evidence does not identify the frozen source.');
  }
  const tooling = exactObject(evidence.tooling, ['commit', 'tree'], 'tooling');
  gitIdentity(tooling.commit, 'tooling.commit');
  gitIdentity(tooling.tree, 'tooling.tree');

  const runs = array(evidence.runs, 'runs');
  if (runs.length !== 2)
    fail('WG_RC_INTEGRATED_REPRODUCIBILITY', 'Exactly two complete runs are required.');
  const first = validateRun(runs[0], 'run-1', 'runs[0]');
  const second = validateRun(runs[1], 'run-2', 'runs[1]');
  for (const [index, run] of [first, second].entries()) {
    if (
      compactCanonicalJson(run.candidate.source) !== compactCanonicalJson(source) ||
      compactCanonicalJson(run.candidate.tooling) !== compactCanonicalJson(tooling)
    ) {
      schema(`runs[${String(index)}] source or tooling identity differs from the record.`);
    }
  }

  const firstHash = deterministicRunSha256(first);
  const secondHash = deterministicRunSha256(second);
  if (firstHash !== secondHash) {
    fail('WG_RC_INTEGRATED_REPRODUCIBILITY', 'Authoritative run surfaces are not byte-identical.');
  }
  const reproducibility = exactObject(
    evidence.reproducibility,
    ['runs', 'byteIdentical', 'deterministicSha256'],
    'reproducibility',
  );
  if (
    reproducibility.runs !== 2 ||
    reproducibility.byteIdentical !== true ||
    digest(reproducibility.deterministicSha256, 'reproducibility.deterministicSha256') !== firstHash
  ) {
    fail(
      'WG_RC_INTEGRATED_REPRODUCIBILITY',
      'Recorded deterministic result does not match both runs.',
    );
  }

  const bundle = exactObject(evidence.bundle, ['files', 'totalBytes', 'inventorySha256'], 'bundle');
  const retained = validateRetainedFiles(bundle.files);
  const retainedByPath = new Map(retained.map((file) => [file.path, file]));
  for (const package_ of first.candidate.packages) {
    const retainedPackage = retainedByPath.get(`packages/${package_.file}`);
    if (retainedPackage?.bytes !== package_.bytes || retainedPackage.sha256 !== package_.sha256) {
      fail('WG_RC_INTEGRATED_BUNDLE', `${package_.name} is absent or mismatched in the bundle.`);
    }
  }
  validateSections(evidence.sections, retainedByPath);
  const totalBytes = retained.reduce((total, file) => total + file.bytes, 0);
  if (
    safeInteger(bundle.totalBytes, 'bundle.totalBytes', 1) !== totalBytes ||
    digest(bundle.inventorySha256, 'bundle.inventorySha256') !==
      integratedBundleInventorySha256(retained)
  ) {
    fail('WG_RC_INTEGRATED_BUNDLE', 'Retained bundle inventory totals or hash do not match.');
  }
  validateHistory(evidence.history);
  return value as IntegratedCandidateEvidence;
}

export function serializeIntegratedEvidence(value: unknown): string {
  const evidence = validateIntegratedEvidence(value);
  return serializeCanonicalJson(evidence);
}
