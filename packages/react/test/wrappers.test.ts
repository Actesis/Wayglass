import type { WgDataTable as WgDataTableElement } from '@wayglass/elements/data-table';
import type { WgEventLog as WgEventLogElement } from '@wayglass/elements/event-log';
import type { WgEventRecord as WgEventRecordElement } from '@wayglass/elements/event-record';
import type { WgMetric as WgMetricElement } from '@wayglass/elements/metric';
import type { WgStatusEntry as WgStatusEntryElement } from '@wayglass/elements/status-entry';
import type { WgTelemetryStrip as WgTelemetryStripElement } from '@wayglass/elements/telemetry-strip';
import type { WgTimeline as WgTimelineElement } from '@wayglass/elements/timeline';
import type { WgTimelineItem as WgTimelineItemElement } from '@wayglass/elements/timeline-item';
import { createElement, createRef, isValidElement } from 'react';
import { describe, expect, it } from 'vitest';

import {
  WgBooleanValue,
  WgButton,
  WgCanvas,
  WgCheckbox,
  WgCluster,
  WgCommandBar,
  WgCommandItem,
  WgConfirmationDialog,
  WgDataTable,
  WgDialog,
  WgDivider,
  WgElbow,
  WgEventLog,
  WgEventRecord,
  WgFieldLabel,
  WgFieldMessage,
  WgFilterBar,
  WgFormGroup,
  WgFrame,
  WgGrid,
  WgIconButton,
  WgMedia,
  WgMediaViewer,
  WgMenu,
  WgKeyValue,
  WgMetric,
  WgMetricGroup,
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
  WgStatusEntry,
  WgStatusList,
  WgSurface,
  WgTextField,
  WgTelemetryStrip,
  WgTimeline,
  WgTimelineItem,
  WgTrendIndicator,
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
  WgDialogProps,
  WgMediaViewerProps,
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
      WgDialog,
      WgCanvas,
      WgFrame,
      WgStack,
      WgCluster,
      WgCommandBar,
      WgCommandItem,
      WgDataTable,
      WgGrid,
      WgMedia,
      WgMediaViewer,
      WgMenu,
      WgSplit,
      WgScrollRegion,
      WgDivider,
      WgRail,
      WgElbow,
      WgFieldLabel,
      WgFieldMessage,
      WgFilterBar,
      WgFormGroup,
      WgPanel,
      WgButton,
      WgStatusIndicator,
      WgStatusEntry,
      WgStatusList,
      WgTimeline,
      WgTimelineItem,
      WgEventLog,
      WgEventRecord,
      WgSurface,
      WgBooleanValue,
      WgMetric,
      WgMetricGroup,
      WgKeyValue,
      WgTelemetryStrip,
      WgTrendIndicator,
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
      'WgDialog',
      'WgCanvas',
      'WgFrame',
      'WgStack',
      'WgCluster',
      'WgCommandBar',
      'WgCommandItem',
      'WgDataTable',
      'WgGrid',
      'WgMedia',
      'WgMediaViewer',
      'WgMenu',
      'WgSplit',
      'WgScrollRegion',
      'WgDivider',
      'WgRail',
      'WgElbow',
      'WgFieldLabel',
      'WgFieldMessage',
      'WgFilterBar',
      'WgFormGroup',
      'WgPanel',
      'WgButton',
      'WgStatusIndicator',
      'WgStatusEntry',
      'WgStatusList',
      'WgTimeline',
      'WgTimelineItem',
      'WgEventLog',
      'WgEventRecord',
      'WgSurface',
      'WgBooleanValue',
      'WgMetric',
      'WgMetricGroup',
      'WgKeyValue',
      'WgTelemetryStrip',
      'WgTrendIndicator',
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

  it('preserves data-table element refs and consumer-authored native content', () => {
    const ref = createRef<WgDataTableElement>();
    const caption = createElement('caption', null, 'Operational records');
    const table = createElement('table', null, caption);
    const scrollRegion = createElement(
      WgScrollRegion,
      { axis: 'inline', label: 'Operational records table' },
      table,
    );
    const dataTable = createElement(WgDataTable, { ref }, scrollRegion);

    expect(isValidElement(dataTable)).toBe(true);
    expect(dataTable.props.ref).toBe(ref);
    expect(dataTable.props.children).toBe(scrollRegion);
    expect(scrollRegion.props.children).toBe(table);
    expect(table.props.children).toBe(caption);
  });

  it('preserves telemetry samples as a typed property and supports element refs', () => {
    const ref = createRef<WgTelemetryStripElement>();
    const samples = [
      { observedAt: 0, value: 12 },
      { observedAt: 1, value: null, knowledge: 'unavailable' },
    ] as const;
    const telemetry = createElement(WgTelemetryStrip, {
      ref,
      label: 'Queue depth',
      samples,
      windowStart: 0,
      windowEnd: 1,
      scaleMinimum: 0,
      scaleMaximum: 20,
    });

    expect(isValidElement(telemetry)).toBe(true);
    expect(telemetry.props.samples).toBe(samples);
    expect(telemetry.props.ref).toBe(ref);
  });

  it('preserves typed status-entry axes and element refs', () => {
    const ref = createRef<WgStatusEntryElement>();
    const entry = createElement(WgStatusEntry, {
      ref,
      label: 'North source',
      condition: 'caution',
      knowledge: 'stale',
      activity: 'pending',
    });

    expect(isValidElement(entry)).toBe(true);
    expect(entry.props.condition).toBe('caution');
    expect(entry.props.knowledge).toBe('stale');
    expect(entry.props.activity).toBe('pending');
    expect(entry.props.ref).toBe(ref);
  });

  it('preserves typed temporal collection properties and element refs', () => {
    const timelineRef = createRef<WgTimelineElement>();
    const eventLogRef = createRef<WgEventLogElement>();
    const timeline = createElement(WgTimeline, {
      ref: timelineRef,
      label: 'Deployment history',
      chronology: 'ascending',
      chronologyLabel: 'Oldest to newest',
      busy: true,
    });
    const eventLog = createElement(WgEventLog, {
      ref: eventLogRef,
      label: 'Operational events',
      chronology: 'descending',
      chronologyLabel: 'Newest to oldest',
    });

    expect(timeline.props.chronology).toBe('ascending');
    expect(timeline.props.chronologyLabel).toBe('Oldest to newest');
    expect(timeline.props.ref).toBe(timelineRef);
    expect(eventLog.props.chronology).toBe('descending');
    expect(eventLog.props.ref).toBe(eventLogRef);
  });

  it('preserves typed temporal record properties and element refs', () => {
    const timelineItemRef = createRef<WgTimelineItemElement>();
    const eventRecordRef = createRef<WgEventRecordElement>();
    const timelineItem = createElement(WgTimelineItem, {
      ref: timelineItemRef,
      label: 'Review opened',
      kind: 'interval',
      condition: 'informational',
      knowledge: 'inferred',
      activity: 'pending',
    });
    const eventRecord = createElement(WgEventRecord, {
      ref: eventRecordRef,
      label: 'Source response delayed',
      condition: 'caution',
      knowledge: 'stale',
      activity: 'pending',
    });

    expect(timelineItem.props.kind).toBe('interval');
    expect(timelineItem.props.knowledge).toBe('inferred');
    expect(timelineItem.props.ref).toBe(timelineItemRef);
    expect(eventRecord.props.condition).toBe('caution');
    expect(eventRecord.props.activity).toBe('pending');
    expect(eventRecord.props.ref).toBe(eventRecordRef);
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

  it('preserves typed content-dialog lifetime callback props', () => {
    const onWgDialogOpen: NonNullable<WgDialogProps['onWgDialogOpen']> = (event) => {
      expect(event.detail.dialogId).toBe('record-details');
    };
    const onWgDialogClose: NonNullable<WgDialogProps['onWgDialogClose']> = (event) => {
      expect(event.detail.reason).toMatch(/^(close-control|escape|programmatic)$/);
    };
    const dialog = createElement(WgDialog, {
      dialogId: 'record-details',
      closeLabel: 'Close details',
      initialFocus: 'heading',
      size: 'wide',
      onWgDialogOpen,
      onWgDialogClose,
    });

    expect(dialog.props.dialogId).toBe('record-details');
    expect(dialog.props.onWgDialogOpen).toBe(onWgDialogOpen);
    expect(dialog.props.onWgDialogClose).toBe(onWgDialogClose);
  });

  it('preserves typed media-viewer lifetime and view callback props', () => {
    const onWgMediaViewerOpen: NonNullable<WgMediaViewerProps['onWgMediaViewerOpen']> = (event) => {
      expect(event.detail.viewerId).toBe('asset-image');
    };
    const onWgMediaViewerClose: NonNullable<WgMediaViewerProps['onWgMediaViewerClose']> = (
      event,
    ) => {
      expect(event.detail.reason).toMatch(/^(close-control|escape|programmatic)$/);
    };
    const onWgMediaViewChange: NonNullable<WgMediaViewerProps['onWgMediaViewChange']> = (event) => {
      expect(event.detail.view).toMatch(/^(fit|actual-size|zoomed)$/);
    };
    const viewer = createElement(WgMediaViewer, {
      viewerId: 'asset-image',
      closeLabel: 'Close image',
      zoomInLabel: 'Zoom in',
      zoomOutLabel: 'Zoom out',
      fitLabel: 'Fit image',
      actualSizeLabel: 'Actual size',
      initialView: 'fit',
      state: 'ready',
      onWgMediaViewerOpen,
      onWgMediaViewerClose,
      onWgMediaViewChange,
    });

    expect(viewer.props.viewerId).toBe('asset-image');
    expect(viewer.props.onWgMediaViewerOpen).toBe(onWgMediaViewerOpen);
    expect(viewer.props.onWgMediaViewerClose).toBe(onWgMediaViewerClose);
    expect(viewer.props.onWgMediaViewChange).toBe(onWgMediaViewChange);
  });
});
