import { existsSync, rmSync } from 'node:fs';

import { composeSite } from './compose.ts';
import { fail, SiteComposerError } from './error.ts';
import { validateNewSiteOutputPath } from './path-safety.ts';
import { runLocalCommand, validateSiteRepository } from './repository.ts';
import type { LocalCommand } from './repository.ts';
import type { VerifiedSiteResult } from './types.ts';
import { verifySite } from './verify.ts';

export interface BuildSiteOptions {
  readonly repositoryRoot: string;
  readonly output: string;
  readonly command?: LocalCommand;
  readonly verify?: (input: string) => VerifiedSiteResult;
}

export async function buildSite(options: BuildSiteOptions): Promise<VerifiedSiteResult> {
  const command = options.command ?? runLocalCommand;
  const repository = validateSiteRepository(options.repositoryRoot, command);
  validateNewSiteOutputPath(options.output, repository.root);
  let ownedOutput: string | undefined;
  try {
    command('pnpm', ['--filter', '@wayglass/docs', 'build'], repository.root);
    command('pnpm', ['--filter', '@wayglass/storybook', 'build'], repository.root);
    const composed = await composeSite({
      repositoryRoot: repository.root,
      output: options.output,
      command,
    });
    ownedOutput = composed.output;
    const verified = (options.verify ?? verifySite)(ownedOutput);
    if (verified.manifest.bundleSha256 !== composed.manifest.bundleSha256) {
      fail('WG_SITE_BUILD_VERIFY', 'Independent verification returned a different identity.');
    }
    ownedOutput = undefined;
    return verified;
  } catch (error) {
    if (error instanceof SiteComposerError) throw error;
    throw new SiteComposerError('WG_SITE_BUILD', 'Site producer build failed.');
  } finally {
    if (ownedOutput !== undefined && existsSync(ownedOutput)) {
      rmSync(ownedOutput, { recursive: true, force: true });
    }
  }
}
