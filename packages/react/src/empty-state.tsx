import { createComponent } from '@lit/react';
import {
  defineWgEmptyState,
  WgEmptyState as WgEmptyStateElement,
  wgEmptyStateTagName,
} from '@wayglass/elements/empty-state';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgEmptyState);

export const WgEmptyState = createComponent({
  react: React,
  tagName: wgEmptyStateTagName,
  elementClass: WgEmptyStateElement,
  displayName: 'WgEmptyState',
});

export type WgEmptyStateProps = ComponentProps<typeof WgEmptyState>;
