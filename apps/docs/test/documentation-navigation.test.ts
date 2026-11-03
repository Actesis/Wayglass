import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const config = read('apps/docs/.vitepress/config.ts');
const layout = read('apps/docs/.vitepress/theme/Layout.vue');
const phaseOne = read('docs/phase-1.md').replace(/\s+/g, ' ');

describe('documentation navigation', () => {
  it('uses a product-oriented primary navigation', () => {
    const primaryNavigation = config.slice(config.indexOf('nav: ['), config.indexOf('sidebar: ['));
    const foundations = config.indexOf("text: 'Foundations'");
    const components = config.indexOf("text: 'Components'");
    const patterns = config.indexOf("text: 'Patterns'");
    const guides = config.indexOf("text: 'Guides'");
    const examples = config.indexOf("text: 'Examples'");
    const storybook = config.indexOf("text: 'Storybook'");
    const roadmap = config.indexOf("text: 'Roadmap'");

    expect(foundations).toBeGreaterThan(-1);
    expect(components).toBeGreaterThan(foundations);
    expect(patterns).toBeGreaterThan(components);
    expect(guides).toBeGreaterThan(patterns);
    expect(examples).toBeGreaterThan(guides);
    expect(storybook).toBeGreaterThan(examples);
    expect(roadmap).toBeGreaterThan(storybook);
    expect(primaryNavigation).not.toContain("{ text: 'Phase 6', link: '/phase-6' }");
  });

  it('presents the six roadmap phases in chronological order', () => {
    const roadmapStart = config.indexOf("text: 'Roadmap & history'");
    const projectRecords = config.indexOf("text: 'Project records'", roadmapStart);
    const roadmap = config.slice(roadmapStart, projectRecords);
    const phases = Array.from({ length: 6 }, (_, index) =>
      roadmap.indexOf(`link: '/phase-${index + 1}'`),
    );

    expect(roadmapStart).toBeGreaterThan(-1);
    expect(phases.every((position) => position >= 0)).toBe(true);
    expect(phases).toEqual([...phases].sort((left, right) => left - right));
    expect(config.slice(projectRecords, config.indexOf('items:', projectRecords))).toContain(
      'collapsed: true',
    );
    expect(config).toContain("text: 'Reference applications'");
    expect(config).toContain("text: 'Core components'");
    expect(config).toContain("text: 'Operational data'");
    expect(config).not.toContain("text: 'Phase 4 reference apps'");
  });

  it('publishes a substantive Phase 1 landing page', () => {
    expect(read('apps/docs/phase-1.md')).toContain('../../docs/phase-1.md');
    expect(read('apps/docs/architecture/adr/0008-phase-1-contracts.md')).toContain(
      '../../../../docs/architecture/adr/0008-phase-1-contracts.md',
    );
    expect(phaseOne).toContain('Phase 1 domain-neutral vertical slice');
    expect(phaseOne).toContain('Domain value, condition, knowledge, and activity');
    expect(phaseOne).toContain('Phase 1 validation record');
  });

  it('keeps collapsible sidebar groups to one interactive toggle', () => {
    expect(layout).toContain('.VPSidebarItem.collapsible > .item > .caret[role="button"]');
    expect(layout).toContain("caret.removeAttribute('role')");
    expect(layout).toContain("caret.removeAttribute('tabindex')");
    expect(layout).toContain("caret.removeAttribute('aria-label')");
    expect(layout).toContain('onMounted(normalizeCollapsibleSidebarSemantics)');
    expect(layout).toContain('onUpdated(normalizeCollapsibleSidebarSemantics)');
  });
});
