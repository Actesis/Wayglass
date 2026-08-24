import { readFile } from 'node:fs/promises';

import { tokenToolingExitCode, TokenToolingDiagnostic } from './command.ts';
import { createDtcgExchange } from './dtcg.ts';
import { verifyDtcgExchange } from './evidence.ts';
import { createWayglassTokenGraph } from './source.ts';
import { createLegacyTokenJson, createWebThemeCss, createWebTokenCss } from './web.ts';
import { currentWebPolicy } from './web-policy.ts';

const webArtifactUrls = {
  'packages/themes/dist/themes.css': new URL(
    '../../../packages/themes/dist/themes.css',
    import.meta.url,
  ),
  'packages/tokens/dist/tokens.css': new URL(
    '../../../packages/tokens/dist/tokens.css',
    import.meta.url,
  ),
  'packages/tokens/dist/tokens.json': new URL(
    '../../../packages/tokens/dist/tokens.json',
    import.meta.url,
  ),
} as const;

type WebArtifactName = keyof typeof webArtifactUrls;

export interface TokenToolingCheckOptions {
  readonly sourceRevision: string;
  readonly readWebArtifact?: (name: WebArtifactName) => string | Promise<string>;
}

export interface TokenToolingCheckSummary {
  readonly sourceRevision: string;
  readonly tokens: number;
  readonly overrides: number;
  readonly webArtifacts: number;
  readonly exchangeFiles: number;
}

async function readTrackedWebArtifact(name: WebArtifactName): Promise<string> {
  return readFile(webArtifactUrls[name], 'utf8');
}

export async function runTokenToolingCheck(
  options: TokenToolingCheckOptions,
): Promise<TokenToolingCheckSummary> {
  try {
    const graph = createWayglassTokenGraph();
    const generated = {
      'packages/themes/dist/themes.css': createWebThemeCss(graph, currentWebPolicy),
      'packages/tokens/dist/tokens.css': createWebTokenCss(graph),
      'packages/tokens/dist/tokens.json': createLegacyTokenJson(graph),
    } satisfies Record<WebArtifactName, string>;
    const readArtifact = options.readWebArtifact ?? readTrackedWebArtifact;
    for (const [name, content] of Object.entries(generated) as [WebArtifactName, string][]) {
      if ((await readArtifact(name)) !== content) {
        throw new TokenToolingDiagnostic(
          'WG-TOKEN-CHECK-001',
          `Generated web artifact "${name}" does not match the tracked artifact.`,
          tokenToolingExitCode.failure,
        );
      }
    }

    const exchange = createDtcgExchange(graph, {
      defaultTheme: currentWebPolicy.defaultTheme,
      defaultDensity: 'compact',
      sourceRevision: options.sourceRevision,
    });
    verifyDtcgExchange(exchange);

    return {
      sourceRevision: options.sourceRevision,
      tokens: graph.tokens.length,
      overrides: graph.modes.reduce((total, mode) => total + mode.overrides.length, 0),
      webArtifacts: Object.keys(generated).length,
      exchangeFiles: Object.keys(exchange.files).length,
    };
  } catch (error) {
    if (error instanceof TokenToolingDiagnostic) {
      throw error;
    }
    throw new TokenToolingDiagnostic(
      'WG-TOKEN-CHECK-002',
      'Token source, web transform, or exchange validation failed.',
      tokenToolingExitCode.failure,
      { cause: error },
    );
  }
}
