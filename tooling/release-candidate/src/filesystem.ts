import { cpSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

import { packedRootFiles } from './constants.ts';
import { fail } from './error.ts';
import { inspectPackageFiles } from './inspection.ts';
import { serializeProjectedManifest } from './manifest.ts';
import type { PackageFile, PackageInspection, ProjectedManifest } from './types.ts';

function portable(path: string): string {
  return path.split(sep).join('/');
}

function collect(path: string, root: string, result: PackageFile[]): void {
  for (const name of readdirSync(path).sort()) {
    const absolute = resolve(path, name);
    const info = lstatSync(absolute);
    const packagePath = portable(relative(root, absolute));
    if (info.isSymbolicLink()) {
      result.push({ path: packagePath, bytes: new Uint8Array(), kind: 'symlink' });
    } else if (info.isDirectory()) {
      collect(absolute, root, result);
    } else if (info.isFile()) {
      result.push({ path: packagePath, bytes: readFileSync(absolute), kind: 'file' });
    } else {
      result.push({ path: packagePath, bytes: new Uint8Array(), kind: 'socket' });
    }
  }
}

export function readPackageFiles(root: string): readonly PackageFile[] {
  const result: PackageFile[] = [];
  collect(root, root, result);
  return result;
}

export function stagePackage(
  sourcePackage: string,
  stagingPackage: string,
  manifest: ProjectedManifest,
): PackageInspection {
  mkdirSync(stagingPackage, { recursive: false });
  for (const root of packedRootFiles) {
    if (root === 'package.json') continue;
    const source = resolve(sourcePackage, root);
    const info = lstatSync(source);
    if (!info.isFile()) fail('WG_RC_STAGE_ROOT', `${source} must be a regular file.`);
    cpSync(source, resolve(stagingPackage, root), { dereference: false, errorOnExist: true });
  }
  const distribution = resolve(sourcePackage, 'dist');
  if (!lstatSync(distribution).isDirectory()) {
    fail('WG_RC_STAGE_DIST', `${distribution} must be a directory.`);
  }
  cpSync(distribution, resolve(stagingPackage, 'dist'), {
    recursive: true,
    dereference: false,
    errorOnExist: true,
  });
  writeFileSync(resolve(stagingPackage, 'package.json'), serializeProjectedManifest(manifest), {
    encoding: 'utf8',
    flag: 'wx',
  });
  return inspectPackageFiles(readPackageFiles(stagingPackage), manifest);
}
