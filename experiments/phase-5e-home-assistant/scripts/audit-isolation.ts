import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { argv } from 'node:process';

import { runIsolationAudit } from '../src/isolation.ts';

function optionalArgument(name: string): string | undefined {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
}

const revision = optionalArgument('--revision') ?? 'working-tree';
const output = optionalArgument('--output');
const repositoryRoot = resolve(import.meta.dirname, '../../..');
const record = runIsolationAudit(repositoryRoot, revision);

if (output !== undefined) {
  const outputPath = resolve(output);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
}
process.stdout.write(`${JSON.stringify(record)}\n`);
if (!record.pass) process.exitCode = 1;
