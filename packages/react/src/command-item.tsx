import { createComponent } from '@lit/react';
import type { EventName } from '@lit/react';
import {
  defineWgCommandItem,
  WgCommandItem as WgCommandItemElement,
  wgCommandItemTagName,
} from '@wayglass/elements/command-item';
import type { WgCommandDetail } from '@wayglass/elements/command-item';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';
import type { WayglassCustomEvent } from './types.js';

registerElement(defineWgCommandItem);

export type WgCommandEvent = WayglassCustomEvent<WgCommandItemElement, WgCommandDetail>;
export const WgCommandItem = createComponent({
  react: React,
  tagName: wgCommandItemTagName,
  elementClass: WgCommandItemElement,
  events: {
    onWgCommand: 'wg-command' as EventName<WgCommandEvent>,
  },
  displayName: 'WgCommandItem',
});

export type WgCommandItemProps = ComponentProps<typeof WgCommandItem>;
