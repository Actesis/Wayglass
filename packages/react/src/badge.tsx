import { createComponent } from '@lit/react';
import { defineWgBadge, WgBadge as WgBadgeElement, wgBadgeTagName } from '@wayglass/elements/badge';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgBadge);

export const WgBadge = createComponent({
  react: React,
  tagName: wgBadgeTagName,
  elementClass: WgBadgeElement,
  displayName: 'WgBadge',
});

export type WgBadgeProps = ComponentProps<typeof WgBadge>;
