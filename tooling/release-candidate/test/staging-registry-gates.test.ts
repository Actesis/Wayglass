import { describe, expect, it } from 'vitest';

import { probeInitialRegistryCollision } from '../src/staging-registry-gates.ts';

const missing = () => Response.json({ error: 'Not found' }, { status: 404 });
const stagePath = '/-/stage?package=%40wayglass%2Fcore&page=0&perPage=100';
const packagePath = '/%40wayglass%2Fcore';

function fixture(overrides: Record<number, () => Response> = {}) {
  const calls: { path: string; auth: boolean }[] = [];
  const responses = [
    () => Response.json({ username: 'fictional-maintainer' }),
    () => Response.json({ total: 0, items: [] }),
    missing,
    missing,
  ];
  const request: typeof fetch = async (url, options) => {
    const address = new URL(String(url));
    expect(address.origin).toBe('https://registry.npmjs.org');
    expect(options?.method).toBe('GET');
    expect(options?.redirect).toBe('error');
    expect(options?.cache).toBe('no-store');
    const auth = new Headers(options?.headers).get('authorization');
    if (auth) expect(auth).toBe('Bearer npm_Fictional');
    const index = calls.length;
    calls.push({ path: address.pathname + address.search, auth: auth !== null });
    return (overrides[index] ?? responses[index]!)();
  };
  return {
    calls,
    input: {
      packageName: '@wayglass/core',
      expectedUsername: 'fictional-maintainer',
      readToken: 'npm_Fictional',
      request,
    },
  };
}

describe('initial npm read-only collision probe', () => {
  it('reports only visibility, never authoritative absence or creation permissions', async () => {
    const f = fixture();
    expect(await probeInitialRegistryCollision(f.input)).toMatchObject({
      publicPackument: 'not-visible',
      authenticatedPackument: 'not-visible',
      visibleStageCount: 0,
      authoritativeAbsenceVerified: false,
      packageCreationAllowed: false,
    });
    expect(f.calls).toEqual([
      { path: '/-/whoami', auth: true },
      { path: stagePath, auth: true },
      { path: packagePath, auth: false },
      { path: packagePath, auth: true },
    ]);
  });

  it('rejects names outside the reviewed scope before any request', async () => {
    const f = fixture();
    await expect(
      probeInitialRegistryCollision({ ...f.input, packageName: '@wayglass/other' }),
    ).rejects.toThrow(/WG_STAGE_REGISTRY/);
    expect(f.calls).toEqual([]);
  });

  it('blocks visible packages and stages, including placeholders and incomplete pages', async () => {
    for (const overrides of [
      { 1: () => Response.json({ total: 1, items: [] }) },
      { 1: () => Response.json({ total: 0, items: [{ version: '0.1.0' }] }) },
      { 1: () => Response.json({ total: 0, items: [] }, { headers: { link: 'next' } }) },
      { 2: () => Response.json({ versions: { '0.0.0-stage': {} } }) },
      { 3: () => Response.json({ versions: { '0.1.0': {} } }) },
    ])
      await expect(probeInitialRegistryCollision(fixture(overrides).input)).rejects.toThrow(
        /WG_STAGE_REGISTRY/,
      );
  });

  it('rejects identity mismatch, permission errors, malformed responses, and oversized bodies', async () => {
    for (const overrides of [
      { 0: () => Response.json({ username: 'other' }) },
      { 1: () => Response.json({ error: 'npm_Fictional' }, { status: 403 }) },
      { 1: () => missing() },
      { 1: () => Response.json({ items: [] }) },
      { 2: () => new Response('not a packument', { status: 404 }) },
      { 3: () => new Response('x'.repeat(2 * 1024 * 1024 + 1), { status: 404 }) },
    ])
      await expect(probeInitialRegistryCollision(fixture(overrides).input)).rejects.toThrow(
        'WG_STAGE_REGISTRY: Registry evidence is unavailable, incomplete, or indicates a collision.',
      );
  });
});
