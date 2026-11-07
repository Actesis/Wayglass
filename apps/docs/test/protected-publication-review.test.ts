import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('protected publication metadata review', () => {
  it('requires existing owner approval and only the main branch', () => {
    const environment = JSON.parse(read('.github/release-protection/npm-release-environment.json'));
    expect(environment.can_admins_bypass).toBe(false);
    expect(environment.reviewers).toEqual([{ type: 'User', id: 27646205 }]);
    expect(environment.prevent_self_review).toBe(false);
    expect(environment.deployment_branch_policy).toEqual({
      protected_branches: false,
      custom_branch_policies: true,
    });
    expect(JSON.parse(read('.github/release-protection/npm-release-branch.json'))).toEqual({
      name: 'main',
      type: 'branch',
    });
  });
  it('cannot publish, stage, obtain OIDC, or reference secrets', () => {
    const workflow = read('.github/workflows/publication-review.yml');
    expect(workflow).toContain('environment: npm-release');
    expect(workflow).toContain("github.ref == 'refs/heads/main'");
    expect(workflow).toContain('contents: read');
    expect(workflow).toContain('persist-credentials: false');
    expect(workflow).toContain('release-candidate:publication-plan');
    expect(workflow).toContain('fetch-depth: 0');
    for (const forbidden of [
      'id-token:',
      'secrets.',
      'npm publish',
      'npm stage',
      'pull_request:',
      'push:',
    ])
      expect(workflow).not.toContain(forbidden);
    const actions = [...workflow.matchAll(/uses: (\S+)/g)].map((match) => match[1]);
    expect(actions).toHaveLength(3);
    for (const action of actions) expect(action).toMatch(/^actions\/[a-z-]+@[a-f0-9]{40}$/);
    expect(read('docs/governance/protected-publication-review.md')).toContain(
      'not installable packages',
    );
  });
});
