import { createComponent } from '@lit/react';
import {
  defineWgSkeleton,
  WgSkeleton as WgSkeletonElement,
  wgSkeletonTagName,
} from '@wayglass/elements/skeleton';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgSkeleton);

export const WgSkeleton = createComponent({
  react: React,
  tagName: wgSkeletonTagName,
  elementClass: WgSkeletonElement,
  displayName: 'WgSkeleton',
});

export type WgSkeletonProps = ComponentProps<typeof WgSkeleton>;
