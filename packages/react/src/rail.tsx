import { createComponent } from '@lit/react';
import { defineWgRail, WgRail as WgRailElement, wgRailTagName } from '@wayglass/elements/rail';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgRail);

export const WgRail = createComponent({
  react: React,
  tagName: wgRailTagName,
  elementClass: WgRailElement,
  displayName: 'WgRail',
});

export type WgRailProps = ComponentProps<typeof WgRail>;
