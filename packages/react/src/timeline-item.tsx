import { createComponent } from '@lit/react';
import {
  defineWgTimelineItem,
  WgTimelineItem as WgTimelineItemElement,
  wgTimelineItemTagName,
} from '@wayglass/elements/timeline-item';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgTimelineItem);

export const WgTimelineItem = createComponent({
  react: React,
  tagName: wgTimelineItemTagName,
  elementClass: WgTimelineItemElement,
  displayName: 'WgTimelineItem',
});

export type WgTimelineItemProps = ComponentProps<typeof WgTimelineItem>;
