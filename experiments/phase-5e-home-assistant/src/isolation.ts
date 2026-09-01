import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

interface RemovalPlan {
  readonly schemaVersion: number;
  readonly removePaths: readonly string[];
  readonly rootScripts: readonly string[];
  readonly rootCheckEntries: readonly string[];
  readonly retainedReferences: readonly string[];
}

export interface IsolationAuditRecord {
  readonly schemaVersion: 1;
  readonly evidenceIds: readonly ['P5E-E05', 'P5E-E06', 'P5E-E08'];
  readonly subjectRevision: string;
  readonly productionSourceFilesScanned: number;
  readonly builtFilesScanned: number;
  readonly proofExecutableFilesScanned: number;
  readonly lockfileProofReferences: number;
  readonly productionMarkerMatches: readonly string[];
  readonly builtMarkerMatches: readonly string[];
  readonly secretMatches: readonly string[];
  readonly endpointMatches: readonly string[];
  readonly unexpectedRetainedReferences: readonly string[];
  readonly simulatedRootScriptsRemaining: number;
  readonly pass: boolean;
}

const sourceExtensions = new Set(['.cjs', '.css', '.html', '.js', '.mjs', '.ts']);
const referenceExtensions = new Set(['.json', '.md', '.toml', '.ts', '.yaml', '.yml']);
const ignoredDirectories = new Set(['.git', '.turbo', 'dist', 'node_modules', 'storybook-static']);
const runtimeMarkerPattern = /P5E_HA_|DeterministicHomeAssistantPort/;
const proofReferencePattern = /phase-5e-home-assistant|experiment:phase5e/;
const secretPatterns = [
  /-----BEGIN (?:EC |OPENSSH |RSA )?PRIVATE KEY-----/,
  /\bghp_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/,
];

function filesBelow(root: string, skipIgnored = false): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (skipIgnored && entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const path = join(root, entry.name);
    return entry.isDirectory() ? filesBelow(path, skipIgnored) : [path];
  });
}

function matchingFiles(files: readonly string[], pattern: RegExp): string[] {
  return files.flatMap((path) => (pattern.test(readFileSync(path, 'utf8')) ? [path] : []));
}

function parseRemovalPlan(path: string): RemovalPlan {
  return JSON.parse(readFileSync(path, 'utf8')) as RemovalPlan;
}

export function runIsolationAudit(
  repositoryRootInput: string,
  subjectRevision: string,
): IsolationAuditRecord {
  const repositoryRoot = resolve(repositoryRootInput);
  const proofRoot = join(repositoryRoot, 'experiments/phase-5e-home-assistant');
  const productionRoots = ['apps', 'examples', 'packages'].map((path) =>
    join(repositoryRoot, path),
  );
  const productionSourceFiles = productionRoots
    .flatMap((root) => filesBelow(root, true))
    .filter((path) => sourceExtensions.has(extname(path)) && !path.includes('/dist/'));
  const builtFiles = productionRoots
    .flatMap((root) => filesBelow(root))
    .filter(
      (path) =>
        sourceExtensions.has(extname(path)) &&
        (path.includes('/dist/') || path.includes('/storybook-static/')),
    );
  const proofExecutableFiles = filesBelow(proofRoot, true).filter(
    (path) => sourceExtensions.has(extname(path)) || extname(path) === '.json',
  );

  const productionMarkerMatches = matchingFiles(productionSourceFiles, runtimeMarkerPattern).map(
    (path) => relative(repositoryRoot, path),
  );
  const builtMarkerMatches = matchingFiles(builtFiles, runtimeMarkerPattern).map((path) =>
    relative(repositoryRoot, path),
  );
  const secretMatches = proofExecutableFiles.flatMap((path) => {
    const source = readFileSync(path, 'utf8');
    return secretPatterns.some((pattern) => pattern.test(source))
      ? [relative(repositoryRoot, path)]
      : [];
  });
  const endpointMatches = proofExecutableFiles.flatMap((path) =>
    /\b(?:https?|wss?):\/\//.test(readFileSync(path, 'utf8'))
      ? [relative(repositoryRoot, path)]
      : [],
  );

  const lockfile = readFileSync(join(repositoryRoot, 'pnpm-lock.yaml'), 'utf8');
  const lockfileProofReferences = lockfile.match(proofReferencePattern)?.length ?? 0;
  const plan = parseRemovalPlan(join(proofRoot, 'removal-plan.json'));
  if (
    plan.schemaVersion !== 1 ||
    plan.removePaths.length !== 1 ||
    plan.removePaths[0] !== 'experiments/phase-5e-home-assistant'
  ) {
    throw new Error('P5E_HA_REMOVAL_PLAN: removal path is not exact');
  }
  for (const path of plan.removePaths) {
    if (!statSync(join(repositoryRoot, path)).isDirectory()) {
      throw new Error(`P5E_HA_REMOVAL_PATH: ${path} is not a directory`);
    }
  }

  const manifest = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8')) as {
    scripts: Record<string, string>;
  };
  const simulatedScripts = { ...manifest.scripts };
  for (const script of plan.rootScripts) {
    if (simulatedScripts[script] === undefined) {
      throw new Error(`P5E_HA_REMOVAL_SCRIPT: ${script} is missing`);
    }
    delete simulatedScripts[script];
  }
  const checkParts = (simulatedScripts.check ?? '').split(' && ');
  simulatedScripts.check = checkParts
    .filter((part) => !plan.rootCheckEntries.includes(part))
    .join(' && ');
  if (proofReferencePattern.test(JSON.stringify(simulatedScripts))) {
    throw new Error('P5E_HA_REMOVAL_SCRIPT_REFERENCE: simulated scripts retain the proof');
  }

  const retained = new Set(plan.retainedReferences);
  const unexpectedRetainedReferences = filesBelow(repositoryRoot, true)
    .filter((path) => referenceExtensions.has(extname(path)))
    .filter((path) => !path.startsWith(proofRoot))
    .flatMap((path) => {
      const repositoryPath = relative(repositoryRoot, path);
      if (retained.has(repositoryPath) || repositoryPath === 'package.json') return [];
      return proofReferencePattern.test(readFileSync(path, 'utf8')) ? [repositoryPath] : [];
    });

  const pass =
    builtFiles.length > 0 &&
    productionMarkerMatches.length === 0 &&
    builtMarkerMatches.length === 0 &&
    secretMatches.length === 0 &&
    endpointMatches.length === 0 &&
    lockfileProofReferences === 0 &&
    unexpectedRetainedReferences.length === 0;

  return Object.freeze({
    schemaVersion: 1,
    evidenceIds: Object.freeze(['P5E-E05', 'P5E-E06', 'P5E-E08'] as const),
    subjectRevision,
    productionSourceFilesScanned: productionSourceFiles.length,
    builtFilesScanned: builtFiles.length,
    proofExecutableFilesScanned: proofExecutableFiles.length,
    lockfileProofReferences,
    productionMarkerMatches: Object.freeze(productionMarkerMatches),
    builtMarkerMatches: Object.freeze(builtMarkerMatches),
    secretMatches: Object.freeze(secretMatches),
    endpointMatches: Object.freeze(endpointMatches),
    unexpectedRetainedReferences: Object.freeze(unexpectedRetainedReferences),
    simulatedRootScriptsRemaining: Object.keys(simulatedScripts).length,
    pass,
  });
}
