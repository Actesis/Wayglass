import { execFileSync } from 'node:child_process';
import type { ExecFileSyncOptionsWithBufferEncoding } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { candidateDirectories } from './constants.ts';
import { verifySigningArtifactHandoff } from './signing-artifact-handoff.ts';
import { prepareSigningInputs } from './signing-inputs.ts';
import type { PublicationEvidence } from './types.ts';

export function readSigningArtifactEntries(read: (entry?: string) => Buffer) {
  const evidenceFile = 'publication-evidence.json';
  const files = candidateDirectories.map((name) => `wayglass-${name}-0.1.0.tgz`);
  const expected = [evidenceFile, ...files.map((file) => `packages/${file}`)].sort();
  const actual = read().toString('utf8').trimEnd().split('\n').sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error('Unexpected signing artifact inventory.');
  return {
    evidence: JSON.parse(read(evidenceFile).toString('utf8')) as PublicationEvidence,
    archives: files.map((file) => ({ file, bytes: read(`packages/${file}`) })),
  };
}

function main() {
  const [id, sha256, output] = process.argv.slice(2);
  const { GH_TOKEN, ...environment } = process.env;
  if (
    process.argv.length !== 5 ||
    !GH_TOKEN ||
    !id ||
    !/^[1-9][0-9]*$/.test(id) ||
    !Number.isSafeInteger(Number(id)) ||
    !sha256 ||
    !/^[a-f0-9]{64}$/.test(sha256) ||
    !output ||
    environment.GITHUB_REPOSITORY !== 'Actesis/Wayglass' ||
    environment.GITHUB_REF !== 'refs/heads/main' ||
    environment.ACTIONS_ID_TOKEN_REQUEST_TOKEN !== undefined
  )
    throw new Error('Invalid unsigned handoff context.');
  const bounds: ExecFileSyncOptionsWithBufferEncoding = {
    maxBuffer: 2 * 1024 * 1024,
    timeout: 30_000,
    stdio: ['ignore', 'pipe', 'pipe'],
  };
  const endpoint = `repos/Actesis/Wayglass/actions/artifacts/${id}`;
  const gh = (path: string) =>
    execFileSync('gh', ['api', '--hostname', 'github.com', path], {
      ...bounds,
      env: { PATH: process.env.PATH, GH_TOKEN, GH_PROMPT_DISABLED: '1' },
    });
  const metadata: unknown = JSON.parse(gh(endpoint).toString('utf8'));
  const buildRun = {
    id: environment.GITHUB_RUN_ID ?? '',
    attempt: environment.GITHUB_RUN_ATTEMPT ?? '',
  };
  const bytes = verifySigningArtifactHandoff({
    expected: {
      id: Number(id),
      sha256,
      runId: Number(buildRun.id),
      attempt: Number(buildRun.attempt),
      commit: environment.GITHUB_SHA ?? '',
    },
    metadata,
    bytes: gh(`${endpoint}/zip`),
  });
  const temporary = mkdtempSync(resolve(tmpdir(), 'wayglass-signing-handoff-'));
  try {
    const zip = resolve(temporary, 'verified.zip');
    writeFileSync(zip, bytes, { flag: 'wx', mode: 0o600 });
    const entries = readSigningArtifactEntries((entry) =>
      execFileSync('unzip', entry === undefined ? ['-Z1', zip] : ['-p', zip, entry], {
        ...bounds,
        env: { PATH: process.env.PATH },
      }),
    );
    const result = prepareSigningInputs({ ...entries, environment, buildRun });
    writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    main();
  } catch {
    console.error('Unsigned signing handoff failed. No signing or publication was attempted.');
    process.exitCode = 1;
  }
}
