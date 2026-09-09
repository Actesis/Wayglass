import { describe, expect, it } from 'vitest';

import {
  assertAdmittedPath,
  assertNoCredentialContent,
  collisionKey,
  destinationPath,
  normalizeRelativePath,
} from '../src/admission.ts';
import { SiteComposerError } from '../src/error.ts';
import { bytes } from './fixtures.ts';

describe('site path admission', () => {
  it('keeps safe normalized paths and projects exact destinations', () => {
    expect(normalizeRelativePath('assets/app-A1.js')).toBe('assets/app-A1.js');
    expect(destinationPath('documentation', 'index.html')).toBe('index.html');
    expect(destinationPath('storybook', 'assets/app.js')).toBe('storybook/assets/app.js');
    expect(collisionKey('Assets/App.js')).toBe('assets/app.js');
  });

  it.each([
    ['', 'empty'],
    ['/root', 'absolute'],
    ['C:/root', 'absolute'],
    ['one\\two', 'backslash'],
    ['one//two', 'empty-segment'],
    ['./one', 'traversal'],
    ['one/../two', 'traversal'],
    ['one\0two', 'nul'],
    ['cafe\u0301.html', 'unicode-normalization'],
  ])('rejects unsafe path %j with the %s rule', (path, rule) => {
    expect(() => normalizeRelativePath(path)).toThrowError(
      expect.objectContaining<Partial<SiteComposerError>>({ code: 'WG_SITE_PATH' }),
    );
    expect(() => normalizeRelativePath(path)).toThrow(rule);
  });

  it.each([
    ['documentation', 'storybook/index.html'],
    ['documentation', 'wayglass-site-manifest.json'],
    ['storybook', 'app.js.map'],
    ['documentation', '.env.production'],
    ['documentation', 'keys/private.pem'],
    ['documentation', 'wrangler.jsonc'],
  ] as const)('rejects reserved and private %s path %s', (surface, path) => {
    expect(() => assertAdmittedPath(surface, path)).toThrowError(SiteComposerError);
  });

  it('reserves only the root manifest destination', () => {
    expect(() => assertAdmittedPath('storybook', 'wayglass-site-manifest.json')).not.toThrow();
  });
});

describe('credential-content admission', () => {
  it.each([
    ['private key', '-----BEGIN PRIVATE KEY-----\nnot-a-real-key'],
    ['npm token', 'npm_abcdefghijklmnopqrstuvwxyz123456'],
    ['GitHub token', 'ghp_abcdefghijklmnopqrstuvwxyz123456'],
    ['Cloudflare token', 'CLOUDFLARE_API_TOKEN=not-a-real-token-value'],
    ['generic assignment', 'CLIENT_SECRET=not-a-real-secret'],
  ])('rejects and redacts a %s marker', (_label, content) => {
    let caught: unknown;
    try {
      assertNoCredentialContent('assets/config.txt', bytes(content));
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(SiteComposerError);
    expect(String(caught)).toContain('matched content is redacted');
    expect(String(caught)).not.toContain(content);
  });

  it('does not scan binary bytes as text', () => {
    const binary = new Uint8Array([0xff, 0x00, ...bytes('CLIENT_SECRET=not-a-real-secret')]);
    expect(() => assertNoCredentialContent('assets/image.jpg', binary)).not.toThrow();
  });
});
