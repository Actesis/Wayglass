import { describe, expect, it } from 'vitest';

import type { SiteResponse } from '../../site-composer/src/response.ts';
import { assertWranglerResponseParity, WRANGLER_LOCAL_DIFFERENCES } from '../src/rehearsal.ts';

function expected(kind: SiteResponse['kind'] = 'asset'): SiteResponse {
  return {
    status: kind === 'redirect' ? 307 : 200,
    kind,
    headers:
      kind === 'redirect'
        ? new Map([['Location', '/clean']])
        : new Map([
            ['Content-Type', 'text/plain; charset=utf-8'],
            ['Cache-Control', 'public, max-age=0, must-revalidate'],
          ]),
    body: kind === 'redirect' ? new Uint8Array() : new TextEncoder().encode('proof'),
  };
}

describe('Wrangler response comparison', () => {
  it('accepts exact terminal response semantics', async () => {
    await expect(
      assertWranglerResponseParity(
        new Response('proof', {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=0, must-revalidate',
          },
        }),
        expected(),
        'GET',
        '/proof',
      ),
    ).resolves.toBeUndefined();
  });

  it('retains the observed local redirect-header difference', async () => {
    await expect(
      assertWranglerResponseParity(
        new Response(null, {
          status: 307,
          headers: { Location: '/clean', 'Content-Security-Policy': "default-src 'self'" },
        }),
        expected('redirect'),
        'GET',
        '/dirty',
      ),
    ).resolves.toBeUndefined();
    expect(WRANGLER_LOCAL_DIFFERENCES).toContain('redirects-include-custom-headers');
  });

  it('fails on unreviewed status, body, header, or redirect changes', async () => {
    await expect(
      assertWranglerResponseParity(
        new Response('missing', { status: 404 }),
        expected(),
        'GET',
        '/proof',
      ),
    ).rejects.toThrow('WG_CLOUDFLARE_PARITY');
    await expect(
      assertWranglerResponseParity(new Response('changed'), expected(), 'GET', '/proof'),
    ).rejects.toThrow('WG_CLOUDFLARE_PARITY');
    await expect(
      assertWranglerResponseParity(new Response('proof'), expected(), 'GET', '/proof'),
    ).rejects.toThrow('WG_CLOUDFLARE_PARITY');
    await expect(
      assertWranglerResponseParity(
        new Response(null, { status: 307, headers: { Location: '/clean' } }),
        expected('redirect'),
        'GET',
        '/dirty',
      ),
    ).rejects.toThrow('WG_CLOUDFLARE_LOCAL_DIFFERENCE');
  });
});
