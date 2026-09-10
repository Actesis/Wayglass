export const CANONICAL_ORIGIN = 'https://wayglass.hoagsoftworks.com';

export function canonicalRoute(relativePath: string): string | undefined {
  if (relativePath === '404.md') return undefined;

  const markdownPath = relativePath.replace(/\.md$/, '');
  if (markdownPath === 'index') return '/';
  if (markdownPath.endsWith('/index')) return `/${markdownPath.slice(0, -5)}`;
  return `/${markdownPath}`;
}

export function canonicalUrl(relativePath: string): string | undefined {
  const route = canonicalRoute(relativePath);
  return route === undefined ? undefined : `${CANONICAL_ORIGIN}${route}`;
}
