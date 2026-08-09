import type { WgButton as WgButtonElement } from '@wayglass/elements/button';
import type { WgConfirmationDialog as WgConfirmationDialogElement } from '@wayglass/elements/confirmation-dialog';
import type { WgDialog as WgDialogElement } from '@wayglass/elements/dialog';
import type { WgSurface as WgSurfaceElement } from '@wayglass/elements/surface';
import type { WgSplit as WgSplitElement } from '@wayglass/elements/split';
import type { WgMedia as WgMediaElement } from '@wayglass/elements/media';
import type { WgMediaViewer as WgMediaViewerElement } from '@wayglass/elements/media-viewer';
import type { WgMenu as WgMenuElement } from '@wayglass/elements/menu';
import type { WgTab as WgTabElement, WgTabs as WgTabsElement } from '@wayglass/elements/tabs';
import type { WgThemeProvider as WgThemeProviderElement } from '@wayglass/elements/theme-provider';
import type { WgTelemetryStrip as WgTelemetryStripElement } from '@wayglass/elements/telemetry-strip';
import type { WgStatusEntry as WgStatusEntryElement } from '@wayglass/elements/status-entry';
import type { WgToggle as WgToggleElement } from '@wayglass/elements/toggle';
import type { WgToast as WgToastElement } from '@wayglass/elements/toast';
import type { WgToastRegion as WgToastRegionElement } from '@wayglass/elements/toast-region';
import { createRef } from 'react';

import {
  WgBooleanValue,
  WgButton,
  WgCheckbox,
  WgDivider,
  WgCluster,
  WgCommandItem,
  WgConfirmationDialog,
  WgDialog,
  WgFrame,
  WgFieldLabel,
  WgFieldMessage,
  WgFormGroup,
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
  WgRadio,
  WgScrollRegion,
  WgSelect,
  WgSegment,
  WgSegmentedControl,
  WgSplit,
  WgSlider,
  WgStack,
  WgStatusEntry,
  WgStatusList,
  WgSurface,
  WgTextField,
  WgTelemetryStrip,
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
  WgSegmentChangeEvent,
  WgCommandEvent,
  WgConfirmationActionEvent,
  WgConfirmationCloseEvent,
  WgDialogCloseEvent,
  WgDialogOpenEvent,
  WgMediaViewChangeEvent,
  WgMediaViewerCloseEvent,
  WgMediaViewerOpenEvent,
  WgMenuToggleEvent,
  WgTabChangeEvent,
  WgThemeChangeEvent,
  WgToastDismissEvent,
  WgToggleRequestEvent,
} from '../src/index.js';

const buttonRef = createRef<WgButtonElement>();
const surfaceRef = createRef<WgSurfaceElement>();
const providerRef = createRef<WgThemeProviderElement>();
const tabRef = createRef<WgTabElement>();
const tabsRef = createRef<WgTabsElement>();
const splitRef = createRef<WgSplitElement>();
const mediaRef = createRef<WgMediaElement>();
const toggleRef = createRef<WgToggleElement>();
const menuRef = createRef<WgMenuElement>();
const toastRef = createRef<WgToastElement>();
const toastRegionRef = createRef<WgToastRegionElement>();
const confirmationDialogRef = createRef<WgConfirmationDialogElement>();
const dialogRef = createRef<WgDialogElement>();
const mediaViewerRef = createRef<WgMediaViewerElement>();
const telemetryStripRef = createRef<WgTelemetryStripElement>();
const statusEntryRef = createRef<WgStatusEntryElement>();

const typedComposition = (
  <WgThemeProvider ref={providerRef} theme="wayglass-dark" density="compact">
    <WgValueTile label="Communications">
      <WgMetric label="Latency" value="184" unit="ms" condition="caution" knowledge="stale" />
      <WgBooleanValue
        label="Primary link"
        asserted
        assertedLabel="Connected"
        notAssertedLabel="Disconnected"
      />
      <WgButton ref={buttonRef} appearance="secondary" pending>
        Retry Communications primary link
      </WgButton>
    </WgValueTile>
    <WgSurface ref={surfaceRef} tone="inset" boundary="strong" padding="compact">
      <p>Supporting neutral context</p>
      <WgDivider decorative />
      <p>Additional context</p>
    </WgSurface>
  </WgThemeProvider>
);

