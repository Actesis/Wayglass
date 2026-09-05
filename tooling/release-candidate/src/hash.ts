import { createHash } from 'node:crypto';

import type { InspectedFile } from './types.ts';

const encoder = new TextEncoder();

export function sha256(bytes: Uint8Array | string): string {
  return createHash('sha256')
    .update(typeof bytes === 'string' ? encoder.encode(bytes) : bytes)
    .digest('hex');
}

export function hashFileInventory(files: readonly InspectedFile[]): string {
  const canonical = files
    .map(({ path, bytes, sha256: digest }) => `${path}\0${bytes}\0${digest}\n`)
    .join('');
  return sha256(canonical);
}
