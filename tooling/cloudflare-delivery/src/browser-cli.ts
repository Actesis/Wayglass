import { pathToFileURL } from 'node:url';

import { verifyImmutableBrowser } from './browser.ts';
import type { EdgeVerificationOptions } from './edge.ts';
import { CloudflareDeliveryError } from './error.ts';

export function parseBrowserArguments(arguments_: readonly string[]): EdgeVerificationOptions {
  const options = arguments_.filter((argument) => argument !== '--');
  const values = new Map<string, string>();
  for (let index = 0; index < options.length; index += 2) {
    const name = options[index];
    const value = options[index + 1];
    if (
      name === undefined ||
      value === undefined ||
      !['--input', '--url', '--version-id', '--output'].includes(name) ||
      value.startsWith('--') ||
      values.has(name)
    ) {
      throw new CloudflareDeliveryError(
        'WG_CLOUDFLARE_BROWSER_INVOCATION',
        'site:browser:edge:check requires one value each for --input, --url, --version-id, and --output.',
      );
    }
    values.set(name, value);
  }
  if (values.size !== 4) {
    throw new CloudflareDeliveryError(
      'WG_CLOUDFLARE_BROWSER_INVOCATION',
      'site:browser:edge:check requires one value each for --input, --url, --version-id, and --output.',
    );
  }
  return {
    input: values.get('--input')!,
    url: values.get('--url')!,
    versionId: values.get('--version-id')!,
    output: values.get('--output')!,
  };
}

export async function main(arguments_: readonly string[]): Promise<void> {
  const result = await verifyImmutableBrowser(parseBrowserArguments(arguments_));
  console.log(
    `Verified immutable browser version ${result.target.versionId} with ${result.proof.browser.name} ${result.proof.browser.version}; captured sanitized evidence.`,
  );
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(
      error instanceof CloudflareDeliveryError
        ? error.message
        : 'WG_CLOUDFLARE_BROWSER_INTERNAL: Unexpected browser-verification failure.',
    );
    process.exitCode =
      error instanceof CloudflareDeliveryError && error.code === 'WG_CLOUDFLARE_BROWSER_INVOCATION'
        ? 2
        : 1;
  });
}
