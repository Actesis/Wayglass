import { pathToFileURL } from 'node:url';

import { buildCandidate, checkCandidateSource } from './assembler.ts';
import { assertSupportedNode, offlineEnvironment } from './environment.ts';
import { readEvidence, verifyEvidenceFiles } from './evidence.ts';
import { ReleaseCandidateError } from './error.ts';
import { runCommand } from './process.ts';
import { probeReactConsumers } from './react-probe.ts';
import { probeVanillaConsumers } from './vanilla-probe.ts';

const usage = `Usage:
  pnpm release-candidate:check -- --source <full-sha>
  pnpm release-candidate:build -- --source <full-sha> --output <absolute-new-directory>
  pnpm release-candidate:verify -- --evidence <absolute-path>
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
  if (command === 'check') {
    const source = option(options, '--source') ?? invalid('check requires --source.');
    if (options.length !== 2) invalid('check accepts only --source.');
    await checkCandidateSource(process.cwd(), source, runCommand);
    console.log(`Validated frozen candidate source ${source}.`);
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
  if (command === 'verify') {
    const path = option(options, '--evidence') ?? invalid('verify requires --evidence.');
    if (options.length !== 2) invalid('verify accepts only --evidence.');
    verifyEvidenceFiles(path, readEvidence(path));
    console.log(`Verified candidate evidence ${path}.`);
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
      'WG_RC_UNSUPPORTED_NODE',
    ]);
    process.exitCode = candidateError && invalidCodes.has(error.code) ? 2 : 1;
  });
}
