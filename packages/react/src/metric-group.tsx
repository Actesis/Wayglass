import { createComponent } from '@lit/react';
import {
  defineWgMetricGroup,
  WgMetricGroup as WgMetricGroupElement,
  wgMetricGroupTagName,
} from '@wayglass/elements/metric-group';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgMetricGroup);

export const WgMetricGroup = createComponent({
  react: React,
  tagName: wgMetricGroupTagName,
  elementClass: WgMetricGroupElement,
  displayName: 'WgMetricGroup',
});

export type WgMetricGroupProps = ComponentProps<typeof WgMetricGroup>;
