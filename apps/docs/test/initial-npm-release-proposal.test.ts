import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  candidateDirectories,
  frozenSource,
} from '../../../tooling/release-candidate/src/constants.ts';

const root = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
const proposal = JSON.parse(read('docs/governance/initial-npm-release-proposal.json'));
const text = read('docs/governance/initial-npm-release-proposal.md').replace(/\s+/g, ' ');
const notes = read('docs/governance/initial-0.1.0-release-notes.md').replace(/\s+/g, ' ');

describe('execution-disabled initial npm release proposal', () => {
  it('binds exactly the verified hosted set and frozen source without refreezing package manifests', () => {
    expect(proposal.source).toEqual(frozenSource);
    expect(proposal.packages.map(({ name }: { name: string }) => name)).toEqual(
      candidateDirectories.map((directory) => `@wayglass/${directory}`),
    );
    const hosted = read('docs/governance/hosted-publication-rehearsal-result.md');
    for (const entry of proposal.packages) {
      expect(entry.version).toBe('0.1.0');
      expect(entry.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(hosted).toContain(entry.sha256);
      expect(hosted).toContain(String(entry.bytes));
      expect(JSON.parse(read(`packages/${entry.name.split('/')[1]}/package.json`)).private).toBe(
        true,
      );
    }
    expect(proposal.hostedReview).toMatchObject({
      runId: '42412111878',
      artifactId: '13589981847',
      archiveSha256: '4e4420000766bd883b87f3e38c0cfef637988475922dd8d0d18c8e4fe1e98dc9',
    });
  });
  it('does not turn plan selection or a PR merge into any registry or tag authority', () => {
    expect(proposal).toMatchObject({
      schemaVersion: 1,
      status: 'draft-for-owner-review',
      publicationAuthorized: false,
      registryActionsAuthorized: false,
      artifactAcceptance: 'pending',
      releaseCommit: null,
      finalApprover: null,
      releaseTagsCreated: false,
    });
    expect(proposal.bootstrap).toMatchObject({
      planSelectedByOwner: true,
      executionAuthorized: false,
      placeholderCreationAuthorized: false,
      credentialCreationAuthorized: false,
      workflowImplemented: false,
    });
    expect(proposal.distTag).toBe('next');
    expect(proposal.distTagStatus).toBe('proposed-confirm-at-final-approval');
    expect(text).toContain('No registry action or publication is authorized');
  });
  it('limits the staged-bootstrap proposal while preserving token, human, and provenance boundaries', () => {
    expect(proposal.bootstrap).toMatchObject({
      method: 'stage-first-with-scoped-stage-only-token',
      placeholderVersion: '0.0.0-stage',
      placeholderPolicyException: 'proposed-narrow-amendment',
      publisherNpmVersion: '11.21.2',
      environment: 'npm-release',
    });
    expect(proposal.ownerRecoveryReadinessConfirmed).toBe(true);
    for (const required of [
      'create any seventh package',
      'not a general-purpose security boundary',
      '2FA bypass disabled',
      'No pnpm install',
      'never a workspace directory',
      'immutable',
      'owner, not automation or OIDC',
      'never spoof GitHub',
      'stage/registry absence/collision checks',
    ]) {
      // Check semantic constraints, allowing Markdown emphasis around individual words.
      expect(text.replaceAll('**', '').toLowerCase()).toContain(required.toLowerCase());
    }
  });
  it('retains exact review bytes without granting registry, advisory capture, or tag authority', () => {
    expect(proposal.durableRetention.status).toBe('retained-for-review');
    expect(proposal.bootstrap.preflightWorkflowImplemented).toBe(true);
    expect(proposal.durableRetention.sha256).toBe(proposal.hostedReview.archiveSha256);
    expect(proposal.releaseTags).toEqual(['foundation-v0.1.0', 'icons-v0.1.0', 'react-v0.1.0']);
    expect(proposal.advisory).toMatchObject({
      validThrough: '2026-11-08T16:04:23Z',
      recheckAtExecution: true,
      newCaptureAuthorized: false,
    });
    expect(text).toContain('Do not replace an expired/missing archive with a rebuild');
    expect(text).toContain('No tag is created here');
  });
  it('keeps release notes draft and carries support/license limitations without announcing packages', () => {
    for (const required of [
      'unreleased draft',
      'not a release announcement',
      'Windows/NVDA',
      'client registration',
      '0.0.0-stage',
      'not bundled',
      'SpaceTraders',
      'separate project',
    ]) {
      expect(notes).toContain(required);
    }
    expect(read('CHANGELOG.md')).toContain('No Wayglass package has been published');
    // These source documents are included under different site routes. Keep draft review links
    // repository-based instead of inventing site routes or suppressing dead-link validation.
    for (const path of ['CHANGELOG.md', 'docs/governance/release-governance.md']) {
      expect(read(path)).toContain(
        'https://github.com/Actesis/Wayglass/blob/main/docs/governance/initial-npm-release-proposal.md',
      );
    }
    expect(read('docs/governance/initial-npm-release.md')).toContain(
      './initial-npm-release-proposal.md',
    );
    expect(read('docs/governance/release-governance.md')).toContain(
      'original existing-package prerequisite is obsolete',
    );
  });
});
