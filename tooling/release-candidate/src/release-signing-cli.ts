import { generateKeyPairSync } from 'node:crypto';
import { lstatSync, readdirSync, writeFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

import { assertNoReleaseCredentials } from './environment.ts';
import { issueProbeLeaf, loadProbeCertificateVerifier } from './fulcio-certificate-probe.ts';
import { claimResults, expectedProbeCertificate, requestProbeToken } from './oidc-claim-probe.ts';
import { signAndVerifyReleaseBatch } from './signing-batch.ts';
import { loadPinnedBundleVerifier } from './signing-bundle-verifier.ts';
import { readCurrentSigningHandoff } from './signing-handoff-cli.ts';
import { prepareSigningInputs } from './signing-inputs.ts';
import { prepareUnsignedStatements } from './signing-statement.ts';

export function assertSigningDispatch(env: NodeJS.ProcessEnv) {
  assertNoReleaseCredentials(env);
  const expected = expectedProbeCertificate(env);
  if (env.SIGNING_COMMIT !== expected.commit || env.GITHUB_RUN_ATTEMPT !== '1')
    throw new Error('Expected the exact approved signing commit and first run attempt.');
  return expected;
}

async function main() {
  const { GH_TOKEN, ...environment } = process.env;
  const policy = assertSigningDispatch(environment);
  const [npmRoot, output] = process.argv.slice(2);
  if (process.argv.length !== 4 || !npmRoot || !output || !isAbsolute(output))
    throw new Error('Expected pinned tooling and an isolated output directory.');
  if (!lstatSync(output).isDirectory() || readdirSync(output).length !== 0)
    throw new Error('Expected an empty output directory.');
  const input = readCurrentSigningHandoff(
    environment.ARTIFACT_ID,
    environment.ARTIFACT_DIGEST,
    GH_TOKEN,
    environment,
  );
  const prepared = prepareSigningInputs(input);
  const statements = prepareUnsignedStatements(prepared);
  if (
    statements.some(
      ({ certificatePolicy }) =>
        certificatePolicy.identity !== policy.identity ||
        certificatePolicy.issuer !== policy.issuer ||
        certificatePolicy.commit !== policy.commit ||
        certificatePolicy.invocationId !== policy.invocationId,
    )
  )
    throw new Error('Handoff and signer policy differ.');
  const verifyCertificate = await loadProbeCertificateVerifier(npmRoot);
  const verifyBundle = loadPinnedBundleVerifier(npmRoot);
  const token = await requestProbeToken(environment);
  if (claimResults(token, environment).some(({ matches }) => !matches))
    throw new Error('GitHub claim verification failed.');
  const keys = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  console.log('Fulcio request: STARTED');
  const { certificate } = await issueProbeLeaf(token, fetch, keys);
  const bundles = await signAndVerifyReleaseBatch({
    input,
    leaf: certificate,
    privateKey: keys.privateKey,
    verifyCertificate,
    verifyBundle,
    report: ({ file, status }) => console.log(`${file}: ${status}`),
  });
  const manifest = bundles.map(({ file, bundle, sha256 }) => {
    const filename = `${file}.sigstore.json`;
    writeFileSync(join(output, filename), bundle, { flag: 'wx', mode: 0o600 });
    return { packageFile: file, bundleFile: filename, sha256 };
  });
  writeFileSync(
    join(output, 'manifest.json'),
    JSON.stringify({
      schemaVersion: 1,
      commit: policy.commit,
      invocationId: policy.invocationId,
      sourceCommit: prepared.source.commit,
      publicationAuthorized: false,
      bundles: manifest,
    }) + '\n',
    { flag: 'wx', mode: 0o600 },
  );
}

if (import.meta.main) {
  try {
    await main();
  } catch {
    console.error(
      'Signing workflow failed. If any request started, reconcile it before considering another authorization.',
    );
    process.exitCode = 1;
  }
}
