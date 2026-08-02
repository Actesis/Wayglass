import type { WgButton as WgButtonElement } from '@wayglass/elements/button';
import type { WgSurface as WgSurfaceElement } from '@wayglass/elements/surface';
import type { WgSplit as WgSplitElement } from '@wayglass/elements/split';
import type { WgMedia as WgMediaElement } from '@wayglass/elements/media';
import type { WgMenu as WgMenuElement } from '@wayglass/elements/menu';
import type { WgTab as WgTabElement, WgTabs as WgTabsElement } from '@wayglass/elements/tabs';
import type { WgThemeProvider as WgThemeProviderElement } from '@wayglass/elements/theme-provider';
import type { WgToggle as WgToggleElement } from '@wayglass/elements/toggle';
import { createRef } from 'react';

import {
  WgBooleanValue,
  WgButton,
  WgDivider,
  WgCluster,
  WgCommandItem,
  WgFrame,
  WgFieldLabel,
  WgFieldMessage,
  WgFormGroup,
  WgGrid,
  WgIconButton,
  WgMedia,
  WgMenu,
  WgMetric,
  WgNavigationRail,
  WgScrollRegion,
  WgSegment,
  WgSegmentedControl,
  WgSplit,
  WgStack,
  WgSurface,
  WgTab,
  WgTabList,
  WgTabPanel,
  WgTabs,
  WgThemeProvider,
  WgToggle,
  WgValueTile,
} from '../src/index.js';
import type {
  WgSegmentChangeEvent,
  WgCommandEvent,
  WgMenuToggleEvent,
  WgTabChangeEvent,
  WgThemeChangeEvent,
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

// @ts-expect-error Boolean element properties remain Boolean in React.
const invalidPending = <WgButton pending="true" />;

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
void typedProvider;
void typedLayouts;
void typedMedia;
void typedTabs;
void typedControls;
void typedMenu;
void typedFormFoundation;
void invalidFieldMessageKind;
void invalidCondition;
void invalidPending;
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
