import { lstatSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { retainedPublicationArchive } from '../../../tooling/release-candidate/src/publication-preflight.ts';
import { sha256 } from '../../../tooling/release-candidate/src/hash.ts';

const root = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('initial retained archive/preflight boundary', () => {
  it('keeps the two-job signing handoff unsigned and binds outputs from the build job', () => {
    const workflow = read('.github/workflows/initial-release-signing.yml');
    expect(workflow).toContain('needs: reproduce');
    expect(workflow).toContain('needs.reproduce.outputs.artifact-id');
    expect(workflow).toContain('needs.reproduce.outputs.artifact-digest');
    expect(workflow).toContain('actions: read');
    expect(workflow).toContain('signing-handoff-cli.ts');
    for (const forbidden of ['id-token:', 'secrets.', ': write', 'npm stage', 'npm publish'])
      expect(workflow).not.toContain(forbidden);
  });
  it('keeps the unsigned reproduction run manual and requires exact compressed bytes', () => {
    const workflow = read('.github/workflows/initial-release-reproduction.yml');
    for (const required of [
      'workflow_dispatch:',
      'contents: read',
      'environment: npm-release',
      "github.ref == 'refs/heads/main'",
      'ce400e89930a047c6af1c6992c64cfe422a1eeee',
      'release-candidate:verify-publication',
      retainedPublicationArchive.sha256,
      'for package in core tokens themes elements icons react',
      'cmp "$REVIEW_PATH/expected.tgz" "$REVIEW_PATH/assembly/packages/$file"',
    ])
      expect(workflow).toContain(required);
    for (const forbidden of [
      'id-token:',
      'secrets.',
      'npm stage',
      'npm publish',
      'continue-on-error:',
      'always()',
    ])
      expect(workflow).not.toContain(forbidden);
  });
  it('retains exactly the reviewed binary ZIP rather than a pointer or new assembly', () => {
    const path = resolve(root, retainedPublicationArchive.path);
    expect(lstatSync(path).isFile()).toBe(true);
    const bytes = readFileSync(path);
    expect(bytes.byteLength).toBe(772966);
    expect(sha256(bytes)).toBe('4e4420000766bd883b87f3e38c0cfef637988475922dd8d0d18c8e4fe1e98dc9');
  });
  it('keeps the named future workflow manual, owner-gated, and unable to stage or publish', () => {
    const workflow = read('.github/workflows/npm-initial-release.yml');
    for (const required of [
      'workflow_dispatch:',
      'contents: read',
      'environment: npm-release',
      "github.repository == 'Actesis/Wayglass'",
      "github.ref == 'refs/heads/main'",
      'release-candidate:publication-preflight',
      'fetch-depth: 0',
      'persist-credentials: false',
      'package-manager-cache: false',
      'retention-days: 7',
      'if-no-files-found: error',
    ]) {
      expect(workflow).toContain(required);
    }
    for (const forbidden of [
      'id-token:',
      'secrets.',
      'npm stage',
      'npm publish',
      'npm trust',
      'git tag',
      'push:',
      'pull_request:',
      'workflow_run:',
      'schedule:',
      'continue-on-error:',
      'always()',
      'runner.temp',
      'npm@11.21.2',
    ])
      expect(workflow).not.toContain(forbidden);
    const actions = [...workflow.matchAll(/uses: (\S+)/g)].map((match) => match[1]);
    expect(actions).toHaveLength(3);
    for (const action of actions) expect(action).toMatch(/^actions\/[a-z-]+@[a-f0-9]{40}$/);
  });
  it('documents structural verification separately from outstanding release authority', () => {
    const contract = read('docs/governance/initial-npm-retention-preflight.md').replace(
      /\s+/g,
      ' ',
    );
    for (const text of [
      '77 unique',
      '48 graph files',
      'readyToStage: false',
      'No registry writer',
      'Expiry is an explicit blocker',
      'not an executable instruction list',
      'fresh owner UI approval',
    ]) {
      expect(contract).toContain(text);
    }
    const review = JSON.parse(read('docs/governance/initial-npm-release-proposal.json'));
    expect(review.durableRetention.status).toBe('retained-for-review');
    expect(review.registryActionsAuthorized).toBe(false);
    expect(review.bootstrap.workflowImplemented).toBe(false);
  });
});
