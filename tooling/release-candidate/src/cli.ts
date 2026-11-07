import { pathToFileURL } from 'node:url';

import { buildCandidate, checkCandidateSource } from './assembler.ts';
import { assertSupportedNode, offlineEnvironment } from './environment.ts';
import { readEvidence, verifyEvidenceFiles } from './evidence.ts';
import { ReleaseCandidateError } from './error.ts';
import { runCommand } from './process.ts';
import { probeReactConsumers } from './react-probe.ts';
import { probeVanillaConsumers } from './vanilla-probe.ts';

const usage = `Usage:
  pnpm release-candidate:verify-publication-consumers -- --evidence <absolute-consumer-proof-path>
  pnpm release-candidate:probe-publication -- --evidence <absolute-path> --store <existing-absolute-directory> --output <new-absolute-temporary-directory>
  pnpm release-candidate:build-publication -- --source <accepted-full-sha> --output <new-absolute-temporary-directory>
  pnpm release-candidate:verify-publication -- --evidence <absolute-path>
  pnpm release-candidate:publication-plan -- --source <accepted-full-sha> --output <new-absolute-temporary-directory>
  pnpm release-candidate:provision-consumers -- --store <existing-absolute-directory> --output <new-absolute-temporary-directory>
  pnpm release-candidate:check -- --source <full-sha>
  pnpm release-candidate:build -- --source <full-sha> --output <absolute-new-directory>
  pnpm release-candidate:capture-advisory -- --source <full-sha> --output <absolute-new-file>
  pnpm release-candidate:integrated -- --source <full-sha> --output <absolute-new-directory> --advisory-snapshot <approved-absolute-file>
  pnpm release-candidate:rehearse -- --source <full-sha>
  pnpm release-candidate:verify -- --evidence <absolute-path>
  pnpm release-candidate:verify-integrated -- --bundle <absolute-path>
  pnpm release-candidate:probe:browsers -- --evidence <absolute-path> --store <absolute-path>
  pnpm release-candidate:probe:react -- --evidence <absolute-path> --store <absolute-path>
  pnpm release-candidate:probe:vanilla -- --evidence <absolute-path> --store <absolute-path>`;

function option(arguments_: readonly string[], name: string): string | undefined {
  const index = arguments_.indexOf(name);
  if (index === -1) return undefined;
  const value = arguments_[index + 1];
  return value !== undefined && !value.startsWith('--') ? value : undefined;
}

function invalid(message: string): never {
  throw new ReleaseCandidateError('WG_RC_INVOCATION', message);
}

