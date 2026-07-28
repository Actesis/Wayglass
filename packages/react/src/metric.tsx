import { createComponent } from '@lit/react';
import {
  defineWgMetric,
  WgMetric as WgMetricElement,
  wgMetricTagName,
} from '@wayglass/elements/metric';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgMetric);

export const WgMetric = createComponent({
  react: React,
  tagName: wgMetricTagName,
  elementClass: WgMetricElement,
  displayName: 'WgMetric',
});

export type WgMetricProps = ComponentProps<typeof WgMetric>;
