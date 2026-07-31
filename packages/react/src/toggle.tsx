import { createComponent } from '@lit/react';
import type { EventName } from '@lit/react';
import {
  defineWgToggle,
  WgToggle as WgToggleElement,
  wgToggleTagName,
} from '@wayglass/elements/toggle';
import type { WgToggleRequestDetail } from '@wayglass/elements/toggle';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';
import type { WayglassCustomEvent } from './types.js';

registerElement(defineWgToggle);

export type WgToggleRequestEvent = WayglassCustomEvent<WgToggleElement, WgToggleRequestDetail>;
export const WgToggle = createComponent({
  react: React,
  tagName: wgToggleTagName,
  elementClass: WgToggleElement,
  events: {
    onWgToggleRequest: 'wg-toggle-request' as EventName<WgToggleRequestEvent>,
  },
  displayName: 'WgToggle',
});

export type WgToggleProps = ComponentProps<typeof WgToggle>;
