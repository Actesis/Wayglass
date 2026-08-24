import { fileURLToPath } from 'node:url';

import { createWayglassTokenGraph } from './source.ts';
import { createLegacyTokenJson, createWebThemeCss, createWebTokenCss } from './web.ts';
import { currentWebPolicy } from './web-policy.ts';
import { writeWebArtifacts, type WriteWebArtifactsResult } from './web-writer.ts';

const webArtifactPaths = {
  themes: fileURLToPath(new URL('../../../packages/themes/dist/themes.css', import.meta.url)),
  tokenCss: fileURLToPath(new URL('../../../packages/tokens/dist/tokens.css', import.meta.url)),
  tokenJson: fileURLToPath(new URL('../../../packages/tokens/dist/tokens.json', import.meta.url)),
} as const;

export async function generateWebArtifacts(): Promise<WriteWebArtifactsResult> {
  const graph = createWayglassTokenGraph();
  return writeWebArtifacts([
    { path: webArtifactPaths.tokenCss, content: createWebTokenCss(graph) },
    { path: webArtifactPaths.tokenJson, content: createLegacyTokenJson(graph) },
    { path: webArtifactPaths.themes, content: createWebThemeCss(graph, currentWebPolicy) },
  ]);
}
