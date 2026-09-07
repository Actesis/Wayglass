import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { arch, platform, release, tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';

import { buildCandidate, buildCandidateWithAudit, packageManagerInvocation } from './assembler.ts';
import {
  observeConsumerBrowserVersions,
  runBrowserConsumerMatrix,
  type BrowserConsumerMatrixResult,
} from './browser-probe.ts';
import { candidateToolVersions, frozenSource, qualityGateIds } from './constants.ts';
import { validateConsumerStore } from './consumer-harness.ts';
import { serializeDependencyAudit, validateDependencyAudit } from './dependency-audit.ts';
import { offlineEnvironment } from './environment.ts';
import { readEvidence, verifyEvidenceFiles } from './evidence.ts';
import { fail, ReleaseCandidateError } from './error.ts';
import {
  deterministicRunSha256,
  integratedBundleInventorySha256,
  serializeIntegratedEvidence,
  validateIntegratedEvidence,
} from './integrated-evidence.ts';
import { preflightConsumerMaterial } from './material-preflight.ts';
import {
  collectEnvironmentAudit,
  collectProvenanceEvidence,
  collectQualityGateEvidence,
  serializeEnvironmentAudit,
  serializeProvenanceEvidence,
  serializeQualityGateEvidence,
  validateEnvironmentAudit,
  validateProvenanceEvidence,
  validateQualityGateEvidence,
  type EnvironmentAuditEvidence,
  type QualityGateEvidence,
} from './observation-audit.ts';
import type { EvidenceNotice } from './observation.ts';
import { serializePackageAudit, validatePackageAudit } from './package-audit.ts';
import { validateNewOutputPath } from './path-safety.ts';
import { commandText } from './process.ts';
import {
  assertCleanTooling,
  authenticateFrozenSource,
  identifyRepository,
  type RepositoryIdentity,
} from './repository.ts';
import { serializeAdvisorySnapshot, validateAdvisorySnapshot } from './advisory-snapshot.ts';
import { sha256 } from './hash.ts';
import type {
  CandidateEvidence,
  CommandRunner,
  IntegratedCandidateEvidence,
  IntegratedCandidateRun,
  IntegratedEvidenceSection,
  RetainedEvidenceFile,
} from './types.ts';

export interface IntegratedRepositoryContext extends RepositoryIdentity {
  readonly storePath: string;
}

export interface RetainedCandidateResult {
  readonly evidencePath: string;
  readonly evidenceSha256: string;
  readonly bundleInventorySha256: string;
}

export interface RetainedOrchestratorOperations {
  readonly prepare: (
    cwd: string,
    source: string,
    runner: CommandRunner,
    environment: Readonly<Record<string, string>>,
  ) => Promise<IntegratedRepositoryContext>;
  readonly quality: (
    repository: IntegratedRepositoryContext,
    runner: CommandRunner,
    environment: Readonly<Record<string, string>>,
    now: () => Date,
  ) => Promise<QualityGateEvidence>;
  readonly buildFirst: typeof buildCandidateWithAudit;
  readonly buildSecond: typeof buildCandidate;
  readonly consumers: (
    request: Parameters<typeof runBrowserConsumerMatrix>[0],
  ) => Promise<BrowserConsumerMatrixResult>;
  readonly environment: (
    repository: IntegratedRepositoryContext,
    runner: CommandRunner,
    environment: Readonly<Record<string, string>>,
    now: () => Date,
  ) => Promise<EnvironmentAuditEvidence>;
  readonly now: () => Date;
}

const integratedRecordName = 'integrated-evidence.json';

function orchestratorFailure(code: string, message: string): never {
  return fail(code, message);
}

function canonicalInstant(date: Date): string {
  if (!Number.isFinite(date.getTime()))
    orchestratorFailure('WG_RC_CLOCK', 'Clock returned invalid time.');
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function sortedNotices(notices: readonly EvidenceNotice[]): readonly EvidenceNotice[] {
  return Object.freeze(
    [...notices].sort((left, right) =>
      `${left.kind}:${left.code}:${left.claim}`.localeCompare(
        `${right.kind}:${right.code}:${right.claim}`,
      ),
    ),
  );
}

function normalizedQualityNotices(stdout: string, stderr: string): readonly EvidenceNotice[] {
  const output = `${stdout}\n${stderr}`;
  const notices: EvidenceNotice[] = [];
  if (output.includes('Lit is in dev mode')) {
    notices.push({
      kind: 'warning',
      code: 'WG_RC_LIT_DEVELOPMENT_WARNING',
      claim: 'quality-gates',
      summary: 'Package tests emitted the accepted Lit development-mode warning.',
    });
  }
  if (output.includes('[DEP0205]')) {
    notices.push({
      kind: 'warning',
      code: 'WG_RC_NODE_DEPRECATION_WARNING',
      claim: 'quality-gates',
      summary: 'The Storybook build emitted the observed Node deprecation warning.',
    });
  }
  if (output.includes('Some chunks are larger than 500 kB')) {
    notices.push({
      kind: 'warning',
      code: 'WG_RC_STORYBOOK_CHUNK_WARNING',
      claim: 'quality-gates',
      summary: 'The Storybook build emitted the accepted informational chunk-size warning.',
    });
  }
  if (/\b(?:warning|deprecationwarning)\b/i.test(output)) {
    notices.push({
      kind: 'warning',
      code: 'WG_RC_QUALITY_WARNING_PRESENT',
      claim: 'quality-gates',
      summary: 'One or more successful commands emitted warning output requiring owner review.',
    });
  }
  return sortedNotices(notices);
}

function mergeNotices(
  ...groups: readonly (readonly EvidenceNotice[])[]
): readonly EvidenceNotice[] {
  const byIdentity = new Map<string, EvidenceNotice>();
  for (const notice of groups.flat()) {
    byIdentity.set(`${notice.kind}:${notice.code}:${notice.claim}`, notice);
  }
  return sortedNotices([...byIdentity.values()]);
}

export async function prepareIntegratedRepository(
  cwd: string,
  source: string,
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
): Promise<IntegratedRepositoryContext> {
  const repository = await identifyRepository(cwd, runner);
  await assertCleanTooling(repository, runner);
  await authenticateFrozenSource(repository.root, source, runner);
  const storePath = validateConsumerStore(resolve(repository.root, '.pnpm-store'));
  await preflightConsumerMaterial(storePath, runner, environment);
  return Object.freeze({ ...repository, storePath });
}

export async function runIntegratedQualityGate(
  repository: IntegratedRepositoryContext,
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
  now: () => Date,
): Promise<QualityGateEvidence> {
  const startedAt = canonicalInstant(now());
  const result = await runner({
    ...packageManagerInvocation(environment, ['check']),
    cwd: repository.root,
    environment: { ...environment, TURBO_FORCE: 'true' },
  });
  const completedAt = canonicalInstant(now());
  await assertCleanTooling(repository, runner);
  return collectQualityGateEvidence(
    qualityGateIds.map((id) => ({ id, passed: true as const })),
    { startedAt, completedAt },
    normalizedQualityNotices(result.stdout, result.stderr),
  );
}

export async function observeIntegratedEnvironment(
  repository: IntegratedRepositoryContext,
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
  now: () => Date,
): Promise<EnvironmentAuditEvidence> {
  const pnpm = await commandText(runner, {
    ...packageManagerInvocation(environment, ['--version']),
    cwd: repository.root,
    environment,
  });
  const npm = await commandText(runner, {
    command: 'npm',
    arguments: ['--version'],
    cwd: repository.root,
    environment,
  });
  const playwrightOutput = await commandText(runner, {
    ...packageManagerInvocation(environment, ['exec', 'playwright', '--version']),
    cwd: repository.root,
    environment,
  });
  const playwright = /^Version (\S+)$/.exec(playwrightOutput)?.[1];
  if (playwright !== candidateToolVersions.playwright) {
    orchestratorFailure(
      'WG_RC_PLAYWRIGHT_VERSION',
      'Observed Playwright version differs from the accepted version.',
    );
  }
  const browsers = await observeConsumerBrowserVersions();
  const notices: EvidenceNotice[] = [
    {
      kind: 'limitation',
      code: 'WG_RC_AUTOMATED_BROWSER_ONLY',
      claim: 'browser-support',
      summary: 'Browser evidence is automated and does not add a human assistive-technology claim.',
    },
  ];
  if (platform() !== 'win32') {
    notices.push({
      kind: 'limitation',
      code: 'WG_RC_WINDOWS_UNOBSERVED',
      claim: 'environment-support',
      summary: 'The deferred Windows environment remains unobserved by this candidate run.',
    });
  }
  return collectEnvironmentAudit({
    platform: platform(),
    operatingSystemVersion: release(),
    architecture: arch(),
    node: process.version,
    pnpm,
    npm,
    playwright,
    browsers,
    observedAt: canonicalInstant(now()),
    notices: sortedNotices(notices),
  });
}

const defaultOperations: RetainedOrchestratorOperations = Object.freeze({
  prepare: prepareIntegratedRepository,
  quality: runIntegratedQualityGate,
  buildFirst: buildCandidateWithAudit,
  buildSecond: buildCandidate,
  consumers: runBrowserConsumerMatrix,
  environment: observeIntegratedEnvironment,
  now: () => new Date(),
});

function exactMatrix(matrix: BrowserConsumerMatrixResult, label: string): void {
  if (matrix.vanilla.length !== 2 || matrix.react.length !== 4 || matrix.browsers.length !== 36) {
    orchestratorFailure(
      'WG_RC_INTEGRATED_MATRIX',
      `${label} did not complete the exact 2/4/36 matrix.`,
    );
  }
}

function runEvidence(
  id: IntegratedCandidateRun['id'],
  candidate: CandidateEvidence,
  matrix: BrowserConsumerMatrixResult,
): IntegratedCandidateRun {
  return Object.freeze({ id, candidate, ...matrix });
}

function sectionEvidence(path: string, contents: string): IntegratedEvidenceSection {
  return Object.freeze({
    schemaVersion: 1,
    path,
    bytes: Buffer.byteLength(contents),
    sha256: sha256(contents),
  });
}

function retainedFiles(
  first: CandidateEvidence,
  sections: IntegratedCandidateEvidence['sections'],
): readonly RetainedEvidenceFile[] {
  return Object.freeze(
    [
      ...first.packages.map((package_) => ({
        path: `packages/${package_.file}`,
        bytes: package_.bytes,
        sha256: package_.sha256,
      })),
      ...Object.values(sections).map(({ path, bytes, sha256: checksum }) => ({
        path,
        bytes,
        sha256: checksum,
      })),
    ].sort((left, right) => left.path.localeCompare(right.path)),
  );
}

function writeBundle(
  staging: string,
  firstEvidencePath: string,
  evidence: IntegratedCandidateEvidence,
  sectionContents: Readonly<Record<string, string>>,
): void {
  mkdirSync(resolve(staging, 'packages'));
  mkdirSync(resolve(staging, 'audits'));
  mkdirSync(resolve(staging, 'observations'));
  for (const package_ of evidence.runs[0].candidate.packages) {
    cpSync(
      resolve(dirname(firstEvidencePath), 'packages', package_.file),
      resolve(staging, 'packages', package_.file),
      { errorOnExist: true },
    );
  }
  for (const [path, contents] of Object.entries(sectionContents)) {
    writeFileSync(resolve(staging, path), contents, { encoding: 'utf8', flag: 'wx' });
  }
  writeFileSync(resolve(staging, integratedRecordName), serializeIntegratedEvidence(evidence), {
    encoding: 'utf8',
    flag: 'wx',
  });
}

function readCanonicalJson(
  path: string,
  code: string,
): { readonly value: unknown; readonly text: string } {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
    return { value: JSON.parse(text) as unknown, text };
  } catch {
    return orchestratorFailure(code, `${basename(path)} must be valid UTF-8 JSON.`);
  }
}

function portable(path: string): string {
  return path.split(sep).join('/');
}

function collectBundleFiles(root: string, path = root): readonly string[] {
  const files: string[] = [];
  for (const name of readdirSync(path).sort()) {
    const absolute = resolve(path, name);
    const status = lstatSync(absolute);
    if (status.isSymbolicLink())
      orchestratorFailure('WG_RC_INTEGRATED_BUNDLE', 'Bundle cannot contain symlinks.');
    if (status.isDirectory()) files.push(...collectBundleFiles(root, absolute));
    else if (status.isFile()) files.push(portable(relative(root, absolute)));
    else orchestratorFailure('WG_RC_INTEGRATED_BUNDLE', 'Bundle contains a non-regular file.');
  }
  return files;
}

export function verifyIntegratedBundle(path: string): RetainedCandidateResult {
  if (
    !isAbsolute(path) ||
    !existsSync(path) ||
    !lstatSync(path).isDirectory() ||
    lstatSync(path).isSymbolicLink()
  ) {
    orchestratorFailure(
      'WG_RC_INTEGRATED_PATH',
      'Integrated bundle must be an existing absolute directory.',
    );
  }
  const root = realpathSync(path);
  const recordPath = resolve(root, integratedRecordName);
  const recordFile = readCanonicalJson(recordPath, 'WG_RC_INTEGRATED_JSON');
  const evidence = validateIntegratedEvidence(recordFile.value);
  if (recordFile.text !== serializeIntegratedEvidence(evidence)) {
    orchestratorFailure('WG_RC_INTEGRATED_CANONICAL', 'Integrated evidence is not canonical JSON.');
  }

  const expectedPaths = [
    integratedRecordName,
    ...evidence.bundle.files.map(({ path: file }) => file),
  ].sort();
  if (JSON.stringify(collectBundleFiles(root)) !== JSON.stringify(expectedPaths)) {
    orchestratorFailure(
      'WG_RC_INTEGRATED_BUNDLE',
      'Bundle files differ from the exact retained inventory.',
    );
  }
  for (const file of evidence.bundle.files) {
    const bytes = readFileSync(resolve(root, file.path));
    if (bytes.byteLength !== file.bytes || sha256(bytes) !== file.sha256) {
      orchestratorFailure(
        'WG_RC_INTEGRATED_BUNDLE',
        `${file.path} differs from its retained identity.`,
      );
    }
  }

  const packageFile = readCanonicalJson(
    resolve(root, evidence.sections.packageAudit.path),
    'WG_RC_PACKAGE_AUDIT',
  );
  const packageAudit = validatePackageAudit(packageFile.value);
  if (packageFile.text !== serializePackageAudit(packageAudit)) {
    orchestratorFailure('WG_RC_INTEGRATED_CANONICAL', 'Package audit is not canonical JSON.');
  }
  const dependencyFile = readCanonicalJson(
    resolve(root, evidence.sections.dependencyAudit.path),
    'WG_RC_DEPENDENCY_AUDIT',
  );
  const dependencyAudit = validateDependencyAudit(dependencyFile.value);
  if (dependencyFile.text !== serializeDependencyAudit(dependencyAudit)) {
    orchestratorFailure('WG_RC_INTEGRATED_CANONICAL', 'Dependency audit is not canonical JSON.');
  }
  for (const [index, package_] of packageAudit.packages.entries()) {
    const candidate = evidence.runs[0].candidate.packages[index]!;
    const inspectedLicense = candidate.files.find(({ path: file }) => file === 'LICENSE');
    const inspectedNotice = candidate.files.find(({ path: file }) => file === 'NOTICE');
    if (
      package_.name !== candidate.name ||
      package_.version !== candidate.version ||
      package_.manifestSha256 !== candidate.manifestSha256 ||
      package_.inventorySha256 !== candidate.inventorySha256 ||
      package_.unpackedBytes !== candidate.unpackedBytes ||
      package_.fileCount !== candidate.files.length ||
      package_.licenseSha256 !== inspectedLicense?.sha256 ||
      package_.noticeSha256 !== inspectedNotice?.sha256
    ) {
      orchestratorFailure(
        'WG_RC_INTEGRATED_CROSS_BINDING',
        `${package_.name} audit differs from the retained candidate inspection.`,
      );
    }
  }
  const environmentFile = readCanonicalJson(
    resolve(root, evidence.sections.environment.path),
    'WG_RC_OBSERVATION_AUDIT',
  );
  const environmentEvidence = validateEnvironmentAudit(environmentFile.value);
  if (environmentFile.text !== serializeEnvironmentAudit(environmentEvidence)) {
    orchestratorFailure(
      'WG_RC_INTEGRATED_CANONICAL',
      'Environment evidence is not canonical JSON.',
    );
  }
  const qualityFile = readCanonicalJson(
    resolve(root, evidence.sections.qualityGates.path),
    'WG_RC_OBSERVATION_AUDIT',
  );
  const qualityEvidence = validateQualityGateEvidence(qualityFile.value);
  if (qualityFile.text !== serializeQualityGateEvidence(qualityEvidence)) {
    orchestratorFailure(
      'WG_RC_INTEGRATED_CANONICAL',
      'Quality-gate evidence is not canonical JSON.',
    );
  }
  const provenanceFile = readCanonicalJson(
    resolve(root, evidence.sections.provenance.path),
    'WG_RC_OBSERVATION_AUDIT',
  );
  const provenance = validateProvenanceEvidence(provenanceFile.value);
  if (provenanceFile.text !== serializeProvenanceEvidence(provenance)) {
    orchestratorFailure('WG_RC_INTEGRATED_CANONICAL', 'Provenance evidence is not canonical JSON.');
  }
  const advisoryFile = readCanonicalJson(
    resolve(root, evidence.sections.advisories.path),
    'WG_RC_ADVISORY_SCHEMA',
  );
  const advisory = validateAdvisorySnapshot(advisoryFile.value, {
    referenceTime: environmentEvidence.observedAt,
    dependencyAuditSha256: evidence.sections.dependencyAudit.sha256,
    productionDependencies: dependencyAudit.productionGraph.map(({ name, version }) => ({
      name,
      version,
    })),
  });
  if (
    advisoryFile.text !==
    serializeAdvisorySnapshot(advisory, {
      referenceTime: environmentEvidence.observedAt,
      dependencyAuditSha256: evidence.sections.dependencyAudit.sha256,
      productionDependencies: dependencyAudit.productionGraph.map(({ name, version }) => ({
        name,
        version,
      })),
    })
  ) {
    orchestratorFailure('WG_RC_INTEGRATED_CANONICAL', 'Advisory evidence is not canonical JSON.');
  }

  if (
    provenance.advisoryInputSha256 !== evidence.sections.advisories.sha256 ||
    provenance.tooling.commit !== evidence.tooling.commit ||
    provenance.tooling.tree !== evidence.tooling.tree
  ) {
    orchestratorFailure(
      'WG_RC_INTEGRATED_CROSS_BINDING',
      'Provenance differs from the integrated record.',
    );
  }
  const observedRunner = environmentEvidence.runner;
  for (const run of evidence.runs) {
    const candidate = run.candidate.environment;
    if (
      candidate.platform !== observedRunner.platform ||
      candidate.architecture !== observedRunner.architecture ||
      candidate.node !== observedRunner.node ||
      candidate.pnpm !== observedRunner.pnpm ||
      candidate.npm !== observedRunner.npm
    ) {
      orchestratorFailure(
        'WG_RC_INTEGRATED_CROSS_BINDING',
        'Run environment differs from the environment section.',
      );
    }
  }
  return Object.freeze({
    evidencePath: recordPath,
    evidenceSha256: sha256(recordFile.text),
    bundleInventorySha256: evidence.bundle.inventorySha256,
  });
}

export async function runRetainedCandidate(
  cwd: string,
  source: string,
  outputArgument: string,
  advisorySnapshotPath: string,
  runner: CommandRunner,
  inputEnvironment: NodeJS.ProcessEnv,
  operations: RetainedOrchestratorOperations = defaultOperations,
): Promise<RetainedCandidateResult> {
  if (source !== frozenSource.commit) {
    orchestratorFailure(
      'WG_RC_SOURCE_COMMIT',
      `Integrated run requires frozen source ${frozenSource.commit}.`,
    );
  }
  if (
    !isAbsolute(advisorySnapshotPath) ||
    !existsSync(advisorySnapshotPath) ||
    !lstatSync(advisorySnapshotPath).isFile() ||
    lstatSync(advisorySnapshotPath).isSymbolicLink()
  ) {
    orchestratorFailure(
      'WG_RC_ADVISORY_PATH',
      'Advisory snapshot must be an existing absolute regular file.',
    );
  }
  const advisoryInput = readCanonicalJson(advisorySnapshotPath, 'WG_RC_ADVISORY_SCHEMA');
  const environment = offlineEnvironment(inputEnvironment);
  let commandNotices: readonly EvidenceNotice[] = [];
  const observedRunner: CommandRunner = async (request) => {
    const result = await runner(request);
    commandNotices = mergeNotices(
      commandNotices,
      normalizedQualityNotices(result.stdout, result.stderr),
    );
    return result;
  };
  const repository = await operations.prepare(cwd, source, observedRunner, environment);
  const output = validateNewOutputPath(outputArgument, repository.root);
  const work = mkdtempSync(resolve(tmpdir(), 'wayglass-rc-integrated-'));
  let staging: string | undefined;
  let outputCreated = false;
  let completed = false;
  try {
    const initialQuality = await operations.quality(
      repository,
      observedRunner,
      environment,
      operations.now,
    );
    const firstBuild = await operations.buildFirst(
      repository.root,
      source,
      resolve(work, 'run-1'),
      observedRunner,
      environment,
    );
    const firstCandidate = readEvidence(firstBuild.evidencePath);
    verifyEvidenceFiles(firstBuild.evidencePath, firstCandidate);
    const firstMatrix = await operations.consumers({
      evidencePath: firstBuild.evidencePath,
      storePath: repository.storePath,
      runner: observedRunner,
      environment,
    });
    exactMatrix(firstMatrix, 'run-1');

    const secondEvidencePath = await operations.buildSecond(
      repository.root,
      source,
      resolve(work, 'run-2'),
      observedRunner,
      environment,
    );
    const secondCandidate = readEvidence(secondEvidencePath);
    verifyEvidenceFiles(secondEvidencePath, secondCandidate);
    const secondMatrix = await operations.consumers({
      evidencePath: secondEvidencePath,
      storePath: repository.storePath,
      runner: observedRunner,
      environment,
    });
    exactMatrix(secondMatrix, 'run-2');

    const environmentEvidence = await operations.environment(
      repository,
      observedRunner,
      environment,
      operations.now,
    );
    const packageContents = serializePackageAudit(firstBuild.packageAudit);
    const dependencyContents = serializeDependencyAudit(firstBuild.dependencyAudit);
    const advisory = validateAdvisorySnapshot(advisoryInput.value, {
      referenceTime: environmentEvidence.observedAt,
      dependencyAuditSha256: sha256(dependencyContents),
      productionDependencies: firstBuild.dependencyAudit.productionGraph.map(
        ({ name, version }) => ({ name, version }),
      ),
    });
    const advisoryContents = serializeAdvisorySnapshot(advisory, {
      referenceTime: environmentEvidence.observedAt,
      dependencyAuditSha256: sha256(dependencyContents),
      productionDependencies: firstBuild.dependencyAudit.productionGraph.map(
        ({ name, version }) => ({ name, version }),
      ),
    });
    if (advisoryInput.text !== advisoryContents) {
      orchestratorFailure(
        'WG_RC_ADVISORY_CANONICAL',
        'Approved advisory input must use canonical JSON.',
      );
    }
    const environmentContents = serializeEnvironmentAudit(environmentEvidence);
    const quality = collectQualityGateEvidence(
      initialQuality.results,
      { startedAt: initialQuality.startedAt, completedAt: initialQuality.completedAt },
      mergeNotices(initialQuality.notices, commandNotices),
    );
    const qualityContents = serializeQualityGateEvidence(quality);
    const provenance = collectProvenanceEvidence({
      toolingCommit: repository.commit,
      toolingTree: repository.tree,
      advisoryInputSha256: sha256(advisoryContents),
    });
    const provenanceContents = serializeProvenanceEvidence(provenance);
    const sectionContents = {
      'audits/packages.json': packageContents,
      'audits/dependencies.json': dependencyContents,
      'observations/environment.json': environmentContents,
      'observations/quality-gates.json': qualityContents,
      'observations/provenance.json': provenanceContents,
      'observations/advisories.json': advisoryContents,
    } as const;
    const sections = Object.freeze({
      packageAudit: sectionEvidence('audits/packages.json', packageContents),
      dependencyAudit: sectionEvidence('audits/dependencies.json', dependencyContents),
      environment: sectionEvidence('observations/environment.json', environmentContents),
      qualityGates: sectionEvidence('observations/quality-gates.json', qualityContents),
      provenance: sectionEvidence('observations/provenance.json', provenanceContents),
      advisories: sectionEvidence('observations/advisories.json', advisoryContents),
    });
    const firstRun = runEvidence('run-1', firstCandidate, firstMatrix);
    const secondRun = runEvidence('run-2', secondCandidate, secondMatrix);
    const files = retainedFiles(firstCandidate, sections);
    const evidence = validateIntegratedEvidence({
      schemaVersion: 2,
      source: frozenSource,
      tooling: { commit: repository.commit, tree: repository.tree },
      reproducibility: {
        runs: 2,
        byteIdentical: true,
        deterministicSha256: deterministicRunSha256(firstRun),
      },
      runs: [firstRun, secondRun],
      sections,
      bundle: {
        files,
        totalBytes: files.reduce((total, file) => total + file.bytes, 0),
        inventorySha256: integratedBundleInventorySha256(files),
      },
      history: [
        {
          sequence: 1,
          outcome: 'passed',
          code: 'WG_RC_INTEGRATED_PASS',
          summary: 'Both authoritative runs and the complete retained matrix passed.',
        },
      ],
    });
    staging = mkdtempSync(resolve(dirname(output), `.${basename(output)}.partial-`));
    writeBundle(staging, firstBuild.evidencePath, evidence, sectionContents);
    renameSync(staging, output);
    staging = undefined;
    outputCreated = true;
    const result = verifyIntegratedBundle(output);
    completed = true;
    return result;
  } catch (error) {
    if (error instanceof ReleaseCandidateError) throw error;
    throw new ReleaseCandidateError('WG_RC_INTEGRATED_RUN', 'Integrated candidate run failed.');
  } finally {
    rmSync(work, { recursive: true, force: true });
    if (staging !== undefined) rmSync(staging, { recursive: true, force: true });
    if (outputCreated && !completed) rmSync(output, { recursive: true, force: true });
  }
}
