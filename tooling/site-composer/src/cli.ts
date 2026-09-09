import { pathToFileURL } from 'node:url';

import { composeSite } from './compose.ts';
import { SiteComposerError } from './error.ts';

const usage = 'Usage: pnpm site:compose -- --output <absolute-new-temporary-directory>';

export function parseComposeArguments(arguments_: readonly string[]): string {
  const options = arguments_.filter((argument) => argument !== '--');
  const output = options[1];
  if (
    options.length !== 2 ||
    options[0] !== '--output' ||
    output === undefined ||
    output.startsWith('--')
  ) {
    throw new SiteComposerError(
      'WG_SITE_INVOCATION',
      'site:compose requires exactly one --output value.',
    );
  }
  return output;
}

export async function main(arguments_: readonly string[]): Promise<void> {
  if (arguments_.length === 0 || arguments_.includes('--help') || arguments_.includes('-h')) {
    console.log(usage);
    return;
  }
  const output = parseComposeArguments(arguments_);
  const result = await composeSite({ repositoryRoot: process.cwd(), output });
  console.log(
    `Composed site ${result.manifest.bundleSha256}; manifest ${result.manifestSha256}; output ${result.output}.`,
  );
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    const composerError = error instanceof SiteComposerError;
    console.error(
      composerError ? error.message : 'WG_SITE_INTERNAL: Unexpected site-composer failure.',
    );
    process.exitCode = composerError && error.code === 'WG_SITE_INVOCATION' ? 2 : 1;
  });
}
