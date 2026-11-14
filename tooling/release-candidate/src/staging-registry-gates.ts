import { candidatePackageNames } from './constants.ts';
import { fail } from './error.ts';

const origin = 'https://registry.npmjs.org';
// Bound the evidence reads; a larger or paginated response is not evidence of absence.
const maxBytes = 2 * 1024 * 1024;

function reject(): never {
  return fail(
    'WG_STAGE_REGISTRY',
    'Registry evidence is unavailable, incomplete, or indicates a collision.',
  );
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return reject();
  return value as Record<string, unknown>;
}

/** Unwired read-only probe. Visibility and identity are observations, not creation authority. */
export async function probeInitialRegistryCollision(input: {
  packageName: string;
  expectedUsername: string;
  readToken: string;
  request?: typeof fetch;
}) {
  try {
    const { packageName, expectedUsername, readToken } = input;
    if (
      !candidatePackageNames.some((name) => name === packageName) ||
      !/^[a-z0-9][a-z0-9_-]{0,213}$/.test(expectedUsername) ||
      !/^npm_[A-Za-z0-9]+$/.test(readToken)
    )
      return reject();
    const request = input.request ?? fetch;
    const signal = AbortSignal.timeout(15_000);
    const observedAt = new Date().toISOString();
    async function read(path: string, authenticated: boolean, expectedStatus: number) {
      const response = await request(origin + path, {
        method: 'GET',
        redirect: 'error',
        signal,
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
          ...(authenticated ? { Authorization: `Bearer ${readToken}` } : {}),
        },
      });
      if (response.status !== expectedStatus || !response.body || response.headers.has('link')) {
        await response.body?.cancel();
        return reject();
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > maxBytes) {
            await reader.cancel();
            return reject();
          }
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      return record(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    }
    const who = await read('/-/whoami', true, 200);
    if (who.username !== expectedUsername) return reject();
    const encoded = encodeURIComponent(packageName);
    const stage = await read(`/-/stage?package=${encoded}&page=0&perPage=100`, true, 200);
    if (stage.total !== 0 || !Array.isArray(stage.items) || stage.items.length !== 0)
      return reject();
    for (const authenticated of [false, true]) {
      const missing = await read(`/${encoded}`, authenticated, 404);
      if (missing.error !== 'Not found' || Object.keys(missing).length !== 1) return reject();
    }
    return Object.freeze({
      packageName,
      observedAt,
      username: expectedUsername,
      publicPackument: 'not-visible',
      authenticatedPackument: 'not-visible',
      visibleStageCount: 0,
      authoritativeAbsenceVerified: false,
      packageCreationAllowed: false,
    } as const);
  } catch {
    return reject();
  }
}