const typedScalarData = (
  <WgMetricGroup label="Processing activity" busy>
    <p slot="description">Current 15-minute interval</p>
    <WgMetric label="Completed" value="1,284">
      <WgTrendIndicator slot="trend" direction="rising" label="12% over the previous hour" />
    </WgMetric>
    <WgKeyValue label="Active policy" value="Standard review" knowledge="confirmed" />
  </WgMetricGroup>
);

const typedTelemetry = (
  <WgTelemetryStrip
    ref={telemetryStripRef}
    label="Queue depth"
    samples={[
      { observedAt: 0, value: 12 },
      { observedAt: 1, value: null, knowledge: 'unavailable' },
    ]}
    windowStart={0}
    windowEnd={1}
    scaleMinimum={0}
    scaleMaximum={20}
    condition="caution"
    activity="pending"
  >
    <h2 slot="heading">Queue depth</h2>
    <time slot="window-start" dateTime="2026-08-09T18:00:00Z">
      11:00
    </time>
    <time slot="window-end" dateTime="2026-08-09T19:00:00Z">
      12:00
    </time>
    <p slot="summary">One unavailable observation occurs in the hour.</p>
  </WgTelemetryStrip>
);
void typedTelemetry;

const typedStatusList = (
  <WgStatusList label="Delivery sources" busy>
    <h2 slot="heading">Delivery sources</h2>
    <p slot="status">Refreshing retained values.</p>
    <WgStatusEntry
      ref={statusEntryRef}
      label="North source"
      condition="caution"
      knowledge="stale"
      activity="pending"
    >
      <span slot="description">The last confirmed route remains active.</span>
      <time slot="time" dateTime="2026-08-09T14:22:00-07:00">
        Observed at 2:22 PM
      </time>
      <button slot="actions" type="button">
        Inspect North source
      </button>
    </WgStatusEntry>
  </WgStatusList>
);
void typedStatusList;

const typedFormControls = (
  <form>
    <WgTextField>
      <input name="email" type="email" autoComplete="email" onChange={() => undefined} />
    </WgTextField>
    <WgNumberField>
      <input name="quantity" type="number" min={0} step={1} />
    </WgNumberField>
    <WgSelect>
      <select name="route" defaultValue="email">
        <option value="email">Email</option>
      </select>
    </WgSelect>
    <WgCheckbox>
      <input id="updates" name="updates" type="checkbox" />
      <label htmlFor="updates">Send updates</label>
    </WgCheckbox>
    <WgRadio>
      <input id="route-email" name="preferred-route" type="radio" value="email" />
      <label htmlFor="route-email">Email</label>
    </WgRadio>
    <WgSlider>
      <input name="threshold" type="range" min={0} max={100} />
    </WgSlider>
  </form>
);
void typedFormControls;

const eventHandler = (event: WgThemeChangeEvent): void => {
  const provider: WgThemeProviderElement = event.currentTarget;
  const resolvedTheme: 'wayglass-dark' | 'wayglass-light' = event.detail.resolvedTheme;
  void provider;
  void resolvedTheme;
};

const typedProvider = <WgThemeProvider onWgThemeChange={eventHandler} />;

const typedLayouts = (
  <WgFrame boundary="strong" padding="compact">
    <WgStack space="section" align="stretch">
      <WgCluster space="related" align="baseline" justify="between">
        <span>Updated now</span>
        <button type="button">Refresh</button>
      </WgCluster>
      <WgGrid space="section" minimum="compact" align="start">
        <div>Peer one</div>
        <div>Peer two</div>
      </WgGrid>
      <WgSplit ref={splitRef} space="section" ratio="primary" minimum="standard" align="stretch">
        <section slot="primary">Primary region</section>
        <aside slot="secondary">Supporting region</aside>
      </WgSplit>
      <WgScrollRegion axis="block" label="Recent events">
        <ol>
          <li>Event</li>
        </ol>
      </WgScrollRegion>
    </WgStack>
  </WgFrame>
);

