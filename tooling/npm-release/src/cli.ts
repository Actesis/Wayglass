import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  fail,
  type Manifest,
  parseVersion,
  publicManifest,
  ReleaseError,
  validateWorkspaceManifest,
} from './manifest.ts';
import { exportTargets, verifyTarball } from './tarball.ts';
import { isReleaseUnit, releaseTag, releaseUnits, type ReleaseUnit } from './units.ts';

const usage = `Usage:
  node --experimental-strip-types tooling/npm-release/src/cli.ts prepare --unit <foundation|icons|react> --version <x.y.z> --output <new-directory>
  node --experimental-strip-types tooling/npm-release/src/cli.ts verify-install --plan <directory>
  node --experimental-strip-types tooling/npm-release/src/cli.ts packages --unit <foundation|icons|react>

prepare packs an already built release unit into <new-directory> with release-plan.json and
SHA256SUMS. It changes no registry, tag, or workspace state. verify-install installs those tarballs
into a clean temporary project and checks every export target. packages lists a unit's package
names in staging order.`;

export interface PlannedPackage {
  readonly name: string;
  readonly version: string;
  readonly file: string;
  readonly sha256: string;
}

export interface ReleasePlan {
  readonly unit: ReleaseUnit;
  readonly version: string;
  readonly tag: string;
  readonly commit: string;
  readonly packages: readonly PlannedPackage[];
}

function run(command: string, args: readonly string[], cwd: string): string {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', shell: false });
  if (result.status !== 0)
    fail(
      'WG_RELEASE_COMMAND',
      `${command} ${args.join(' ')} failed in ${cwd}:\n${result.stderr || result.stdout}`,
    );
  return result.stdout;
}

function readManifest(path: string): Manifest {
  return JSON.parse(readFileSync(path, 'utf8')) as Manifest;
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function option(args: readonly string[], name: string): string {
  const index = args.indexOf(name);
  const value = index === -1 ? undefined : args[index + 1];
  if (value === undefined || value.startsWith('--'))
    fail('WG_RELEASE_USAGE', `${name} is required.`);
  return value;
}

export function prepare(
  root: string,
  unit: ReleaseUnit,
  version: string,
  output: string,
): ReleasePlan {
  parseVersion(version);
  if (existsSync(output)) fail('WG_RELEASE_OUTPUT', `${output} already exists.`);

  const packages = releaseUnits[unit].map((directory) => ({
    directory: join(root, 'packages', directory),
    manifestPath: join(root, 'packages', directory, 'package.json'),
  }));
  const manifests = packages.map(({ manifestPath }) => readManifest(manifestPath));
  const released = new Map(manifests.map((manifest) => [manifest.name, version]));
  manifests.forEach((manifest, index) =>
    validateWorkspaceManifest(
      manifest,
      { name: `@wayglass/${releaseUnits[unit][index]}`, version },
      released,
    ),
  );

  mkdirSync(output, { recursive: true });
  const planned: PlannedPackage[] = [];
  for (const [index, { directory, manifestPath }] of packages.entries()) {
    const manifest = manifests[index]!;
    const expected = publicManifest(manifest);
    const original = readFileSync(manifestPath, 'utf8');
    let packed: string;
    try {
      writeFileSync(manifestPath, `${JSON.stringify(expected, null, 2)}\n`);
      const report = JSON.parse(
        run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', output], directory),
      ) as [{ filename: string }];
      packed = report[0].filename;
    } finally {
      writeFileSync(manifestPath, original);
    }
    const file = join(output, packed);
    const entries = run('tar', ['-tzf', file], output).split('\n').filter(Boolean);
    const packedManifest: unknown = JSON.parse(
      run('tar', ['-xzOf', file, 'package/package.json'], output),
    );
    verifyTarball(entries, packedManifest, expected);
    planned.push({ name: manifest.name, version, file: packed, sha256: sha256(file) });
  }

  const plan: ReleasePlan = {
    unit,
    version,
    tag: releaseTag(unit, version),
    commit: run('git', ['rev-parse', 'HEAD'], root).trim(),
    packages: planned,
  };
  writeFileSync(join(output, 'release-plan.json'), `${JSON.stringify(plan, null, 2)}\n`);
  writeFileSync(
    join(output, 'SHA256SUMS'),
    planned.map((entry) => `${entry.sha256}  ${entry.file}\n`).join(''),
  );
  return plan;
}

export function verifyInstall(planDirectory: string): void {
  const plan = JSON.parse(
    readFileSync(join(planDirectory, 'release-plan.json'), 'utf8'),
  ) as ReleasePlan;
  for (const entry of plan.packages)
    if (sha256(join(planDirectory, entry.file)) !== entry.sha256)
      fail('WG_RELEASE_HASH', `${entry.file} does not match its planned SHA-256.`);

  const consumer = mkdtempSync(join(tmpdir(), 'wayglass-release-consumer-'));
  writeFileSync(
    join(consumer, 'package.json'),
    `${JSON.stringify({ name: 'wayglass-release-consumer', private: true, type: 'module' })}\n`,
  );
  run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      ...plan.packages.map((entry) => resolve(planDirectory, entry.file)),
    ],
    consumer,
  );
  for (const entry of plan.packages) {
    const installed = join(consumer, 'node_modules', ...entry.name.split('/'));
    const manifest = readManifest(join(installed, 'package.json'));
    if (manifest.version !== entry.version)
      fail('WG_RELEASE_INSTALL', `${entry.name} installed as ${manifest.version}.`);
    for (const target of exportTargets(manifest.exports))
      if (!existsSync(join(installed, target)))
        fail('WG_RELEASE_INSTALL', `${entry.name} is missing ${target} after install.`);
  }
}

export function main(args: readonly string[]): void {
  const [command, ...rest] = args.filter((argument) => argument !== '--');
  if (command === 'prepare') {
    const unit = option(rest, '--unit');
    if (!isReleaseUnit(unit)) fail('WG_RELEASE_USAGE', `${unit} is not a release unit.`);
    const plan = prepare(
      process.cwd(),
      unit,
      option(rest, '--version'),
      resolve(option(rest, '--output')),
    );
    for (const entry of plan.packages) console.log(`${entry.sha256}  ${entry.file}`);
    console.log(`Prepared ${plan.tag} from ${plan.commit}. No registry action was taken.`);
    return;
  }
  if (command === 'packages') {
    const unit = option(rest, '--unit');
    if (!isReleaseUnit(unit)) fail('WG_RELEASE_USAGE', `${unit} is not a release unit.`);
    for (const directory of releaseUnits[unit]) console.log(`@wayglass/${directory}`);
    return;
  }
  if (command === 'verify-install') {
    verifyInstall(resolve(option(rest, '--plan')));
    console.log('Installed every planned tarball in a clean project; all export targets exist.');
    return;
  }
  console.log(usage);
  if (command !== undefined && command !== '--help') process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    if (!(error instanceof ReleaseError)) throw error;
    console.error(`${error.code}: ${error.message}`);
    process.exitCode = 1;
  }
}
