import { describe, expect, it } from 'vitest';

import { appliedSiteHeaders, parseSiteHeaders } from '../src/headers.ts';

describe('Cloudflare-compatible site header metadata', () => {
  it('parses rules, combines overlaps, and matches preview placeholders', () => {
    const rules = parseSiteHeaders(`/*
  X-Frame-Options: SAMEORIGIN

/storybook/*
  X-Robots-Tag: noindex

https://:version.:subdomain.workers.dev/*
  X-Robots-Tag: noindex, nofollow
`);

    expect(
      appliedSiteHeaders(rules, new URL('https://wayglass.hoagsoftworks.com/storybook/')),
    ).toEqual(
      new Map([
        ['X-Frame-Options', 'SAMEORIGIN'],
        ['X-Robots-Tag', 'noindex'],
      ]),
    );
    expect(
      appliedSiteHeaders(rules, new URL('https://v1.wayglass.workers.dev/storybook/')),
    ).toEqual(
      new Map([
        ['X-Frame-Options', 'SAMEORIGIN'],
        ['X-Robots-Tag', 'noindex, noindex, nofollow'],
      ]),
    );
  });

  it.each([
    ['orphan header', '  X-Test: value\n', 'WG_SITE_HEADERS_RULE'],
    ['empty rule', '/*\n', 'WG_SITE_HEADERS_RULE'],
    ['unsafe absolute host', 'https://example.com/*\n  X-Test: value\n', 'WG_SITE_HEADERS_PATTERN'],
    ['unsupported removal', '/*\n  ! X-Test\n', 'WG_SITE_HEADERS_VALUE'],
    ['empty value', '/*\n  X-Test:\n', 'WG_SITE_HEADERS_VALUE'],
    ['control value', '/*\n  X-Test: safe\u0007unsafe\n', 'WG_SITE_HEADERS_VALUE'],
    ['long line', `/${'a'.repeat(2_000)}\n  X-Test: value\n`, 'WG_SITE_HEADERS_LINE'],
  ])('rejects %s', (_name, source, code) => {
    expect(() => parseSiteHeaders(source)).toThrow(code);
  });

  it('rejects more than 100 rules', () => {
    const source = Array.from({ length: 101 }, (_, index) => `/p${index}\n  X-Test: value`).join(
      '\n',
    );
    expect(() => parseSiteHeaders(source)).toThrow('WG_SITE_HEADERS_RULES');
  });
});
