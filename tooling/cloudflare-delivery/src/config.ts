import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Unstable_RawConfig } from 'wrangler';

import { fail } from './error.ts';

export const WRANGLER_VERSION = '4.128.0';
export const WORKER_NAME = 'wayglass-docs';
export const COMPATIBILITY_DATE = '2026-09-07';

const ROOT_KEYS = [
  '$schema',
  'assets',
  'compatibility_date',
  'dependencies_instrumentation',
  'name',
  'preview_urls',
  'send_metrics',
  'workers_dev',
] as const;
const ASSET_KEYS = ['html_handling', 'not_found_handling'] as const;

export interface CloudflareDeliveryConfig {
  readonly $schema: './node_modules/wrangler/config-schema.json';
  readonly name: typeof WORKER_NAME;
  readonly compatibility_date: typeof COMPATIBILITY_DATE;
  readonly workers_dev: true;
  readonly preview_urls: true;
  readonly send_metrics: false;
  readonly dependencies_instrumentation: { readonly enabled: false };
  readonly assets: {
    readonly html_handling: 'auto-trailing-slash';
    readonly not_found_handling: '404-page';
  };
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail('WG_CLOUDFLARE_CONFIG', `${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail('WG_CLOUDFLARE_CONFIG', `${label} contains missing or unreviewed fields.`);
  }
}

export function parseCloudflareDeliveryConfig(source: string): CloudflareDeliveryConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source.replace(/,\s*([}\]])/g, '$1'));
  } catch {
    fail(
      'WG_CLOUDFLARE_CONFIG',
      'wrangler.jsonc may use trailing commas but no other JSONC extensions.',
    );
  }
  const config = object(parsed, 'wrangler.jsonc');
  const assets = object(config.assets, 'wrangler.jsonc assets');
  const instrumentation = object(
    config.dependencies_instrumentation,
    'wrangler.jsonc dependencies_instrumentation',
  );
  exactKeys(config, ROOT_KEYS, 'wrangler.jsonc');
  exactKeys(assets, ASSET_KEYS, 'wrangler.jsonc assets');
  exactKeys(instrumentation, ['enabled'], 'wrangler.jsonc dependencies_instrumentation');

  if (
    config.$schema !== './node_modules/wrangler/config-schema.json' ||
    config.name !== WORKER_NAME ||
    config.compatibility_date !== COMPATIBILITY_DATE ||
    config.workers_dev !== true ||
    config.preview_urls !== true ||
    config.send_metrics !== false ||
    instrumentation.enabled !== false ||
    assets.html_handling !== 'auto-trailing-slash' ||
    assets.not_found_handling !== '404-page'
  ) {
    fail(
      'WG_CLOUDFLARE_CONFIG',
      'wrangler.jsonc does not match the accepted static delivery policy.',
    );
  }
  return config as unknown as CloudflareDeliveryConfig;
}

export function readCloudflareDeliveryConfig(repositoryRoot: string): CloudflareDeliveryConfig {
  const config = parseCloudflareDeliveryConfig(
    readFileSync(resolve(repositoryRoot, 'wrangler.jsonc'), 'utf8'),
  );
  const rootPackage = JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8')) as {
    devDependencies?: Record<string, string>;
  };
  const wranglerPackage = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'node_modules/wrangler/package.json'), 'utf8'),
  ) as { version?: string };
  if (
    rootPackage.devDependencies?.wrangler !== WRANGLER_VERSION ||
    wranglerPackage.version !== WRANGLER_VERSION
  ) {
    fail(
      'WG_CLOUDFLARE_WRANGLER',
      `The local Wrangler executable must be exactly ${WRANGLER_VERSION}.`,
    );
  }
  return config;
}

export function configWithVerifiedAssets(
  config: CloudflareDeliveryConfig,
  directory: string,
): Unstable_RawConfig {
  return {
    ...config,
    assets: { ...config.assets, directory },
  };
}