const typedMedia = (
  <figure>
    <WgMedia ref={mediaRef} aspect="landscape" fit="contain" state="ready" boundary="strong">
      <img src="/asset.webp" width={1200} height={900} alt="Asset identification view" />
      <a slot="inspection" href="/asset-full.webp">
        View full-size asset image
      </a>
      <p slot="loading">Loading asset image…</p>
      <p slot="unavailable">Asset image unavailable.</p>
    </WgMedia>
    <figcaption>Asset in its installed location.</figcaption>
  </figure>
);

const tabChangeHandler = (event: WgTabChangeEvent): void => {
  const tabs: WgTabsElement = event.currentTarget;
  const value: string = event.detail.value;
  const previousValue: string = event.detail.previousValue;
  const trigger: 'keyboard' | 'pointer' = event.detail.trigger;
  void tabs;
  void value;
  void previousValue;
  void trigger;
};

const typedTabs = (
  <WgTabs
    ref={tabsRef}
    value="overview"
    activation="manual"
    orientation="vertical"
    onWgTabChange={tabChangeHandler}
  >
    <WgTabList aria-label="Account views">
      <WgTab ref={tabRef} value="overview">
        Overview
      </WgTab>
      <WgTab value="security" disabled>
        Security
      </WgTab>
    </WgTabList>
    <WgTabPanel value="overview">Overview content</WgTabPanel>
    <WgTabPanel value="security">Security content</WgTabPanel>
  </WgTabs>
);

const toggleRequestHandler = (event: WgToggleRequestEvent): void => {
  const toggle: WgToggleElement = event.currentTarget;
  const requested: boolean = event.detail.requestedAsserted;
  void toggle;
  void requested;
};

const segmentChangeHandler = (event: WgSegmentChangeEvent): void => {
  const value: string = event.detail.value;
  void value;
};

const typedControls = (
  <>
    <WgIconButton label="Refresh account" appearance="quiet" pending={false} />
    <WgToggle
      ref={toggleRef}
      label="Email notifications"
      assertedLabel="On"
      notAssertedLabel="Off"
      requested="none"
      requestState="idle"
      availability="available"
      onWgToggleRequest={toggleRequestHandler}
    />
    <WgSegmentedControl
      value="compact"
      orientation="horizontal"
      aria-label="Density"
      onWgSegmentChange={segmentChangeHandler}
    >
      <WgSegment value="compact">Compact</WgSegment>
      <WgSegment value="comfortable">Comfortable</WgSegment>
    </WgSegmentedControl>
    <nav aria-label="Account">
      <WgNavigationRail orientation="vertical">
        <a href="/account">Account</a>
      </WgNavigationRail>
    </nav>
  </>
);

const commandHandler = (event: WgCommandEvent): void => {
  const value: string = event.detail.value;
  const trigger: 'keyboard' | 'pointer' | 'programmatic' = event.detail.trigger;
  void value;
  void trigger;
};

const menuToggleHandler = (event: WgMenuToggleEvent): void => {
  const menu: WgMenuElement = event.currentTarget;
  const open: boolean = event.detail.open;
  void menu;
  void open;
};

const typedMenu = (
  <WgMenu
    ref={menuRef}
    label="Report actions"
    placement="block-end-end"
    onWgMenuToggle={menuToggleHandler}
  >
    <span slot="trigger">Report actions</span>
    <WgCommandItem value="refresh" onWgCommand={commandHandler}>
      Refresh report
      <span slot="detail">Fetch the latest confirmed values</span>
    </WgCommandItem>
    <WgDivider />
    <WgCommandItem value="export">Export report</WgCommandItem>
  </WgMenu>
);

const toastDismissHandler = (event: WgToastDismissEvent): void => {
  const toast: WgToastElement = event.currentTarget;
  const toastId: string = event.detail.toastId;
  const reason: 'timeout' | 'close' | 'programmatic' | 'replaced' = event.detail.reason;
  void toast;
  void toastId;
  void reason;
};

