import { fail } from './error.ts';
import { sha256 } from './hash.ts';

/** Compare bytes before extraction. The caller must obtain metadata from GitHub REST and
 * the expected ID/digest from the successful build job's outputs, not from the ZIP. */
export function verifySigningArtifactHandoff(input: {
  readonly expected: {
    readonly id: number;
    readonly sha256: string;
    readonly runId: number;
    readonly attempt: number;
    readonly commit: string;
  };
  readonly metadata: unknown;
  readonly bytes: Uint8Array;
}): Buffer {
  const { expected, metadata } = input;
  const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
  const invalid = () =>
    fail('WG_SIGNING_HANDOFF', 'Build artifact identity or downloaded bytes do not match.');
  if (
    !positive(expected.id) ||
    !positive(expected.runId) ||
    !positive(expected.attempt) ||
    !/^[a-f0-9]{64}$/.test(expected.sha256) ||
    !/^[a-f0-9]{40}$/.test(expected.commit) ||
    !metadata ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  )
    return invalid();
  const artifact = metadata as Record<string, unknown>;
  if (
    !artifact.workflow_run ||
    typeof artifact.workflow_run !== 'object' ||
    Array.isArray(artifact.workflow_run)
  )
    return invalid();
  const run = artifact.workflow_run as Record<string, unknown>;
  if (
    artifact.id !== expected.id ||
    artifact.name !== `signing-inputs-${expected.runId}-${expected.attempt}` ||
    artifact.expired !== false ||
    artifact.digest !== `sha256:${expected.sha256}` ||
    run.id !== expected.runId ||
    run.repository_id !== 1314007333 ||
    run.head_repository_id !== 1314007333 ||
    run.head_branch !== 'main' ||
    run.head_sha !== expected.commit ||
    input.bytes.byteLength === 0 ||
    input.bytes.byteLength > 2 * 1024 * 1024 ||
    artifact.size_in_bytes !== input.bytes.byteLength
  )
    return invalid();
  const bytes = Buffer.from(input.bytes);
  if (sha256(bytes) !== expected.sha256) return invalid();
  return bytes;
}
