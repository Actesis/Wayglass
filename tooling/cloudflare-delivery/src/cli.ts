import { pathToFileURL } from 'node:url';

import { CloudflareDeliveryError } from './error.ts';
import { runWranglerRehearsal } from './rehearsal.ts';

export function parseArguments(arguments_: readonly string[]): string {
  const options = arguments_.filter((argument) => argument !== '--');
  const input = options[1];
  if (
    options.length !== 2 ||
    options[0] !== '--input' ||
    input === undefined ||
    input.startsWith('--')
  ) {
    throw new CloudflareDeliveryError(
      'WG_CLOUDFLARE_INVOCATION',
      'site:wrangler:check requires exactly one --input value.',
    );
  }
  return input;
}

export async function main(arguments_: readonly string[]): Promise<void> {
  const result = await runWranglerRehearsal({
    repositoryRoot: process.cwd(),
    input: parseArguments(arguments_),
  });
  console.log(
    `Checked Wrangler ${result.compatibilityDate} against site ${result.bundleSha256}; ${result.comparedResponses} responses and ${result.differences.length} retained local differences.`,
  );
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(
      error instanceof CloudflareDeliveryError
        ? error.message
        : 'WG_CLOUDFLARE_INTERNAL: Unexpected Wrangler rehearsal failure.',
    );
    process.exitCode =
      error instanceof CloudflareDeliveryError && error.code === 'WG_CLOUDFLARE_INVOCATION' ? 2 : 1;
  });
}