const typedTransientFeedback = (
  <WgToastRegion ref={toastRegionRef} placement="block-end-end" maxVisible={3} paused={false}>
    <WgToast
      ref={toastRef}
      toastId="preferences-saved"
      dedupeKey="preferences"
      condition="positive"
      announcement="polite"
      duration={8_000}
      dismissible
      closeLabel="Dismiss save notification"
      open
      onWgToastDismiss={toastDismissHandler}
    >
      Contact preferences saved.
    </WgToast>
  </WgToastRegion>
);

const confirmationActionHandler = (event: WgConfirmationActionEvent): void => {
  const dialog: WgConfirmationDialogElement = event.currentTarget;
  const dialogId: string = event.detail.dialogId;
  void dialog;
  void dialogId;
};

const confirmationCloseHandler = (event: WgConfirmationCloseEvent): void => {
  const reason: 'action' | 'cancel' | 'escape' | 'programmatic' = event.detail.reason;
  void reason;
};

const typedConfirmation = (
  <WgConfirmationDialog
    ref={confirmationDialogRef}
    dialogId="disconnect-source"
    actionLabel="Disconnect Northwind records"
    cancelLabel="Keep connected"
    actionAppearance="critical"
    attention="ordinary"
    initialFocus="cancel"
    open={false}
    onWgConfirmationAction={confirmationActionHandler}
    onWgConfirmationClose={confirmationCloseHandler}
  >
    <h2 slot="heading">Disconnect Northwind records?</h2>
    <p>Current updates will stop for every operator.</p>
  </WgConfirmationDialog>
);
void typedConfirmation;

const dialogOpenHandler = (event: WgDialogOpenEvent): void => {
  const dialog: WgDialogElement = event.currentTarget;
  const dialogId: string = event.detail.dialogId;
  void dialog;
  void dialogId;
};

const dialogCloseHandler = (event: WgDialogCloseEvent): void => {
  const reason: 'close-control' | 'escape' | 'programmatic' = event.detail.reason;
  void reason;
};

const typedDialog = (
  <WgDialog
    ref={dialogRef}
    dialogId="record-details"
    closeLabel="Close details"
    initialFocus="first-interactive"
    size="wide"
    onWgDialogOpen={dialogOpenHandler}
    onWgDialogClose={dialogCloseHandler}
  >
    <h2 slot="heading">Record details</h2>
    <p>Application-authored content.</p>
    <button slot="actions" type="button">
      Save
    </button>
  </WgDialog>
);

const mediaViewerOpenHandler = (event: WgMediaViewerOpenEvent): void => {
  const viewer: WgMediaViewerElement = event.currentTarget;
  const viewerId: string = event.detail.viewerId;
  void viewer;
  void viewerId;
};

const mediaViewerCloseHandler = (event: WgMediaViewerCloseEvent): void => {
  const reason: 'close-control' | 'escape' | 'programmatic' = event.detail.reason;
  void reason;
};

const mediaViewChangeHandler = (event: WgMediaViewChangeEvent): void => {
  const view: 'fit' | 'actual-size' | 'zoomed' = event.detail.view;
  const scale: number = event.detail.scale;
  void view;
  void scale;
};

const typedMediaViewer = (
  <WgMediaViewer
    ref={mediaViewerRef}
    viewerId="asset-image"
    state="ready"
    initialView="fit"
    closeLabel="Close image"
    zoomInLabel="Zoom in"
    zoomOutLabel="Zoom out"
    fitLabel="Fit image"
    actualSizeLabel="Actual size"
    onWgMediaViewerOpen={mediaViewerOpenHandler}
    onWgMediaViewerClose={mediaViewerCloseHandler}
    onWgMediaViewChange={mediaViewChangeHandler}
  >
    <h2 slot="heading">Asset identification image</h2>
    <p slot="context">Use the label beside the lower access panel.</p>
    <img src="/asset.webp" width={1200} height={900} alt="Asset identification view" />
    <p slot="caption">Captured July 30.</p>
    <p slot="loading">Loading image…</p>
    <p slot="unavailable">Image unavailable. Use the lower access panel.</p>
  </WgMediaViewer>
);

