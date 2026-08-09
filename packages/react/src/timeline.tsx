import { createComponent } from '@lit/react';
import {
  defineWgTimeline,
  WgTimeline as WgTimelineElement,
  wgTimelineTagName,
} from '@wayglass/elements/timeline';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgTimeline);

export const WgTimeline = createComponent({
  react: React,
  tagName: wgTimelineTagName,
  elementClass: WgTimelineElement,
  displayName: 'WgTimeline',
});

export type WgTimelineProps = ComponentProps<typeof WgTimeline>;
