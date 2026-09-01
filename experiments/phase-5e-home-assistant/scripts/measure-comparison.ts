import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { argv } from 'node:process';

function argument(name: string): string {
  const index = argv.indexOf(name);
  const value = index === -1 ? undefined : argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`P5E_HA_COMPARISON_ARGUMENT: ${name} is required`);
  }
  return value;
}

function sourceMetrics(repositoryRoot: string, repositoryPaths: readonly string[]) {
  const sources = repositoryPaths.map((path) =>
    readFileSync(resolve(repositoryRoot, path), 'utf8'),
  );
  return {
    files: repositoryPaths,
    totalLines: sources.reduce((sum, source) => sum + source.split('\n').length, 0),
    nonblankLines: sources.reduce(
      (sum, source) => sum + source.split('\n').filter((line) => line.trim().length > 0).length,
      0,
    ),
  };
}

const repositoryRoot = resolve(import.meta.dirname, '../../..');
const output = resolve(argument('--output'));
const revision = argument('--revision');
const directFiles = [
  'experiments/phase-5e-home-assistant/src/direct-baseline.ts',
  'experiments/phase-5e-home-assistant/test/direct-baseline.test.ts',
] as const;
const candidateFiles = [
  'experiments/phase-5e-home-assistant/src/model.ts',
  'experiments/phase-5e-home-assistant/src/types.ts',
  'experiments/phase-5e-home-assistant/src/validation.ts',
  'experiments/phase-5e-home-assistant/test/model.test.ts',
  'experiments/phase-5e-home-assistant/test/validation.test.ts',
] as const;
const directSource = readFileSync(resolve(repositoryRoot, directFiles[0]), 'utf8');

const record = {
  schemaVersion: 1,
  evidenceId: 'P5E-E09',
  subjectRevision: revision,
  measuredAt: new Date().toISOString(),
  scope: 'same four-entity snapshot, change, removal, and acknowledged-then-confirmed request task',
  directApplicationOwned: {
    ...sourceMetrics(repositoryRoot, directFiles),
    repeatedEntityLiteralSites: (directSource.match(/entity_id ===/g) ?? []).length,
    runtimeEnvelopeValidation: false,
    stableProviderDiagnostics: false,
    acceptsMalformedTimestamp: true,
    removal: 'delete two application-owned files or retain them as local integration code',
  },
  candidateBoundary: {
    ...sourceMetrics(repositoryRoot, candidateFiles),
    applicationBindingRecords: 4,
    runtimeEnvelopeValidation: true,
    stableProviderDiagnostics: true,
    acceptsMalformedTimestamp: false,
    removal: 'delete the private proof and root proof scripts; no production consumer changes',
  },
  sharedApplicationPolicy: [
    'entity selection',
    'labels and formatting',
    'condition and desired-state meaning',
    'command authorization',
    'optimistic and timeout policy',
  ],
  interpretation:
    'The direct path is smaller for one application; the candidate centralizes validation, ordering, knowledge, and acknowledgement/effect safety for potential reuse.',
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
process.stdout.write(
  `${JSON.stringify({ ...record, output: relative(repositoryRoot, output) })}\n`,
);