const typedFormFoundation = (
  <WgFormGroup>
    <label htmlFor="account-email">
      <WgFieldLabel>
        Email address
        <span slot="requirement">Required</span>
      </WgFieldLabel>
    </label>
    <input
      id="account-email"
      name="email"
      type="email"
      required
      aria-describedby="account-email-help"
    />
    <WgFieldMessage id="account-email-help" kind="help">
      Used for account notices.
    </WgFieldMessage>
  </WgFormGroup>
);

// @ts-expect-error Message kind is a closed presentation vocabulary.
const invalidFieldMessageKind = <WgFieldMessage kind="warning" />;

// @ts-expect-error Condition names are closed semantic vocabulary.
const invalidCondition = <WgMetric condition="healthy" />;

// @ts-expect-error Trend direction is a closed comparison vocabulary.
const invalidTrendDirection = <WgTrendIndicator direction="improving" />;

// @ts-expect-error Boolean element properties remain Boolean in React.
const invalidPending = <WgButton pending="true" />;

// @ts-expect-error Confirmation attention is an explicit closed vocabulary.
const invalidConfirmationAttention = <WgConfirmationDialog attention="urgent" />;

// @ts-expect-error Dialog size is a closed content-capacity vocabulary.
const invalidDialogSize = <WgDialog size="fullscreen" />;

// @ts-expect-error Media-viewer state is resource presentation, not condition.
const invalidMediaViewerState = <WgMediaViewer state="critical" />;

// @ts-expect-error Activation is a closed interaction vocabulary.
const invalidActivation = <WgTabs activation="lazy" />;

// @ts-expect-error Disabled remains Boolean in React.
const invalidTabDisabled = <WgTab disabled="true" />;

// @ts-expect-error Surface tone is a closed neutral vocabulary.
const invalidSurfaceTone = <WgSurface tone="critical" />;

// @ts-expect-error Decorative remains Boolean in React.
const invalidDividerDecorative = <WgDivider decorative="true" />;

// @ts-expect-error Layout spacing is a closed semantic vocabulary.
const invalidLayoutSpace = <WgStack space="large" />;

// @ts-expect-error Cluster alignment is a closed logical vocabulary.
const invalidClusterAlignment = <WgCluster align="top" />;

// @ts-expect-error Split ratio is a closed prominence vocabulary.
const invalidSplitRatio = <WgSplit ratio="golden" />;

// @ts-expect-error Scroll axis is a closed logical vocabulary.
const invalidScrollAxis = <WgScrollRegion axis="vertical" />;

// @ts-expect-error Media aspect is a closed content-capacity vocabulary.
const invalidMediaAspect = <WgMedia aspect="cinematic" />;

// @ts-expect-error Media state is resource presentation, not condition.
const invalidMediaState = <WgMedia state="critical" />;

// @ts-expect-error Request state is a closed vocabulary.
const invalidRequestState = <WgToggle requestState="working" />;

// @ts-expect-error Navigation orientation is a closed vocabulary.
const invalidNavigationOrientation = <WgNavigationRail orientation="diagonal" />;

// @ts-expect-error Menu placement is a closed logical vocabulary.
const invalidMenuPlacement = <WgMenu placement="bottom-right" />;

// @ts-expect-error Command disabled state remains Boolean.
const invalidCommandDisabled = <WgCommandItem value="refresh" disabled="true" />;

void typedComposition;
void typedScalarData;
void typedProvider;
void typedLayouts;
void typedMedia;
void typedTabs;
void typedControls;
void typedMenu;
void typedTransientFeedback;
void typedDialog;
void typedMediaViewer;
void typedFormFoundation;
void invalidFieldMessageKind;
void invalidCondition;
void invalidTrendDirection;
void invalidPending;
void invalidConfirmationAttention;
void invalidDialogSize;
void invalidMediaViewerState;
void invalidActivation;
void invalidTabDisabled;
void invalidSurfaceTone;
void invalidDividerDecorative;
void invalidLayoutSpace;
void invalidClusterAlignment;
void invalidSplitRatio;
void invalidScrollAxis;
void invalidMediaAspect;
void invalidMediaState;
void invalidRequestState;
void invalidNavigationOrientation;
void invalidMenuPlacement;
void invalidCommandDisabled;
