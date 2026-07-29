import type { WgButton as WgButtonElement } from '@wayglass/elements/button';
import type { WgSurface as WgSurfaceElement } from '@wayglass/elements/surface';
import type { WgSplit as WgSplitElement } from '@wayglass/elements/split';
import type { WgTab as WgTabElement, WgTabs as WgTabsElement } from '@wayglass/elements/tabs';
import type { WgThemeProvider as WgThemeProviderElement } from '@wayglass/elements/theme-provider';
import { createRef } from 'react';

import {
  WgBooleanValue,
  WgButton,
  WgDivider,
  WgCluster,
  WgFrame,
  WgGrid,
  WgMetric,
  WgScrollRegion,
  WgSplit,
  WgStack,
  WgSurface,
  WgTab,
  WgTabList,
  WgTabPanel,
  WgTabs,
  WgThemeProvider,
  WgValueTile,
} from '../src/index.js';
import type { WgTabChangeEvent, WgThemeChangeEvent } from '../src/index.js';

const buttonRef = createRef<WgButtonElement>();
const surfaceRef = createRef<WgSurfaceElement>();
const providerRef = createRef<WgThemeProviderElement>();
const tabRef = createRef<WgTabElement>();
const tabsRef = createRef<WgTabsElement>();
const splitRef = createRef<WgSplitElement>();

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

void typedComposition;
void typedProvider;
void typedLayouts;
void typedTabs;
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
