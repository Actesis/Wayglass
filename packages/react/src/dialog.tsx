import { createComponent } from '@lit/react';
import type { EventName } from '@lit/react';
import {
  defineWgDialog,
  WgDialog as WgDialogElement,
  type WgDialogCloseDetail,
  type WgDialogDetail,
  wgDialogTagName,
} from '@wayglass/elements/dialog';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';
import type { WayglassCustomEvent } from './types.js';

registerElement(defineWgDialog);

export type WgDialogOpenEvent = WayglassCustomEvent<WgDialogElement, WgDialogDetail>;
export type WgDialogCloseEvent = WayglassCustomEvent<WgDialogElement, WgDialogCloseDetail>;

export const WgDialog = createComponent({
  react: React,
  tagName: wgDialogTagName,
  elementClass: WgDialogElement,
  events: {
    onWgDialogOpen: 'wg-dialog-open' as EventName<WgDialogOpenEvent>,
    onWgDialogClose: 'wg-dialog-close' as EventName<WgDialogCloseEvent>,
  },
  displayName: 'WgDialog',
});

export type WgDialogProps = ComponentProps<typeof WgDialog>;
