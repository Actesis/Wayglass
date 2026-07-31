import { createComponent } from '@lit/react';
import type { EventName } from '@lit/react';
import { defineWgMenu, WgMenu as WgMenuElement, wgMenuTagName } from '@wayglass/elements/menu';
import type { WgMenuToggleDetail } from '@wayglass/elements/menu';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';
import type { WayglassCustomEvent } from './types.js';

registerElement(defineWgMenu);

export type WgMenuToggleEvent = WayglassCustomEvent<WgMenuElement, WgMenuToggleDetail>;
export const WgMenu = createComponent({
  react: React,
  tagName: wgMenuTagName,
  elementClass: WgMenuElement,
  events: {
    onWgMenuToggle: 'wg-menu-toggle' as EventName<WgMenuToggleEvent>,
  },
  displayName: 'WgMenu',
});

export type WgMenuProps = ComponentProps<typeof WgMenu>;
