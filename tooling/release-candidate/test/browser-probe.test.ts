import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  consumerBrowserEngines,
  createConsumerBrowserProbe,
  readBuiltConsumerAsset,
  type ConsumerBrowserExecution,
  type ConsumerBrowserServer,
} from '../src/browser-probe.ts';
import { consumerScenarios } from '../src/consumer.ts';
import type { ConsumerBrowserProbeResult, ConsumerProjectContext } from '../src/types.ts';

const temporary: string[] = [];

function context(kind: 'vanilla' | 'react'): ConsumerProjectContext {
  const root = mkdtempSync(resolve(tmpdir(), `wayglass-rc-browser-${kind}-`));
  temporary.push(root);
  mkdirSync(resolve(root, 'dist/assets'), { recursive: true });
  writeFileSync(resolve(root, 'dist/index.html'), '<!doctype html><title>Consumer</title>');
  writeFileSync(resolve(root, 'dist/assets/main.js'), 'export {};');
  const scenario = consumerScenarios().find((candidate) => candidate.kind === kind)!;
  return {
    root,
    scenario,
    run: async () => ({ stdout: '', stderr: '' }),
    environment: { PNPM_CONFIG_OFFLINE: 'true' },
  };
}

afterEach(() => {
  for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('release-candidate browser runtime probe', () => {
  const serve: ConsumerBrowserServer = async (root, operation) => {
    expect(readFileSync(resolve(root, 'dist/index.html'), 'utf8')).toContain(
      '<title>Consumer</title>',
    );
    return operation('http://127.0.0.1:4173/');
  };

  it('serves verified output on loopback and records every supported engine and stage', async () => {
    const results: ConsumerBrowserProbeResult[] = [];
    const executions: ConsumerBrowserExecution[] = [];
    const probe = createConsumerBrowserProbe(
      results,
      async (execution) => {
        executions.push(execution);
        const url = new URL(execution.url);
        expect(url.hostname).toBe('127.0.0.1');
        expect(Number(url.port)).toBeGreaterThan(0);
      },
      serve,
    );
    const vanilla = context('vanilla');
    const react = context('react');
    await probe(vanilla, 'primary');
    await probe(react, 'removal');

    expect(executions.map(({ engine }) => engine)).toEqual([
      ...consumerBrowserEngines,
      ...consumerBrowserEngines,
    ]);
    expect(results).toHaveLength(6);
    expect(results[0]).toEqual({
      scenarioId: vanilla.scenario.id,
      kind: 'vanilla',
      stage: 'primary',
      engine: 'chromium',
      runtime: true,
      semantics: true,
      accessibility: true,
    });
    expect(results[5]).toMatchObject({ kind: 'react', stage: 'removal', engine: 'webkit' });
  });

  it('serves regular build files with exact content types and rejects path escape', () => {
    const project = context('vanilla');
    const index = readBuiltConsumerAsset(project.root, '/');
    const javascript = readBuiltConsumerAsset(project.root, '/assets/main.js');
    expect(index?.contentType).toBe('text/html; charset=utf-8');
    expect(index?.bytes.toString()).toContain('<title>Consumer</title>');
    expect(javascript?.contentType).toBe('text/javascript; charset=utf-8');
    expect(readBuiltConsumerAsset(project.root, '/../package.json')).toBeUndefined();
    expect(readBuiltConsumerAsset(project.root, '/missing.js')).toBeUndefined();
    mkdirSync(resolve(project.root, 'outside'));
    writeFileSync(resolve(project.root, 'outside/secret.txt'), 'not browser output');
    symlinkSync(resolve(project.root, 'outside'), resolve(project.root, 'dist/escape'));
    expect(readBuiltConsumerAsset(project.root, '/escape/secret.txt')).toBeUndefined();
  });

  it('does not record a failed engine or continue the stage', async () => {
    const results: ConsumerBrowserProbeResult[] = [];
    const engines: string[] = [];
    const probe = createConsumerBrowserProbe(
      results,
      async ({ engine }) => {
        engines.push(engine);
        throw new Error('browser assertion failed');
      },
      serve,
    );
    await expect(probe(context('vanilla'), 'primary')).rejects.toThrow('browser assertion failed');
    expect(engines).toEqual(['chromium']);
    expect(results).toEqual([]);
  });
});
