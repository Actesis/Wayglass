import { createComponent } from '@lit/react';
import type { EventName } from '@lit/react';
import { defineWgTabs, WgTabs as WgTabsElement, wgTabsTagName } from '@wayglass/elements/tabs';
import type { WgTabChangeDetail } from '@wayglass/elements/tabs';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';
import type { WayglassCustomEvent } from './types.js';

registerElement(defineWgTabs);

export type WgTabChangeEvent = WayglassCustomEvent<WgTabsElement, WgTabChangeDetail>;

export const WgTabs = createComponent({
  react: React,
  tagName: wgTabsTagName,
  elementClass: WgTabsElement,
  events: {
    onWgTabChange: 'wg-tab-change' as EventName<WgTabChangeEvent>,
  },
  displayName: 'WgTabs',
});

export type WgTabsProps = ComponentProps<typeof WgTabs>;
