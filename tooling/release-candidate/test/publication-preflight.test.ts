import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  initialPublicationPreflight,
  publicationArchivePaths,
  retainedPublicationArchive,
  validatePublicationArchivePaths,
} from '../src/publication-preflight.ts';
import { runCommand } from '../src/process.ts';
import { sha256 } from '../src/hash.ts';
import type { CommandRequest, CommandRunner } from '../src/types.ts';
import { repositoryRoot } from './fixtures.ts';

const temporary: string[] = [];
function temp() {
  const root = mkdtempSync(resolve(tmpdir(), 'wayglass-preflight-test-'));
  temporary.push(root);
  return root;
}
afterEach(() => {
  for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture() {
  const root = temp();
  const output = resolve(temp(), 'report');
  for (const file of [
    retainedPublicationArchive.path,
    'docs/governance/initial-npm-release-proposal.json',
    'docs/governance/evidence/initial-npm-advisory-2026-11-07.json',
  ]) {
    mkdirSync(dirname(resolve(root, file)), { recursive: true });
    cpSync(resolve(repositoryRoot, file), resolve(root, file));
  }
  const requests: CommandRequest[] = [];
  const runner: CommandRunner = async (request) => {
    requests.push(request);
    if (request.command === 'git') {
      if (request.arguments.includes('--show-toplevel')) return { stdout: root, stderr: '' };
      if (request.arguments.includes('--porcelain=v1')) return { stdout: '', stderr: '' };
      return runCommand({ ...request, cwd: repositoryRoot });
    }
    return runCommand(request);
  };
  return { root, output, requests, runner };
}

describe('retained initial publication preflight', () => {
  it('verifies real retained bytes and reports blockers without executing npm or registry operations', async () => {
    const { root, output, runner, requests } = fixture();
    const reportPath = await initialPublicationPreflight(
      root,
      output,
      runner,
      { PATH: process.env.PATH },
      new Date('2026-11-07T21:00:00Z'),
    );
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    expect(report).toMatchObject({
      mode: 'verification-only',
      structuralValidationPassed: true,
      publicationAuthorized: false,
      registryActionsAuthorized: false,
      readyToStage: false,
      provenanceGenerated: false,
      historicalHostedRunReauthenticated: false,
      advisory: { status: 'current', findingCount: 0, newCaptureAuthorized: false },
    });
    expect(report.advisory.notices).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'WG_RC_ADVISORY_MEDIA_TYPE' })]),
    );
    expect(report.packages).toHaveLength(6);
    expect(report.blockers.length).toBeGreaterThan(0);
    expect(requests.every(({ command }) => ['git', 'unzip', 'tar'].includes(command))).toBe(true);
    for (const request of requests.filter(({ command }) => command === 'unzip'))
      expect(existsSync(request.cwd)).toBe(false);
    expect(sha256(readFileSync(resolve(root, retainedPublicationArchive.path)))).toBe(
      retainedPublicationArchive.sha256,
    );
  });
  it('reports advisory expiry without renewing it or converting historical evidence into authority', async () => {
    const { root, output, runner } = fixture();
    const path = await initialPublicationPreflight(
      root,
      output,
      runner,
      {},
      new Date('2026-11-08T16:04:23Z'),
    );
    const report = JSON.parse(readFileSync(path, 'utf8'));
    expect(report.advisory).toMatchObject({
      status: 'expired',
      validThrough: '2026-11-08T16:04:23Z',
      newCaptureAuthorized: false,
    });
    expect(report.readyToStage).toBe(false);
    expect(report.blockers.join(' ')).toContain('Advisory expired');
  });
  it('rejects corrupt archive bytes before extraction and leaves input and earlier outputs alone', async () => {
    const { root, output, runner, requests } = fixture();
    writeFileSync(resolve(root, retainedPublicationArchive.path), 'corrupt');
    await expect(initialPublicationPreflight(root, output, runner, {})).rejects.toThrow(
      /WG_RC_PREFLIGHT_ARCHIVE/,
    );
    expect(requests.some(({ command }) => command === 'unzip')).toBe(false);
    expect(existsSync(output)).toBe(false);
    expect(readFileSync(resolve(root, retainedPublicationArchive.path), 'utf8')).toBe('corrupt');
    mkdirSync(output);
    writeFileSync(resolve(output, 'owner-file'), 'preserve');
    await expect(initialPublicationPreflight(root, output, runner, {})).rejects.toThrow(
      /WG_RC_OUTPUT_EXISTS/,
    );
    expect(readFileSync(resolve(output, 'owner-file'), 'utf8')).toBe('preserve');
  });
  it('rejects path escapes, missing entries, and duplicates before extraction', () => {
    const paths = publicationArchivePaths();
    expect(paths).toHaveLength(77);
    expect(() => validatePublicationArchivePaths(paths)).not.toThrow();
    for (const bad of [
      paths.slice(1),
      [...paths, paths[0]!],
      ['../escape', ...paths.slice(1)],
      ['/absolute', ...paths.slice(1)],
    ]) {
      expect(() => validatePublicationArchivePaths(bad)).toThrow(/WG_RC_PREFLIGHT_ARCHIVE_PATHS/);
    }
  });
  it('rejects credentials before effects and refuses an approval-shaped mutation of the planning record', async () => {
    let ran = false;
    await expect(
      initialPublicationPreflight(
        '/absent',
        '/absent',
        async () => {
          ran = true;
          throw new Error('must not run');
        },
        { NPM_TOKEN: 'test' },
      ),
    ).rejects.toThrow(/WG_RC_CREDENTIAL_EXPOSURE/);
    expect(ran).toBe(false);
    const { root, output, runner } = fixture();
    const file = resolve(root, 'docs/governance/initial-npm-release-proposal.json');
    const review = JSON.parse(readFileSync(file, 'utf8'));
    writeFileSync(file, JSON.stringify({ ...review, publicationAuthorized: true }));
    await expect(initialPublicationPreflight(root, output, runner, {})).rejects.toThrow(
      /WG_RC_PREFLIGHT_REVIEW/,
    );
    expect(existsSync(output)).toBe(false);
  });
  it('removes only its temporary extraction when a retained receipt is inconsistent', async () => {
    const { root, output, runner, requests } = fixture();
    const inconsistent: CommandRunner = async (request) => {
      const result = await runner(request);
      if (request.command === 'unzip' && request.arguments[0] === '-q') {
        const file = resolve(request.arguments[3]!, 'hosted-run.json');
        const receipt = JSON.parse(readFileSync(file, 'utf8'));
        writeFileSync(file, JSON.stringify({ ...receipt, runId: 'other-run' }));
      }
      return result;
    };
    await expect(initialPublicationPreflight(root, output, inconsistent, {})).rejects.toThrow(
      /WG_RC_PREFLIGHT_IDENTITY/,
    );
    expect(existsSync(output)).toBe(false);
    for (const request of requests.filter(({ command }) => command === 'unzip'))
      expect(existsSync(request.cwd)).toBe(false);
    expect(existsSync(resolve(root, retainedPublicationArchive.path))).toBe(true);
  });
});