export async function main(arguments_: readonly string[]): Promise<void> {
  const [command, ...rawOptions] = arguments_;
  const options = rawOptions.filter((argument) => argument !== '--');
  if (command === undefined || command === '--help' || command === '-h') {
    console.log(usage);
    return;
  }
  assertSupportedNode(process.version);
  const environment = offlineEnvironment(process.env);
  if (command === 'verify-publication-consumers') {
    const path =
      option(options, '--evidence') ?? invalid('verify-publication-consumers requires --evidence.');
    if (options.length !== 2) invalid('verify-publication-consumers accepts only --evidence.');
    const { verifyPublicationConsumerProof } = await import('./publication-proof.ts');
    const result = await verifyPublicationConsumerProof(
      process.cwd(),
      path,
      runCommand,
      process.env,
    );
    console.log(
      `Verified public consumer proof ${result.proofSha256}; candidate evidence ${result.candidateEvidenceSha256}. No publication authorized.`,
    );
    return;
  }
  if (command === 'probe-publication') {
    const evidence =
      option(options, '--evidence') ?? invalid('probe-publication requires --evidence.');
    const store = option(options, '--store') ?? invalid('probe-publication requires --store.');
    const output = option(options, '--output') ?? invalid('probe-publication requires --output.');
    if (options.length !== 6)
      invalid('probe-publication accepts only --evidence, --store, and --output.');
    const { provePublicationConsumers } = await import('./publication-consumers.ts');
    const path = await provePublicationConsumers(
      process.cwd(),
      evidence,
      store,
      output,
      runCommand,
      process.env,
    );
    console.log(
      `Passed six public-review consumers and 36 browser cases; retained graphs and proof: ${path}`,
    );
    return;
  }
  if (command === 'build-publication') {
    const source = option(options, '--source') ?? invalid('build-publication requires --source.');
    const output = option(options, '--output') ?? invalid('build-publication requires --output.');
    if (options.length !== 4) invalid('build-publication accepts only --source and --output.');
    const { buildPublicationArtifacts } = await import('./assembler.ts');
    const evidence = await buildPublicationArtifacts(
      process.cwd(),
      source,
      output,
      runCommand,
      process.env,
    );
    console.log(
      `Built six reproducible public-review tarballs; no publication authorized: ${evidence}`,
    );
    return;
  }
  if (command === 'verify-publication') {
    const path =
      option(options, '--evidence') ?? invalid('verify-publication requires --evidence.');
    if (options.length !== 2) invalid('verify-publication accepts only --evidence.');
    const { verifyPublicationArtifacts } = await import('./publication-artifacts.ts');
    await verifyPublicationArtifacts(process.cwd(), path, runCommand, process.env);
    console.log(`Verified public-review tarball hashes and frozen manifest projections: ${path}`);
    return;
  }
  if (command === 'check') {
    const source = option(options, '--source') ?? invalid('check requires --source.');
    if (options.length !== 2) invalid('check accepts only --source.');
    await checkCandidateSource(process.cwd(), source, runCommand);
    console.log(`Validated frozen candidate source ${source}.`);
    return;
  }
  if (command === 'publication-plan') {
    const source = option(options, '--source') ?? invalid('publication-plan requires --source.');
    const output = option(options, '--output') ?? invalid('publication-plan requires --output.');
    if (options.length !== 4) invalid('publication-plan accepts only --source and --output.');
    const { preparePublicationPlan } = await import('./publication-plan.ts');
    await preparePublicationPlan(process.cwd(), source, output, runCommand, process.env);
    console.log(
      `Prepared six public manifest projections for review only: ${output}. No publication authorized.`,
    );
    return;
  }
  if (command === 'provision-consumers') {
    const store = option(options, '--store') ?? invalid('provision-consumers requires --store.');
    const output = option(options, '--output') ?? invalid('provision-consumers requires --output.');
    if (options.length !== 4) invalid('provision-consumers accepts only --store and --output.');
    const { provisionConsumerMaterial } = await import('./material-provision.ts');
    await provisionConsumerMaterial(process.cwd(), store, output, runCommand, process.env);
    console.log(`Provisioned six external consumer dependency scenarios; lockfiles: ${output}.`);
    return;
  }
  if (command === 'build') {
    const source = option(options, '--source') ?? invalid('build requires --source.');
    const output = option(options, '--output') ?? invalid('build requires --output.');
    if (options.length !== 4) invalid('build accepts only --source and --output.');
    const evidence = await buildCandidate(process.cwd(), source, output, runCommand, environment);
    console.log(`Built reproducible private candidates; evidence: ${evidence}`);
    return;
  }
  if (command === 'capture-advisory') {
    const source = option(options, '--source') ?? invalid('capture-advisory requires --source.');
    const output = option(options, '--output') ?? invalid('capture-advisory requires --output.');
    if (options.length !== 4) invalid('capture-advisory accepts only --source and --output.');
    const { captureAdvisorySnapshot } = await import('./advisory-capture.ts');
    const result = await captureAdvisorySnapshot(
      process.cwd(),
      source,
      output,
      runCommand,
      process.env,
    );
    console.log(
      `Captured ${result.findingCount} advisory findings in snapshot ${result.snapshotSha256}; valid through ${result.validThrough}.`,
    );
    return;
  }
  if (command === 'verify') {
    const path = option(options, '--evidence') ?? invalid('verify requires --evidence.');
    if (options.length !== 2) invalid('verify accepts only --evidence.');
    verifyEvidenceFiles(path, readEvidence(path));
    console.log(`Verified candidate evidence ${path}.`);
    return;
  }
  if (command === 'verify-integrated') {
    const bundle = option(options, '--bundle') ?? invalid('verify-integrated requires --bundle.');
    if (options.length !== 2) invalid('verify-integrated accepts only --bundle.');
    const { verifyIntegratedBundle } = await import('./retained-orchestrator.ts');
    const result = verifyIntegratedBundle(bundle);
    console.log(
      `Verified integrated evidence ${result.evidenceSha256} with bundle inventory ${result.bundleInventorySha256}.`,
    );
    return;
  }
  if (command === 'integrated') {
    const source = option(options, '--source') ?? invalid('integrated requires --source.');
    const output = option(options, '--output') ?? invalid('integrated requires --output.');
    const advisory =
      option(options, '--advisory-snapshot') ?? invalid('integrated requires --advisory-snapshot.');
    if (options.length !== 6) {
      invalid('integrated accepts only --source, --output, and --advisory-snapshot.');
    }
    const { runRetainedCandidate } = await import('./retained-orchestrator.ts');
    const result = await runRetainedCandidate(
      process.cwd(),
      source,
      output,
      advisory,
      runCommand,
      process.env,
    );
    console.log(
      `Retained integrated evidence ${result.evidenceSha256} with bundle inventory ${result.bundleInventorySha256}.`,
    );
    return;
  }
  if (command === 'rehearse') {
    const source = option(options, '--source') ?? invalid('rehearse requires --source.');
    if (options.length !== 2) invalid('rehearse accepts only --source.');
    const { runIntegratedRehearsal } = await import('./rehearsal.ts');
    const result = await runIntegratedRehearsal(process.cwd(), source, runCommand, process.env);
    console.log(
      `Passed ephemeral rehearsal: ${result.packages} packages, ${result.vanillaScenarios} Vanilla scenarios, ${result.reactScenarios} React scenarios, and ${result.browserCases} browser cases.`,
    );
    return;
  }
  if (command === 'probe-vanilla') {
    const evidence = option(options, '--evidence') ?? invalid('probe-vanilla requires --evidence.');
    const store = option(options, '--store') ?? invalid('probe-vanilla requires --store.');
    if (options.length !== 4) invalid('probe-vanilla accepts only --evidence and --store.');
    const results = await probeVanillaConsumers({
      evidencePath: evidence,
      storePath: store,
      runner: runCommand,
      environment,
    });
    console.log(`Passed ${results.length} ephemeral Vanilla consumer probes.`);
    return;
  }
  if (command === 'probe-react') {
    const evidence = option(options, '--evidence') ?? invalid('probe-react requires --evidence.');
    const store = option(options, '--store') ?? invalid('probe-react requires --store.');
    if (options.length !== 4) invalid('probe-react accepts only --evidence and --store.');
    const results = await probeReactConsumers({
      evidencePath: evidence,
      storePath: store,
      runner: runCommand,
      environment,
    });
    console.log(`Passed ${results.length} ephemeral React consumer probes.`);
    return;
  }
  if (command === 'probe-browsers') {
    const evidence =
      option(options, '--evidence') ?? invalid('probe-browsers requires --evidence.');
    const store = option(options, '--store') ?? invalid('probe-browsers requires --store.');
    if (options.length !== 4) invalid('probe-browsers accepts only --evidence and --store.');
    const { probeBrowserConsumers } = await import('./browser-probe.ts');
    const results = await probeBrowserConsumers({
      evidencePath: evidence,
      storePath: store,
      runner: runCommand,
      environment,
    });
    console.log(`Passed ${results.length} ephemeral cross-browser consumer probes.`);
    return;
  }
  invalid(`Unknown command ${command}.`);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    const candidateError = error instanceof ReleaseCandidateError;
    console.error(
      candidateError ? error.message : 'WG_RC_INTERNAL: Unexpected release-candidate failure.',
    );
    const invalidCodes = new Set([
      'WG_RC_INVOCATION',
      'WG_RC_CREDENTIAL_EXPOSURE',
      'WG_RC_OUTPUT_ABSOLUTE',
      'WG_RC_OUTPUT_EXISTS',
      'WG_RC_OUTPUT_PARENT',
      'WG_RC_OUTPUT_TEMP',
      'WG_RC_OUTPUT_REPOSITORY',
      'WG_RC_COMMAND_START',
      'WG_RC_OFFLINE_MATERIAL',
      'WG_RC_CONSUMER_OFFLINE_MATERIAL',
      'WG_RC_CONSUMER_STORE',
      'WG_RC_BROWSER_UNAVAILABLE',
      'WG_RC_ADVISORY_PATH',
      'WG_RC_ADVISORY_SCHEMA',
      'WG_RC_ADVISORY_CANONICAL',
      'WG_RC_ADVISORY_OUTPUT',
      'WG_RC_INTEGRATED_PATH',
      'WG_RC_PACKAGE_MANAGER_EXECUTABLE',
      'WG_RC_UNSUPPORTED_NODE',
    ]);
    process.exitCode = candidateError && invalidCodes.has(error.code) ? 2 : 1;
  });
}
