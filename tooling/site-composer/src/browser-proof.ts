import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { buildSite } from './build.ts';
import { SiteComposerError } from './error.ts';
import { startSiteServer } from './server.ts';

function outputArgument(arguments_: readonly string[]): string {
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
      'site:browser-proof requires exactly one --output value.',
    );
  }
  return output;
}

function runChromium(origin: string): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      'pnpm',
      ['exec', 'playwright', 'test', '--config', 'playwright.site-delivery.config.ts'],
      {
        cwd: process.cwd(),
        env: { ...process.env, WAYGLASS_SITE_ORIGIN: origin },
        stdio: 'inherit',
      },
    );
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolvePromise();
      else
        reject(
          new SiteComposerError(
            'WG_SITE_BROWSER_PROOF',
            `Chromium proof failed with ${signal === null ? `exit ${code}` : `signal ${signal}`}.`,
          ),
        );
    });
  });
}

export async function runSiteBrowserProof(output: string): Promise<void> {
  const site = await buildSite({ repositoryRoot: process.cwd(), output });
  const server = await startSiteServer({ input: site.input });
  try {
    await runChromium(server.origin);
    console.log(
      `Proved site ${site.manifest.bundleSha256} in Chromium at local origin ${server.origin}.`,
    );
  } finally {
    await server.close();
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSiteBrowserProof(outputArgument(process.argv.slice(2))).catch((error: unknown) => {
    console.error(
      error instanceof SiteComposerError
        ? error.message
        : 'WG_SITE_BROWSER_PROOF: Unexpected browser-proof failure.',
    );
    process.exitCode =
      error instanceof SiteComposerError && error.code === 'WG_SITE_INVOCATION' ? 2 : 1;
  });
}
