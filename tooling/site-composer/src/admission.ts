import { SITE_MANIFEST_PATH, surfaceDefinition } from './constants.ts';
import { fail } from './error.ts';
import type { SiteSurfaceId } from './types.ts';

const windowsAbsolutePath = /^[a-zA-Z]:/;
const secretSegments = new Set([
  '.dev.vars',
  '.npmrc',
  '.netrc',
  'credentials',
  'credentials.json',
  'id_dsa',
  'id_ecdsa',
  'id_ed25519',
  'id_rsa',
  'service-account.json',
]);

const credentialMarkers = [
  {
    id: 'private-key',
    expression: /-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----/,
  },
  {
    id: 'npm-token',
    expression: /\bnpm_[A-Za-z0-9]{20,}\b/,
  },
  {
    id: 'github-token',
    expression: /\bgh(?:p|o|u|s|r)_[A-Za-z0-9]{20,}\b/,
  },
  {
    id: 'cloudflare-token',
    expression: /\b(?:CLOUDFLARE_API_TOKEN|CF_API_TOKEN)\s*[:=]\s*[^\s"']{8,}/i,
  },
  {
    id: 'secret-assignment',
    expression:
      /(?:^|\n)\s*(?:API_KEY|ACCESS_TOKEN|AUTH_TOKEN|CLIENT_SECRET|PASSWORD|SECRET_KEY)\s*=\s*[^\s#]{8,}/,
  },
] as const;

function pathRule(path: string, rule: string, detail: string): never {
  fail('WG_SITE_PATH', `${rule} rejected path "${path}": ${detail}`);
}

export function normalizeRelativePath(path: string): string {
  if (path.length === 0) pathRule(path, 'empty', 'paths must not be empty');
  if (path.includes('\0')) pathRule(path, 'nul', 'NUL is forbidden');
  if (path.includes('\\')) pathRule(path, 'backslash', 'only POSIX separators are admitted');
  if (path.startsWith('/') || windowsAbsolutePath.test(path)) {
    pathRule(path, 'absolute', 'paths must be relative');
  }

  const segments = path.split('/');
  if (segments.some((segment) => segment.length === 0)) {
    pathRule(path, 'empty-segment', 'empty segments are forbidden');
  }
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    pathRule(path, 'traversal', 'dot segments are forbidden');
  }

  const normalized = path.normalize('NFC');
  if (normalized !== path) {
    pathRule(path, 'unicode-normalization', 'paths must already use Unicode NFC');
  }
  return normalized;
}

export function collisionKey(path: string): string {
  return normalizeRelativePath(path).normalize('NFC').toLowerCase();
}

export function destinationPath(surface: SiteSurfaceId, sourcePath: string): string {
  const normalized = normalizeRelativePath(sourcePath);
  const prefix = surfaceDefinition(surface).destinationPrefix;
  return prefix.length === 0 ? normalized : `${prefix}/${normalized}`;
}

export function assertAdmittedPath(surface: SiteSurfaceId, sourcePath: string): void {
  const normalized = normalizeRelativePath(sourcePath);
  const foldedSegments = normalized.split('/').map((segment) => segment.toLowerCase());
  const basename = foldedSegments.at(-1);

  if (
    surface === 'documentation' &&
    (foldedSegments[0] === 'storybook' || normalized === SITE_MANIFEST_PATH)
  ) {
    pathRule(normalized, 'reserved', 'the composer owns this root destination');
  }
  if (basename?.endsWith('.map') === true) {
    pathRule(normalized, 'source-map', 'source maps are not admitted by schema version 1');
  }
  for (const segment of foldedSegments) {
    if (
      segment === '.env' ||
      segment.startsWith('.env.') ||
      secretSegments.has(segment) ||
      segment.endsWith('.pem') ||
      segment.endsWith('.key') ||
      segment === 'wrangler.toml' ||
      segment === 'wrangler.json' ||
      segment === 'wrangler.jsonc'
    ) {
      pathRule(normalized, 'credential-name', 'credential-bearing names are forbidden');
    }
  }
}

function decodeText(bytes: Uint8Array): string | undefined {
  if (bytes.includes(0)) return undefined;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return undefined;
  }
}

export function assertNoCredentialContent(path: string, bytes: Uint8Array): void {
  const text = decodeText(bytes);
  if (text === undefined) return;
  for (const marker of credentialMarkers) {
    if (marker.expression.test(text)) {
      fail('WG_SITE_SECRET', `${marker.id} rejected path "${path}"; matched content is redacted.`);
    }
  }
}
