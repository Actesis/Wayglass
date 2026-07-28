import { createComponent } from '@lit/react';
import type { EventName } from '@lit/react';
import {
  defineWgThemeProvider,
  WgThemeProvider as WgThemeProviderElement,
  wgThemeProviderTagName,
} from '@wayglass/elements/theme-provider';
import type { WgThemeChangeDetail } from '@wayglass/elements/theme-provider';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';
import type { WayglassCustomEvent } from './types.js';

registerElement(defineWgThemeProvider);

export type WgThemeChangeEvent = WayglassCustomEvent<WgThemeProviderElement, WgThemeChangeDetail>;

export const WgThemeProvider = createComponent({
  react: React,
  tagName: wgThemeProviderTagName,
  elementClass: WgThemeProviderElement,
  events: {
    onWgThemeChange: 'wg-theme-change' as EventName<WgThemeChangeEvent>,
  },
  displayName: 'WgThemeProvider',
});

export type WgThemeProviderProps = ComponentProps<typeof WgThemeProvider>;
