import { createHash } from 'node:crypto';

import { createDtcgExchange } from './dtcg.ts';
import { createWayglassTokenGraph } from './source.ts';
import { currentWebPolicy } from './web-policy.ts';
import { createLegacyTokenJson, createWebThemeCss, createWebTokenCss } from './web.ts';

export interface ArtifactMeasurement {
  readonly bytes: number;
  readonly sha256: string;
}

export interface TokenToolingFingerprint {
  readonly exchange: {
    readonly files: Readonly<Record<string, ArtifactMeasurement>>;
    readonly includedTokens: number;
    readonly omittedOverrides: readonly unknown[];
    readonly omittedTokens: readonly unknown[];
    readonly status: string;
  };
  readonly graph: {
    readonly modes: number;
    readonly overrides: number;
    readonly tokens: number;
  };
  readonly sourceRevision: string;
  readonly web: Readonly<Record<string, ArtifactMeasurement>>;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function measureArtifact(content: string): ArtifactMeasurement {
  return {
    bytes: Buffer.byteLength(content, 'utf8'),
    sha256: createHash('sha256').update(content, 'utf8').digest('hex'),
  };
}

export function createTokenToolingFingerprint(sourceRevision: string): TokenToolingFingerprint {
  const graph = createWayglassTokenGraph();
  const exchange = createDtcgExchange(graph, {
    defaultTheme: currentWebPolicy.defaultTheme,
    defaultDensity: 'compact',
    sourceRevision,
  });
  const web = {
    'packages/themes/dist/themes.css': createWebThemeCss(graph, currentWebPolicy),
    'packages/tokens/dist/tokens.css': createWebTokenCss(graph),
    'packages/tokens/dist/tokens.json': createLegacyTokenJson(graph),
  };

  return {
    sourceRevision,
    graph: {
      tokens: graph.tokens.length,
      modes: graph.modes.length,
      overrides: graph.modes.reduce((total, mode) => total + mode.overrides.length, 0),
    },
    web: Object.fromEntries(
      Object.entries(web)
        .sort(([left], [right]) => compareText(left, right))
        .map(([path, content]) => [path, measureArtifact(content)]),
    ),
    exchange: {
      status: exchange.manifest.status,
      includedTokens: exchange.manifest.includedTokens,
      omittedTokens: exchange.manifest.omittedTokens,
      omittedOverrides: exchange.manifest.omittedOverrides,
      files: Object.fromEntries(
        Object.entries(exchange.files)
          .sort(([left], [right]) => compareText(left, right))
          .map(([path, content]) => [path, measureArtifact(content)]),
      ),
    },
  };
}
