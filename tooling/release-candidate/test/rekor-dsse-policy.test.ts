import { X509Certificate } from 'node:crypto';
import { getCACertificates } from 'node:tls';
import { expect, it, vi } from 'vitest';

import { prepareRekorDsseRequest, verifyRekorDsseBundle } from '../src/rekor-dsse-policy.ts';
import {
  normalizeRekorDsseReceipt,
  submitAndVerifyRekorDsse,
} from '../src/rekor-dsse-transport.ts';

const [pem, otherPem] = getCACertificates('bundled');
const leaf = new X509Certificate(pem!).raw;
const envelope = {
  payloadType: 'application/vnd.in-toto+json',
  payload: Buffer.from('synthetic payload').toString('base64'),
  signatures: [{ keyid: '', sig: 'AQ==' }],
};
const loggedBody = (certificate: string) =>
  Buffer.from(
    JSON.stringify({
      kind: 'dsse',
      apiVersion: '0.0.1',
      spec: { signatures: [{ verifier: Buffer.from(certificate).toString('base64') }] },
    }),
  ).toString('base64');

const entryId = 'a'.repeat(80);
const rawEntry = {
  body: loggedBody(pem!),
  logID: 'ab'.repeat(32),
  logIndex: 500,
  integratedTime: 1770000000,
  verification: {
    signedEntryTimestamp: 'AQ==',
    inclusionProof: {
      logIndex: 1,
      treeSize: 2,
      rootHash: 'ab'.repeat(32),
      hashes: ['cd'.repeat(32)],
      checkpoint: 'synthetic checkpoint',
    },
  },
};
const receipt = { [entryId]: rawEntry };

it('normalizes separate global and shard indices without accepting ambiguous receipts', () => {
  const result = normalizeRekorDsseReceipt(Buffer.from(JSON.stringify(receipt)), envelope, leaf);
  expect(result.receiptEntryId).toBe(entryId);
  expect(JSON.parse(result.bytes.toString()).verificationMaterial.tlogEntries[0]).toMatchObject({
    logIndex: '500',
    logId: { keyId: Buffer.from(rawEntry.logID, 'hex').toString('base64') },
    inclusionProof: { logIndex: '1', treeSize: '2' },
  });
  for (const raw of [
    { ...receipt, ['b'.repeat(64)]: rawEntry },
    { [entryId]: { ...rawEntry, verification: {} } },
    { [entryId]: { ...rawEntry, logIndex: Number.MAX_SAFE_INTEGER + 1 } },
  ])
    expect(() =>
      normalizeRekorDsseReceipt(Buffer.from(JSON.stringify(raw)), envelope, leaf),
    ).toThrow(/WG_REKOR_RECEIPT/);
});

it('makes one fixed POST and returns only after bundle verification', async () => {
  const expected = {} as Parameters<typeof verifyRekorDsseBundle>[0];
  const verify = vi.fn<Parameters<typeof verifyRekorDsseBundle>[4]>().mockResolvedValue();
  const transport = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json(receipt, { status: 201 }));
  const result = await submitAndVerifyRekorDsse(expected, envelope, leaf, verify, transport);
  expect(verify).toHaveBeenCalledWith(expected, result.bytes);
  expect(transport).toHaveBeenCalledExactlyOnceWith(
    'https://rekor.sigstore.dev/api/v1/log/entries',
    expect.objectContaining({
      method: 'POST',
      redirect: 'error',
      body: JSON.stringify(prepareRekorDsseRequest(envelope, leaf)),
    }),
  );
});

it.each([409, 503, 201])(
  'does not retry or accept an unverified response (HTTP %s)',
  async (status) => {
    const expected = {} as Parameters<typeof verifyRekorDsseBundle>[0];
    const verify = vi
      .fn<Parameters<typeof verifyRekorDsseBundle>[4]>()
      .mockRejectedValue(new Error());
    const transport = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(receipt, { status }));
    await expect(
      submitAndVerifyRekorDsse(expected, envelope, leaf, verify, transport),
    ).rejects.toThrow(/WG_REKOR_SUBMISSION/);
    expect(transport).toHaveBeenCalledTimes(1);
  },
);

const bundleBytes = (
  options: { certificate?: string; submitted?: typeof envelope; checkpoint?: string } = {},
) =>
  Buffer.from(
    JSON.stringify({
      mediaType: 'application/vnd.dev.sigstore.bundle.v0.3+json',
      dsseEnvelope: options.submitted ?? envelope,
      verificationMaterial: {
        certificate: { rawBytes: leaf.toString('base64') },
        tlogEntries: [
          {
            kindVersion: { kind: 'dsse', version: '0.0.1' },
            canonicalizedBody: loggedBody(options.certificate ?? pem!),
            inclusionProof: { checkpoint: { envelope: options.checkpoint ?? 'synthetic' } },
          },
        ],
      },
    }),
  );

it('formats a v1 DSSE proposal containing exactly the envelope and PEM verifier', () => {
  expect(prepareRekorDsseRequest(envelope, leaf)).toEqual({
    kind: 'dsse',
    apiVersion: '0.0.1',
    spec: {
      proposedContent: {
        envelope: JSON.stringify(envelope),
        verifiers: [Buffer.from(new X509Certificate(leaf).toString()).toString('base64')],
      },
    },
  });
});

it('requires the exact envelope, logged leaf, checkpoint and cryptographic verification', async () => {
  const verify = vi.fn<Parameters<typeof verifyRekorDsseBundle>[4]>().mockResolvedValue();
  const expected = {} as Parameters<typeof verifyRekorDsseBundle>[0];
  const exact = bundleBytes();
  await verifyRekorDsseBundle(expected, envelope, leaf, exact, verify);
  expect(verify).toHaveBeenCalledWith(expected, exact);
  for (const bytes of [
    bundleBytes({ certificate: otherPem! }),
    bundleBytes({ checkpoint: '' }),
    bundleBytes({ submitted: { ...envelope, signatures: [{ keyid: '', sig: 'Ag==' }] } }),
  ]) {
    await expect(verifyRekorDsseBundle(expected, envelope, leaf, bytes, verify)).rejects.toThrow(
      /WG_REKOR_DSSE/,
    );
  }
  expect(verify).toHaveBeenCalledTimes(1);
  verify.mockRejectedValueOnce(new Error('bad inclusion proof'));
  await expect(verifyRekorDsseBundle(expected, envelope, leaf, exact, verify)).rejects.toThrow(
    /WG_REKOR_DSSE/,
  );
});
