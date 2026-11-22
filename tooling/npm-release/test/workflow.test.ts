import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const workflow = readFileSync(
  resolve(import.meta.dirname, '../../../.github/workflows/npm-release.yml'),
  'utf8',
);
const [, prepareJob = '', stageJob = ''] = workflow.split(/\n {2}(?:prepare|stage):\n/);

describe('npm release workflow', () => {
  it('runs only by manual dispatch from main in this repository', () => {
    expect(workflow).toMatch(/\non:\n {2}workflow_dispatch:\n/);
    expect(workflow).not.toMatch(/\n {2}(push|pull_request|pull_request_target|schedule):/);
    expect(prepareJob).toContain(
      "if: github.repository == 'Actesis/Wayglass' && github.ref == 'refs/heads/main'",
    );
    expect(stageJob).toContain('needs: prepare');
  });

  it('gives only the staging job OIDC, behind the owner-approved environment', () => {
    expect(workflow.match(/id-token: write/g)).toHaveLength(1);
    expect(stageJob).toContain('id-token: write');
    expect(stageJob).toContain('environment: npm-release');
    expect(prepareJob).not.toContain('environment:');
  });

  it('never runs repository code where the OIDC token is available', () => {
    expect(stageJob).not.toContain('actions/checkout');
    expect(stageJob).not.toMatch(/\bpnpm\b/);
    expect(stageJob).toContain('sha256sum --check --strict SHA256SUMS');
    expect(stageJob).toContain('npm install --global npm@11.21.2 --ignore-scripts');
  });

  it('stages rather than publishes, with provenance and an explicit dist-tag', () => {
    expect(stageJob).toContain('npm stage publish');
    expect(workflow).not.toMatch(/npm publish\b/);
    expect(stageJob).toContain('--provenance');
    expect(stageJob).toContain('--tag="$RELEASE_DIST_TAG"');
    expect(stageJob).toContain('--access=public');
  });

  it('requires the passing quality check and refuses existing versions before packing', () => {
    expect(prepareJob).toContain('check_name=Wayglass%20quality');
    expect(prepareJob).toContain('select(.app.id == 15368)');
    expect(prepareJob).toContain('npm view "$name@$RELEASE_VERSION"');
    expect(prepareJob.indexOf('Require the passing quality check')).toBeLessThan(
      prepareJob.indexOf('pnpm build'),
    );
  });

  it('uses no secrets, pins every action, and keeps inputs out of shell scripts', () => {
    expect(workflow).not.toContain('secrets.');
    for (const use of workflow.match(/uses: \S+/g) ?? []) expect(use).toMatch(/@[0-9a-f]{40}$/);
    const runBlocks = workflow.split('\n').filter((line) => /^\s+run: /.test(line));
    for (const line of runBlocks) expect(line).not.toContain('${{');
    for (const script of workflow.match(/run: \|\n(?:\s{10,}.*\n)+/g) ?? [])
      expect(script).not.toContain('${{');
  });
});
