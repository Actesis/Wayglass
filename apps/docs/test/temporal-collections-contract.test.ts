import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');

const contract = read('docs/data/temporal-collections.md');
const timeline = read('packages/elements/src/timeline.ts');
const timelineItem = read('packages/elements/src/timeline-item.ts');
const eventLog = read('packages/elements/src/event-log.ts');
const eventRecord = read('packages/elements/src/event-record.ts');
const timelineReact = read('packages/react/src/timeline.tsx');
const timelineItemReact = read('packages/react/src/timeline-item.tsx');
const eventLogReact = read('packages/react/src/event-log.tsx');
const eventRecordReact = read('packages/react/src/event-record.tsx');

function sourceReactiveProperties(source: string): string[] {
  const block = source.match(/static override properties = \{([\s\S]*?)\n {2}\};/);
  if (!block) return [];
  return [...block[1]!.matchAll(/^ {4}([a-z][A-Za-z0-9]*):/gm)].map((match) => match[1]!).sort();
}

function sourceSlots(source: string): string[] {
  return [
    ...new Set(
      [...source.matchAll(/<slot(?:\s+name="([^"]+)")?/g)].map((match) => match[1] ?? 'default'),
    ),
  ].sort();
}

function renderedParts(source: string): string[] {
  return [
    ...new Set([...source.matchAll(/part="([^"]+)"/g)].flatMap((match) => match[1]!.split(/\s+/))),
  ].sort();
}

function publicProperties(source: string, prefix: string): string[] {
  return [...new Set(source.match(new RegExp(`--wg-${prefix}-[a-z0-9-]+`, 'g')) ?? [])].sort();
}

describe('temporal-collection field-level contracts', () => {
  it('freezes the separate collection fields, defaults, slots, and anatomy', () => {
    for (const source of [timeline, eventLog]) {
      expect(sourceReactiveProperties(source)).toEqual([
        'busy',
        'chronology',
        'chronologyLabel',
        'label',
      ]);
      expect(source).toContain("this.label = '';");
      expect(source).toContain("this.chronology = 'ascending';");
      expect(source).toContain("this.chronologyLabel = '';");
      expect(source).toContain('this.busy = false;');
      expect(source).toContain("attribute: 'chronology-label'");
      expect(sourceSlots(source)).toEqual([
        'actions',
        'default',
        'description',
        'heading',
        'status',
      ]);
      expect(renderedParts(source)).toEqual([
        'actions',
        'base',
        'chronology',
        'description',
        'header',
        'heading',
        'list',
        'status',
      ]);
    }
    expect(timeline).toContain("['ascending', 'descending']");
    expect(eventLog).toContain("['ascending', 'descending']");
  });

  it('freezes collection styling hooks without merging the families', () => {
    expect(publicProperties(timeline, 'timeline')).toEqual([
      '--wg-timeline-color-background',
      '--wg-timeline-color-border',
      '--wg-timeline-color-context',
      '--wg-timeline-color-heading',
      '--wg-timeline-radius',
      '--wg-timeline-space',
      '--wg-timeline-space-item',
    ]);
    expect(publicProperties(eventLog, 'event-log')).toEqual([
      '--wg-event-log-color-background',
      '--wg-event-log-color-border',
      '--wg-event-log-color-context',
      '--wg-event-log-color-heading',
      '--wg-event-log-radius',
      '--wg-event-log-space',
      '--wg-event-log-space-record',
    ]);
    expect(timeline).not.toContain('WgEventLog');
    expect(eventLog).not.toContain('WgTimeline');
  });

  it('freezes timeline-item fields, kinds, slots, anatomy, and styling hooks', () => {
    expect(sourceReactiveProperties(timelineItem)).toEqual([
      'activity',
      'condition',
      'kind',
      'knowledge',
      'label',
    ]);
    expect(timelineItem).toContain("['milestone', 'interval']");
    for (const value of [
      "this.label = '';",
      "this.kind = 'milestone';",
      "this.condition = 'neutral';",
      "this.knowledge = 'confirmed';",
      "this.activity = 'idle';",
    ]) {
      expect(timelineItem).toContain(value);
    }
    expect(sourceSlots(timelineItem)).toEqual([
      'actions',
      'default',
      'details',
      'end-time',
      'heading',
      'metadata',
      'time',
    ]);
    expect(renderedParts(timelineItem)).toEqual([
      'actions',
      'activity',
      'base',
      'condition',
      'content',
      'description',
      'details',
      'end-time',
      'heading',
      'knowledge',
      'metadata',
      'sequence',
      'signal',
      'state',
      'time',
    ]);
    expect(publicProperties(timelineItem, 'timeline-item')).toEqual([
      '--wg-timeline-item-color-condition',
      '--wg-timeline-item-color-detail',
      '--wg-timeline-item-color-heading',
      '--wg-timeline-item-color-sequence',
      '--wg-timeline-item-color-signal-border',
      '--wg-timeline-item-color-state',
      '--wg-timeline-item-radius-signal',
      '--wg-timeline-item-size-signal',
      '--wg-timeline-item-space',
      '--wg-timeline-item-space-related',
      '--wg-timeline-item-width-sequence',
    ]);
  });

  it('freezes event-record fields, slots, anatomy, and styling hooks', () => {
    expect(sourceReactiveProperties(eventRecord)).toEqual([
      'activity',
      'condition',
      'knowledge',
      'label',
    ]);
    for (const value of [
      "this.label = '';",
      "this.condition = 'neutral';",
      "this.knowledge = 'confirmed';",
      "this.activity = 'idle';",
    ]) {
      expect(eventRecord).toContain(value);
    }
    expect(sourceSlots(eventRecord)).toEqual([
      'actions',
      'category',
      'details',
      'metadata',
      'received-time',
      'reference',
      'source',
      'summary',
      'time',
    ]);
    expect(renderedParts(eventRecord)).toEqual([
      'actions',
      'activity',
      'base',
      'category',
      'condition',
      'content',
      'details',
      'knowledge',
      'metadata',
      'received-time',
      'reference',
      'signal',
      'source',
      'state',
      'summary',
      'time',
    ]);
    expect(publicProperties(eventRecord, 'event-record')).toEqual([
      '--wg-event-record-color-background',
      '--wg-event-record-color-border',
      '--wg-event-record-color-condition',
      '--wg-event-record-color-detail',
      '--wg-event-record-color-signal-border',
      '--wg-event-record-color-state',
      '--wg-event-record-color-summary',
      '--wg-event-record-radius',
      '--wg-event-record-radius-signal',
      '--wg-event-record-size-signal',
      '--wg-event-record-space',
      '--wg-event-record-space-related',
    ]);
  });

  it('keeps chronology descriptive and never sorts or reverses authored records', () => {
    for (const source of [timeline, eventLog]) {
      expect(source).toContain('${this.chronologyLabel}');
      expect(source).not.toContain('.sort(');
      expect(source).not.toContain('column-reverse');
      expect(source).not.toContain('row-reverse');
      expect(source).not.toContain('flex-direction: reverse');
    }
    expect(contract).toContain('authored-order list semantics');
    expect(contract).toContain('`chronologyLabel: string` (`chronology-label` attribute)');
  });

  it('keeps quiet list semantics, independent state, and native details', () => {
    for (const source of [timeline, eventLog]) {
      expect(source).toContain('role="list"');
      expect(source).not.toContain('role="log"');
      expect(source).not.toContain('aria-live');
      expect(source).not.toContain('new CustomEvent');
    }
    for (const source of [timelineItem, eventRecord]) {
      expect(source).toContain("this.setAttribute('role', 'listitem');");
      expect(source).toContain('${conditionLabels[this.condition]}');
      expect(source).toContain('${knowledgeLabels[this.knowledge]}');
      expect(source).toContain('${activityLabels[this.activity]}');
      expect(source).toContain('part="signal" aria-hidden="true"');
      expect(source).not.toContain('new CustomEvent');
    }
    expect(timelineItem).toContain('<slot name="details"');
    expect(eventRecord).toContain('<slot name="details"');
  });

  it('preserves unsupported children and keeps action activation consumer-owned', () => {
    expect(timeline).toContain("child.localName !== 'wg-timeline-item'");
    expect(eventLog).toContain("child.localName !== 'wg-event-record'");
    for (const source of [timeline, eventLog]) {
      expect(source).toContain('preserving unsupported: ${names}');
      expect(source).not.toContain('.remove()');
      expect(source).not.toContain('replaceChildren');
    }
    for (const source of [timelineItem, eventRecord]) {
      expect(source).toMatch(/<div part="content">[\s\S]*?<\/div>\s*<div part="actions"/);
      expect(source).not.toContain('@click');
    }
  });

  it('freezes explicit registration and thin React adaptation', () => {
    for (const [source, definition] of [
      [timeline, 'defineElement(wgTimelineTagName, WgTimeline, registry);'],
      [timelineItem, 'defineElement(wgTimelineItemTagName, WgTimelineItem, registry);'],
      [eventLog, 'defineElement(wgEventLogTagName, WgEventLog, registry);'],
      [eventRecord, 'defineElement(wgEventRecordTagName, WgEventRecord, registry);'],
    ]) {
      expect(source).toContain(definition);
    }
    for (const [wrapper, registration] of [
      [timelineReact, 'registerElement(defineWgTimeline);'],
      [timelineItemReact, 'registerElement(defineWgTimelineItem);'],
      [eventLogReact, 'registerElement(defineWgEventLog);'],
      [eventRecordReact, 'registerElement(defineWgEventRecord);'],
    ]) {
      expect(wrapper).toContain(registration);
      expect(wrapper).not.toContain('events:');
    }
  });

  it('records current evidence and continuing boundaries', () => {
    expect(contract).toContain('## Validation coverage');
    expect(contract).toContain('## Continuing boundaries');
    expect(contract).not.toContain('## Deferred and excluded behavior');
    expect(contract).not.toContain('implementation, stories, and validation proceed');
    expect(contract).toContain('representative assistive-technology evidence remains');
  });
});
