import { createComponent } from '@lit/react';
import type { EventName } from '@lit/react';
import {
  defineWgToast,
  WgToast as WgToastElement,
  type WgToastDismissDetail,
  wgToastTagName,
} from '@wayglass/elements/toast';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';
import type { WayglassCustomEvent } from './types.js';

registerElement(defineWgToast);

export type WgToastDismissEvent = WayglassCustomEvent<WgToastElement, WgToastDismissDetail>;

export const WgToast = createComponent({
  react: React,
  tagName: wgToastTagName,
  elementClass: WgToastElement,
  events: {
    onWgToastDismiss: 'wg-toast-dismiss' as EventName<WgToastDismissEvent>,
  },
  displayName: 'WgToast',
});

export type WgToastProps = ComponentProps<typeof WgToast>;
