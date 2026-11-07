import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
const workflow = read('.github/workflows/publication-rehearsal.yml');

describe('owner-gated hosted public rehearsal', () => {
  it('requires manual main-only owner approval without publish permissions or bypasses', () => {
    for (const required of [
      'workflow_dispatch:',
      'contents: read',
      'environment: npm-release',
      "github.repository == 'Actesis/Wayglass'",
      "github.ref == 'refs/heads/main'",
      'cancel-in-progress: false',
      'group: publication-review',
      'timeout-minutes: 60',
    ])
      expect(workflow).toContain(required);
    for (const forbidden of [
      'push:',
      'pull_request:',
      'workflow_run:',
      'schedule:',
      'id-token:',
      'secrets.',
      'npm publish',
      'npm stage',
      'continue-on-error:',
      'always()',
      'actions/cache@',
      'gh api',
      'git tag',
      'git push',
    ]) {
      expect(workflow).not.toContain(forbidden);
    }
  });
  it('pins actions and exact tools and provisions new browser storage outside the upload root', () => {
    const actions = [...workflow.matchAll(/uses: (\S+)/g)].map((match) => match[1]);
    expect(actions).toHaveLength(3);
    for (const action of actions) expect(action).toMatch(/^actions\/[a-z-]+@[a-f0-9]{40}$/);
    for (const required of [
      "node-version: '26.8.1'",
      'pnpm@11.9.0',
      'ubuntu-24.04',
      'fetch-depth: 0',
      'persist-credentials: false',
      'package-manager-cache: false',
      "TURBO_FORCE: 'true'",
      'PLAYWRIGHT_BROWSERS_PATH=$RUNNER_TEMP/wayglass-public-review-browsers-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT',
      'playwright install --with-deps chromium firefox webkit',
    ])
      expect(workflow.replace(/\s+/g, ' ')).toContain(required);
  });
  it('exports runner-dependent storage at step runtime rather than in unsupported job expressions', () => {
    const jobEnvironment = workflow.slice(
      workflow.indexOf('    env:'),
      workflow.indexOf('    steps:'),
    );
    expect(jobEnvironment).not.toContain('runner.');
    expect(jobEnvironment).not.toContain('PLAYWRIGHT_BROWSERS_PATH');
    const setupPosition = workflow.indexOf('- name: Configure run-local browser storage');
    expect(setupPosition).toBeGreaterThan(0);
    expect(setupPosition).toBeLessThan(workflow.indexOf('playwright install --with-deps'));
    const script = workflow.slice(setupPosition).match(/run: \|\n([\s\S]*?)(?=\n {6}- name:)/)?.[1];
    expect(script).toBeDefined();
    const root = mkdtempSync(resolve(tmpdir(), 'wayglass-runner-path-test-'));
    try {
      const environmentFile = resolve(root, 'github-env');
      const runnerTemp = resolve(root, 'runner storage');
      const result = spawnSync('/bin/bash', ['-euo', 'pipefail', '-c', script!], {
        encoding: 'utf8',
        env: {
          RUNNER_TEMP: runnerTemp,
          GITHUB_RUN_ID: '123',
          GITHUB_RUN_ATTEMPT: '2',
          GITHUB_ENV: environmentFile,
        },
      });
      expect(result.status, result.stderr).toBe(0);
      expect(readFileSync(environmentFile, 'utf8')).toBe(
        `PLAYWRIGHT_BROWSERS_PATH=${runnerTemp}/wayglass-public-review-browsers-123-2\n`,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it('orders explicit network preparation before offline assembly and exact-archive consumers', () => {
    const commands = [
      'release-candidate:check',
      'release-candidate:provision-consumers',
      'release-candidate:build-publication',
      'release-candidate:verify-publication --',
      'release-candidate:probe-publication',
      'release-candidate:verify-publication-consumers',
      "proofSha256: createHash('sha256')",
      'uses: actions/upload-artifact@',
    ];
    const positions = commands.map((command) => workflow.indexOf(command));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(workflow).toContain('SOURCE_COMMIT: ce400e89930a047c6af1c6992c64cfe422a1eeee');
    expect(workflow).toContain('--evidence "$REVIEW_PATH/assembly/publication-evidence.json"');
    expect(workflow).toContain('--output "$REVIEW_PATH/proof"');
    expect(workflow).toContain('if-no-files-found: error');
    expect(workflow).toContain('retention-days: 7');
    expect(workflow).toContain('path: ${{ env.REVIEW_PATH }}/');
  });
  it('documents evidence admission and owner action without redefining metadata-only review', () => {
    const contract = read('docs/governance/hosted-publication-rehearsal.md');
    for (const text of [
      'Review deployments',
      'Approve and deploy',
      'not provenance',
      'seven days',
      'No npm publication',
      'hostedRunAuthenticated: false',
      'verify-publication-consumers',
    ])
      expect(contract.replace(/\s+/g, ' ')).toContain(text);
    expect(read('.github/workflows/publication-review.yml')).not.toContain('build-publication');
  });
});
