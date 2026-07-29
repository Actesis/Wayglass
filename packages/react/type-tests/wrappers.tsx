import type { WgButton as WgButtonElement } from '@wayglass/elements/button';
import type { WgTab as WgTabElement, WgTabs as WgTabsElement } from '@wayglass/elements/tabs';
import type { WgThemeProvider as WgThemeProviderElement } from '@wayglass/elements/theme-provider';
import { createRef } from 'react';

import {
  WgBooleanValue,
  WgButton,
  WgMetric,
  WgTab,
  WgTabList,
  WgTabPanel,
  WgTabs,
  WgThemeProvider,
  WgValueTile,
} from '../src/index.js';
import type { WgTabChangeEvent, WgThemeChangeEvent } from '../src/index.js';

const buttonRef = createRef<WgButtonElement>();
const providerRef = createRef<WgThemeProviderElement>();
const tabRef = createRef<WgTabElement>();
const tabsRef = createRef<WgTabsElement>();

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
  </WgThemeProvider>
);

const eventHandler = (event: WgThemeChangeEvent): void => {
  const provider: WgThemeProviderElement = event.currentTarget;
  const resolvedTheme: 'wayglass-dark' | 'wayglass-light' = event.detail.resolvedTheme;
  void provider;
  void resolvedTheme;
};

const typedProvider = <WgThemeProvider onWgThemeChange={eventHandler} />;

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

void typedComposition;
void typedProvider;
void typedTabs;
void invalidCondition;
void invalidPending;
void invalidActivation;
void invalidTabDisabled;
