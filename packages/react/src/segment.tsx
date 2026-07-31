import { createComponent } from '@lit/react';
import {
  defineWgSegment,
  WgSegment as WgSegmentElement,
  wgSegmentTagName,
} from '@wayglass/elements/segment';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgSegment);
export const WgSegment = createComponent({
  react: React,
  tagName: wgSegmentTagName,
  elementClass: WgSegmentElement,
  displayName: 'WgSegment',
});
export type WgSegmentProps = ComponentProps<typeof WgSegment>;
