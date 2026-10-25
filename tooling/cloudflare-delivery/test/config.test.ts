import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  configWithVerifiedAssets,
  parseCloudflareDeliveryConfig,
  readCloudflareDeliveryConfig,
  WRANGLER_VERSION,
} from '../src/config.ts';
import { parseArguments } from '../src/cli.ts';

const repositoryRoot = resolve(import.meta.dirname, '../../..');

describe('Cloudflare delivery configuration', () => {
  it('pins the reviewed dependency and inert static-assets policy', () => {
    const config = readCloudflareDeliveryConfig(repositoryRoot);
    expect(config).toMatchObject({
      name: 'wayglass-docs',
      compatibility_date: '2026-09-07',
      workers_dev: true,
      preview_urls: true,
      send_metrics: false,
      dependencies_instrumentation: { enabled: false },
      assets: {
        html_handling: 'auto-trailing-slash',
        not_found_handling: '404-page',
      },
    });
    expect(config.assets).not.toHaveProperty('directory');
    expect(
      JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8')),
    ).toHaveProperty('devDependencies.wrangler', WRANGLER_VERSION);
    expect(readFileSync(resolve(repositoryRoot, 'pnpm-workspace.yaml'), 'utf8')).toContain(
      'workerd: true',
    );
    const lockfile = readFileSync(resolve(repositoryRoot, 'pnpm-lock.yaml'), 'utf8');
    expect(lockfile).toContain('wrangler@4.128.0:');
    expect(lockfile).toContain(
      'sha512-jNXy9e8/pbx8iqTzXPiuflnitKJZoAfEUSUUDLW87bwyeMvJ7kb3yQMSbxEcfNdfHqJW38KRcKaLljOYV4N/4w==',
    );
  });

  it('injects only an independently verified directory at execution time', () => {
    const config = readCloudflareDeliveryConfig(repositoryRoot);
    expect(configWithVerifiedAssets(config, '/tmp/verified-wayglass-site').assets).toEqual({
      directory: '/tmp/verified-wayglass-site',
      html_handling: 'auto-trailing-slash',
      not_found_handling: '404-page',
    });
    expect(config.assets).not.toHaveProperty('directory');
  });

  it('rejects unreviewed configuration and malformed invocation', () => {
    const source = readFileSync(resolve(repositoryRoot, 'wrangler.jsonc'), 'utf8');
    const config = parseCloudflareDeliveryConfig(source);
    expect(() =>
      parseCloudflareDeliveryConfig(JSON.stringify({ ...config, routes: ['*/*'] })),
    ).toThrow('WG_CLOUDFLARE_CONFIG');
    expect(() => parseCloudflareDeliveryConfig('{')).toThrow('WG_CLOUDFLARE_CONFIG');
    expect(parseArguments(['--', '--input', '/tmp/site'])).toBe('/tmp/site');
    expect(() => parseArguments(['--input'])).toThrow('WG_CLOUDFLARE_INVOCATION');
    expect(() => parseArguments(['--input', '/tmp/site', '--remote'])).toThrow(
      'WG_CLOUDFLARE_INVOCATION',
    );
  });
});
