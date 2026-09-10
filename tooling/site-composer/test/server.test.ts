import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { composeSite } from '../src/compose.ts';
import { startSiteServer, type RunningSiteServer } from '../src/server.ts';
import { createSiteRepositoryFixture, type SiteRepositoryFixture } from './system-fixtures.ts';

const fixtures: SiteRepositoryFixture[] = [];
const servers: RunningSiteServer[] = [];

async function artifact(): Promise<string> {
  const fixture = createSiteRepositoryFixture();
  fixtures.push(fixture);
  const docs = resolve(fixture.root, 'apps/docs/.vitepress/dist');
  const storybook = resolve(fixture.root, 'apps/storybook/storybook-static');
  renameSync(resolve(docs, 'assets/app.js'), resolve(docs, 'assets/app-A1b2C3d4.js'));
  renameSync(
    resolve(storybook, 'assets/manager.js'),
    resolve(storybook, 'assets/manager-E5f6G7h8.js'),
  );
  writeFileSync(
    resolve(docs, '_headers'),
    readFileSync(resolve(process.cwd(), 'apps/docs/public/_headers')),
  );
  writeFileSync(resolve(docs, 'phase-6.html'), 'https://wayglass.hoagsoftworks.com/phase-6');
  mkdirSync(resolve(docs, 'foundations'));
  writeFileSync(resolve(docs, 'foundations/index.html'), 'foundations');
  writeFileSync(resolve(docs, '404.html'), 'not-found');
  for (const [name, value] of [
    ['styles-A1b2C3d4.css', 'body {}'],
    ['data-A1b2C3d4.json', '{}'],
    ['mark-A1b2C3d4.svg', '<svg/>'],
    ['photo-A1b2C3d4.jpg', 'jpg'],
    ['font-A1b2C3d4.woff2', 'font'],
  ] as const) {
    writeFileSync(resolve(docs, 'assets', name), value);
  }
  const output = fixture.output();
  await composeSite({ repositoryRoot: fixture.root, output, command: fixture.command });
  return output;
}

afterEach(async () => {
  for (const server of servers.splice(0)) await server.close();
  for (const fixture of fixtures.splice(0)) fixture.cleanup();
});

describe('loopback response-oracle server', () => {
  it('serves terminal, redirect, HEAD, and rejected-method responses', async () => {
    const server = await startSiteServer({ input: await artifact() });
    servers.push(server);

    const terminal = await fetch(`${server.origin}/phase-6`);
    expect(terminal.status).toBe(200);
    expect(terminal.headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(await terminal.text()).toContain('wayglass.hoagsoftworks.com/phase-6');

    const redirect = await fetch(`${server.origin}/phase-6.html?q=1`, { redirect: 'manual' });
    expect(redirect.status).toBe(307);
    expect(redirect.headers.get('location')).toBe('/phase-6?q=1');
    expect(redirect.headers.get('content-security-policy')).toBeNull();

    const head = await fetch(`${server.origin}/storybook/iframe`, { method: 'HEAD' });
    expect(head.status).toBe(200);
    expect(head.headers.get('content-length')).not.toBe('0');
    expect(await head.text()).toBe('');

    const rejected = await fetch(`${server.origin}/`, { method: 'POST' });
    expect(rejected.status).toBe(405);
    expect(rejected.headers.get('allow')).toBe('GET, HEAD');
  });

  it('refuses non-loopback binding and altered artifacts', async () => {
    const output = await artifact();
    await expect(
      startSiteServer({ input: output, host: '0.0.0.0' as '127.0.0.1' }),
    ).rejects.toThrow('WG_SITE_SERVER_HOST');
    writeFileSync(resolve(output, 'index.html'), 'altered');
    await expect(startSiteServer({ input: output })).rejects.toThrow('WG_SITE_VERIFY_FILE');
  });
});
