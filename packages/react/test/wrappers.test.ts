import type { WgMetric as WgMetricElement } from '@wayglass/elements/metric';
import { createElement, createRef, isValidElement } from 'react';
import { describe, expect, it } from 'vitest';

import {
  WgBooleanValue,
  WgButton,
  WgCanvas,
  WgCluster,
  WgCommandItem,
  WgDivider,
  WgElbow,
  WgFieldLabel,
  WgFieldMessage,
  WgFormGroup,
  WgFrame,
  WgGrid,
  WgIconButton,
  WgMedia,
  WgMenu,
  WgMetric,
  WgNavigationRail,
  WgPanel,
  WgRail,
  WgScrollRegion,
  WgSegment,
  WgSegmentedControl,
  WgSplit,
  WgStack,
  WgStatusIndicator,
  WgSurface,
  WgTab,
  WgTabList,
  WgTabPanel,
  WgTabs,
  WgThemeProvider,
  WgToggle,
  WgValueTile,
} from '../src/index.js';
import type { WgTabsProps, WgThemeProviderProps } from '../src/index.js';

describe('Wayglass React wrappers', () => {
  it('exports named wrappers for every implemented element', () => {
    const wrappers = [
      WgThemeProvider,
      WgCanvas,
      WgFrame,
      WgStack,
      WgCluster,
      WgCommandItem,
      WgGrid,
      WgMedia,
      WgMenu,
      WgSplit,
      WgScrollRegion,
      WgDivider,
      WgRail,
      WgElbow,
      WgFieldLabel,
      WgFieldMessage,
      WgFormGroup,
      WgPanel,
      WgButton,
      WgStatusIndicator,
      WgSurface,
      WgBooleanValue,
      WgMetric,
      WgValueTile,
      WgTabs,
      WgTabList,
      WgTab,
      WgTabPanel,
      WgIconButton,
      WgToggle,
      WgSegmentedControl,
      WgSegment,
      WgNavigationRail,
    ];

    expect(wrappers.map((wrapper) => wrapper.displayName)).toEqual([
      'WgThemeProvider',
      'WgCanvas',
      'WgFrame',
      'WgStack',
      'WgCluster',
      'WgCommandItem',
      'WgGrid',
      'WgMedia',
      'WgMenu',
      'WgSplit',
      'WgScrollRegion',
      'WgDivider',
      'WgRail',
      'WgElbow',
      'WgFieldLabel',
      'WgFieldMessage',
      'WgFormGroup',
      'WgPanel',
      'WgButton',
      'WgStatusIndicator',
      'WgSurface',
      'WgBooleanValue',
      'WgMetric',
      'WgValueTile',
      'WgTabs',
      'WgTabList',
      'WgTab',
      'WgTabPanel',
      'WgIconButton',
      'WgToggle',
      'WgSegmentedControl',
      'WgSegment',
      'WgNavigationRail',
    ]);
  });

  it('creates valid React elements with element properties and refs', () => {
    const ref = createRef<WgMetricElement>();
    const metric = createElement(WgMetric, {
      ref,
      label: 'Latency',
      value: '184',
      unit: 'ms',
      condition: 'caution',
      knowledge: 'stale',
    });

    expect(isValidElement(metric)).toBe(true);
    expect(metric.props.condition).toBe('caution');
    expect(metric.props.knowledge).toBe('stale');
    expect(metric.props.ref).toBe(ref);
  });

  it('preserves the typed theme-change callback prop', () => {
    const onWgThemeChange: NonNullable<WgThemeProviderProps['onWgThemeChange']> = (event) => {
      expect(event.detail.resolvedTheme).toMatch(/^wayglass-/);
    };
    const provider = createElement(WgThemeProvider, {
      theme: 'wayglass-dark',
      onWgThemeChange,
    });

    expect(provider.props.onWgThemeChange).toBe(onWgThemeChange);
  });

  it('preserves the typed tab-change callback prop', () => {
    const onWgTabChange: NonNullable<WgTabsProps['onWgTabChange']> = (event) => {
      expect(event.detail.trigger).toMatch(/^(keyboard|pointer)$/);
    };
    const tabs = createElement(WgTabs, {
      activation: 'manual',
      orientation: 'vertical',
      value: 'overview',
      onWgTabChange,
    });

    expect(tabs.props.activation).toBe('manual');
    expect(tabs.props.orientation).toBe('vertical');
    expect(tabs.props.onWgTabChange).toBe(onWgTabChange);
  });
});
