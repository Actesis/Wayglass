export const EDGE_RESPONSE_ROUTES = [
  '/',
  '/phase-6',
  '/phase-6.html?proof=edge',
  '/phase-6/?proof=edge',
  '/foundations',
  '/foundations/',
  '/foundations/index.html',
  '/storybook',
  '/storybook/',
  '/storybook/iframe?viewMode=story',
  '/storybook/iframe.html?viewMode=story',
  '/missing-wayglass-edge-proof',
  '/storybook/missing-wayglass-edge-proof.js',
  '/unknown-prefix/missing',
  '/wayglass-site-manifest.json',
] as const;

export const CONTRACT_HEADER_NAMES = [
  'cache-control',
  'content-security-policy',
  'content-type',
  'permissions-policy',
  'referrer-policy',
  'x-content-type-options',
  'x-frame-options',
  'x-robots-tag',
] as const;
