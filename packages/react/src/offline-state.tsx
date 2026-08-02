import { createComponent } from '@lit/react';
import {
  defineWgOfflineState,
  WgOfflineState as WgOfflineStateElement,
  wgOfflineStateTagName,
} from '@wayglass/elements/offline-state';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgOfflineState);

export const WgOfflineState = createComponent({
  react: React,
  tagName: wgOfflineStateTagName,
  elementClass: WgOfflineStateElement,
  displayName: 'WgOfflineState',
});

export type WgOfflineStateProps = ComponentProps<typeof WgOfflineState>;
