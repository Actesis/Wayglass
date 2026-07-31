import { createComponent } from '@lit/react';
import type { EventName } from '@lit/react';
import {
  defineWgSegmentedControl,
  WgSegmentedControl as WgSegmentedControlElement,
  wgSegmentedControlTagName,
} from '@wayglass/elements/segmented-control';
import type { WgSegmentChangeDetail } from '@wayglass/elements/segmented-control';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';
import type { WayglassCustomEvent } from './types.js';

registerElement(defineWgSegmentedControl);
export type WgSegmentChangeEvent = WayglassCustomEvent<
  WgSegmentedControlElement,
  WgSegmentChangeDetail
>;
export const WgSegmentedControl = createComponent({
  react: React,
  tagName: wgSegmentedControlTagName,
  elementClass: WgSegmentedControlElement,
  events: {
    onWgSegmentChange: 'wg-segment-change' as EventName<WgSegmentChangeEvent>,
  },
  displayName: 'WgSegmentedControl',
});
export type WgSegmentedControlProps = ComponentProps<typeof WgSegmentedControl>;
