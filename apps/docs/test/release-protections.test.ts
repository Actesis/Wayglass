import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
const config = (name: string) => JSON.parse(read(`.github/release-protection/${name}.json`));

describe('release protections', () => {
  it('requires an up-to-date named Actions check and PR, including for administrators', () => {
    const main = config('main');
    expect(main.required_status_checks).toEqual({
      strict: true,
      checks: [{ context: 'Wayglass quality', app_id: 15368 }],
    });
    expect(main.enforce_admins).toBe(true);
    expect(main.required_pull_request_reviews.required_approving_review_count).toBe(0);
    expect(main.allow_force_pushes).toBe(false);
    expect(main.allow_deletions).toBe(false);
    expect(main.required_conversation_resolution).toBe(true);
    const workflow = read('.github/workflows/quality.yml');
    expect(workflow).toContain('name: Wayglass quality');
    expect(workflow).toContain('pull_request:');
    expect(workflow).toContain('persist-credentials: false');
    expect(workflow).toContain('fetch-depth: 0');
    for (const forbidden of [
      'pull_request_target',
      'secrets.',
      'id-token:',
      'npm publish',
      'npm stage',
    ])
      expect(workflow).not.toContain(forbidden);
  });
  it('separates administrator tag creation from immutable updates and deletion', () => {
    const creation = config('tag-creation');
    const immutable = config('tag-immutability');
    expect(creation.rules).toEqual([{ type: 'creation' }]);
    expect(creation.bypass_actors).toEqual([
      { actor_id: 5, actor_type: 'RepositoryRole', bypass_mode: 'always' },
    ]);
    expect(immutable.bypass_actors).toEqual([]);
    expect(immutable.rules.map((rule: { type: string }) => rule.type)).toEqual([
      'update',
      'deletion',
    ]);
    expect(creation.conditions).toEqual(immutable.conditions);
    expect(immutable.conditions.ref_name.include).toEqual([
      'refs/tags/foundation-v*',
      'refs/tags/icons-v*',
      'refs/tags/react-v*',
    ]);
  });
});
