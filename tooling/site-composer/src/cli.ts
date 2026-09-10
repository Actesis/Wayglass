import { pathToFileURL } from 'node:url';

import { buildSite } from './build.ts';
import { composeSite } from './compose.ts';
import { SiteComposerError } from './error.ts';
import { verifySite } from './verify.ts';

const usage = `Usage:
  pnpm site:compose -- --output <absolute-new-temporary-directory>
  pnpm site:verify -- --input <absolute-temporary-directory>
  pnpm site:check-responses -- --input <absolute-temporary-directory>
  pnpm site:build -- --output <absolute-new-temporary-directory>`;

type SiteCommand = 'build' | 'check-responses' | 'compose' | 'verify';

function parseSinglePathOption(
  arguments_: readonly string[],
  command: SiteCommand,
  option: '--input' | '--output',
): string {
  const options = arguments_.filter((argument) => argument !== '--');
  const value = options[1];
  if (
    options.length !== 2 ||
    options[0] !== option ||
    value === undefined ||
    value.startsWith('--')
  ) {
    throw new SiteComposerError(
      'WG_SITE_INVOCATION',
      `site:${command} requires exactly one ${option} value.`,
    );
  }
  return value;
}

export function parseComposeArguments(arguments_: readonly string[]): string {
  return parseSinglePathOption(arguments_, 'compose', '--output');
}

export function parseVerifyArguments(arguments_: readonly string[]): string {
  return parseSinglePathOption(arguments_, 'verify', '--input');
}

export function parseCheckResponsesArguments(arguments_: readonly string[]): string {
  return parseSinglePathOption(arguments_, 'check-responses', '--input');
}

export function parseBuildArguments(arguments_: readonly string[]): string {
  return parseSinglePathOption(arguments_, 'build', '--output');
}

function commandArguments(arguments_: readonly string[]): {
  readonly command: SiteCommand;
  readonly options: readonly string[];
} {
  const command = arguments_[0];
  if (
    command !== 'build' &&
    command !== 'check-responses' &&
    command !== 'compose' &&
    command !== 'verify'
  ) {
    throw new SiteComposerError(
      'WG_SITE_INVOCATION',
      'The site command must be build, check-responses, compose, or verify.',
    );
  }
  return { command, options: arguments_.slice(1) };
}

export async function main(arguments_: readonly string[]): Promise<void> {
  if (arguments_.length === 0 || arguments_.includes('--help') || arguments_.includes('-h')) {
    console.log(usage);
    return;
  }
  const invocation = commandArguments(arguments_);
  if (invocation.command === 'check-responses') {
    const { checkSiteResponses } = await import('./response.ts');
    const input = parseCheckResponsesArguments(invocation.options);
    const result = checkSiteResponses(input);
    console.log(
      `Checked site responses ${result.site.manifest.bundleSha256}; input ${result.site.input}.`,
    );
    return;
  }
  if (invocation.command === 'verify') {
    const input = parseVerifyArguments(invocation.options);
    const result = verifySite(input);
    console.log(
      `Verified site ${result.manifest.bundleSha256}; manifest ${result.manifestSha256}; input ${result.input}.`,
    );
    return;
  }
  const output =
    invocation.command === 'build'
      ? parseBuildArguments(invocation.options)
      : parseComposeArguments(invocation.options);
  const result =
    invocation.command === 'build'
      ? await buildSite({ repositoryRoot: process.cwd(), output })
      : await composeSite({ repositoryRoot: process.cwd(), output });
  const verb = invocation.command === 'build' ? 'Built and verified' : 'Composed';
  console.log(
    `${verb} site ${result.manifest.bundleSha256}; manifest ${result.manifestSha256}; output ${output}.`,
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
