import type { WgMetric as WgMetricElement } from '@wayglass/elements/metric';
import { createElement, createRef, isValidElement } from 'react';
import { describe, expect, it } from 'vitest';

import {
  WgBooleanValue,
  WgButton,
  WgCanvas,
  WgCheckbox,
  WgCluster,
  WgCommandItem,
  WgConfirmationDialog,
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
  WgNumberField,
  WgPanel,
  WgRail,
  WgRadio,
  WgScrollRegion,
  WgSelect,
  WgSegment,
  WgSegmentedControl,
  WgSplit,
  WgSlider,
  WgStack,
  WgStatusIndicator,
  WgSurface,
  WgTextField,
  WgTab,
  WgTabList,
  WgTabPanel,
  WgTabs,
  WgThemeProvider,
  WgToast,
  WgToastRegion,
  WgToggle,
  WgValueTile,
} from '../src/index.js';
import type {
  WgConfirmationDialogProps,
  WgTabsProps,
  WgThemeProviderProps,
  WgToastProps,
} from '../src/index.js';

describe('Wayglass React wrappers', () => {
  it('exports named wrappers for every implemented element', () => {
    const wrappers = [
      WgThemeProvider,
      WgToastRegion,
      WgToast,
      WgConfirmationDialog,
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
      WgCheckbox,
      WgNumberField,
      WgRadio,
      WgSelect,
      WgSlider,
      WgTextField,
    ];

    expect(wrappers.map((wrapper) => wrapper.displayName)).toEqual([
      'WgThemeProvider',
      'WgToastRegion',
      'WgToast',
      'WgConfirmationDialog',
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
      'WgCheckbox',
      'WgNumberField',
      'WgRadio',
      'WgSelect',
      'WgSlider',
      'WgTextField',
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

  it('preserves the typed toast-dismiss callback prop', () => {
    const onWgToastDismiss: NonNullable<WgToastProps['onWgToastDismiss']> = (event) => {
      expect(event.detail.reason).toMatch(/^(timeout|close|programmatic|replaced)$/);
    };
    const toast = createElement(WgToast, {
      toastId: 'save-result',
      open: true,
      closeLabel: 'Dismiss save result',
      onWgToastDismiss,
      children: 'Preferences saved.',
    });

    expect(toast.props.toastId).toBe('save-result');
    expect(toast.props.onWgToastDismiss).toBe(onWgToastDismiss);
  });

  it('preserves typed confirmation action and close callback props', () => {
    const onWgConfirmationAction: NonNullable<
      WgConfirmationDialogProps['onWgConfirmationAction']
    > = (event) => {
      expect(event.detail.dialogId).toBe('disconnect-source');
    };
    const onWgConfirmationClose: NonNullable<WgConfirmationDialogProps['onWgConfirmationClose']> = (
      event,
    ) => {
      expect(event.detail.reason).toMatch(/^(action|cancel|escape|programmatic)$/);
    };
    const dialog = createElement(WgConfirmationDialog, {
      dialogId: 'disconnect-source',
      actionLabel: 'Disconnect Northwind records',
      cancelLabel: 'Keep connected',
      actionAppearance: 'critical',
      initialFocus: 'cancel',
      onWgConfirmationAction,
      onWgConfirmationClose,
    });

    expect(dialog.props.dialogId).toBe('disconnect-source');
    expect(dialog.props.onWgConfirmationAction).toBe(onWgConfirmationAction);
    expect(dialog.props.onWgConfirmationClose).toBe(onWgConfirmationClose);
  });
});
