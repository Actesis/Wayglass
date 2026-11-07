import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
const workflow = read('.github/workflows/release-rehearsal.yml');

describe('publication-disabled release workflow', () => {
  it('limits execution and authority to a manually requested main rehearsal', () => {
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain("github.repository == 'Actesis/Wayglass'");
    expect(workflow).toContain("github.ref == 'refs/heads/main'");
    expect(workflow).toContain('contents: read');
    expect(workflow).toContain('persist-credentials: false');
    for (const prohibited of [
      'id-token:',
      'secrets.',
      'npm publish',
      'npm stage',
      'git tag',
      'pull_request:',
      'push:',
    ]) {
      expect(workflow).not.toContain(prohibited);
    }
    const actions = [...workflow.matchAll(/uses: ([^\s]+)/g)].map((match) => match[1]);
    expect(actions).toHaveLength(3);
    for (const action of actions) expect(action).toMatch(/^actions\/[a-z-]+@[a-f0-9]{40}$/);
  });

  it('uses fresh pinned tooling and the existing frozen two-pass proof', () => {
    expect(workflow).toContain("node-version: '26.8.1'");
    expect(workflow).toContain('pnpm@11.9.0 --ignore-scripts');
    expect(workflow).toContain('package-manager-cache: false');
    expect(workflow).not.toContain('actions/cache');
    expect(workflow).toContain('ce400e89930a047c6af1c6992c64cfe422a1eeee');
    for (const command of ['check', 'build', 'verify']) {
      expect(workflow).toContain(`pnpm release-candidate:${command}`);
    }
    expect(workflow).toContain('retention-days: 7');
    for (const directory of ['core', 'tokens', 'themes', 'elements', 'icons', 'react']) {
      expect(JSON.parse(read(`packages/${directory}/package.json`)).private).toBe(true);
    }
    expect(read('docs/governance/initial-npm-release.md')).toContain('publicly downloadable');
  });
});
