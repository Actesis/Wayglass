import type { WgButton as WgButtonElement } from '@wayglass/elements/button';
import type { WgThemeProvider as WgThemeProviderElement } from '@wayglass/elements/theme-provider';
import { createRef } from 'react';

import { WgBooleanValue, WgButton, WgMetric, WgThemeProvider, WgValueTile } from '../src/index.js';
import type { WgThemeChangeEvent } from '../src/index.js';

const buttonRef = createRef<WgButtonElement>();
const providerRef = createRef<WgThemeProviderElement>();

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

// @ts-expect-error Condition names are closed semantic vocabulary.
const invalidCondition = <WgMetric condition="healthy" />;

// @ts-expect-error Boolean element properties remain Boolean in React.
const invalidPending = <WgButton pending="true" />;

void typedComposition;
void typedProvider;
void invalidCondition;
void invalidPending;
