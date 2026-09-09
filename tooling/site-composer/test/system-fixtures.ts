import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import type { LocalCommand } from '../src/repository.ts';

export interface SiteRepositoryFixture {
  readonly parent: string;
  readonly root: string;
  readonly command: LocalCommand;
  output(name?: string): string;
  cleanup(): void;
}

function write(path: string, value: string | Uint8Array): void {
  writeFileSync(path, value);
}

export function createSiteRepositoryFixture(
  options: { readonly docsName?: string } = {},
): SiteRepositoryFixture {
  const parent = realpathSync(mkdtempSync(resolve(tmpdir(), 'wayglass-site-system-')));
  const root = resolve(parent, 'repository');
  mkdirSync(root);
  mkdirSync(resolve(root, 'apps/docs'), { recursive: true });
  mkdirSync(resolve(root, 'apps/storybook'), { recursive: true });

  write(resolve(root, '.gitignore'), '**/.vitepress/dist/\nstorybook-static/\n');
  write(resolve(root, 'README.md'), '# fixture\n');
  write(resolve(root, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
  write(
    resolve(root, 'package.json'),
    `${JSON.stringify({ name: 'wayglass-fixture', private: true, packageManager: 'pnpm@11.9.0' }, null, 2)}\n`,
  );
  write(
    resolve(root, 'apps/docs/package.json'),
    `${JSON.stringify({ name: options.docsName ?? '@wayglass/docs', version: '0.1.0' }, null, 2)}\n`,
  );
  write(
    resolve(root, 'apps/storybook/package.json'),
    `${JSON.stringify({ name: '@wayglass/storybook', version: '0.2.0' }, null, 2)}\n`,
  );

  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'fixture@example.invalid'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Wayglass Fixture'], { cwd: root });
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-q', '-m', 'fixture'], { cwd: root });

  mkdirSync(resolve(root, 'apps/docs/.vitepress/dist/assets'), { recursive: true });
  write(resolve(root, 'apps/docs/.vitepress/dist/index.html'), '<h1>Wayglass</h1>\n');
  write(resolve(root, 'apps/docs/.vitepress/dist/404.html'), '<h1>Not found</h1>\n');
  write(resolve(root, 'apps/docs/.vitepress/dist/assets/app.js'), 'console.log("docs");\n');
  mkdirSync(resolve(root, 'apps/storybook/storybook-static/assets'), { recursive: true });
  write(resolve(root, 'apps/storybook/storybook-static/index.html'), '<h1>Storybook</h1>\n');
  write(resolve(root, 'apps/storybook/storybook-static/iframe.html'), '<main>Preview</main>\n');
  write(
    resolve(root, 'apps/storybook/storybook-static/assets/manager.js'),
    'console.log("storybook");\n',
  );

  const command: LocalCommand = (executable, arguments_, cwd) => {
    if (executable === 'pnpm') return Buffer.from('11.9.0\n');
    return execFileSync(executable, arguments_, {
      cwd,
      encoding: 'buffer',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  };
  return {
    parent,
    root,
    command,
    output: (name = 'site') => resolve(parent, name),
    cleanup: () => rmSync(parent, { recursive: true, force: true }),
  };
}
