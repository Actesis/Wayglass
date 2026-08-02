import { createComponent } from '@lit/react';
import {
  defineWgStaleDataMarker,
  WgStaleDataMarker as WgStaleDataMarkerElement,
  wgStaleDataMarkerTagName,
} from '@wayglass/elements/stale-data-marker';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgStaleDataMarker);

export const WgStaleDataMarker = createComponent({
  react: React,
  tagName: wgStaleDataMarkerTagName,
  elementClass: WgStaleDataMarkerElement,
  displayName: 'WgStaleDataMarker',
});

export type WgStaleDataMarkerProps = ComponentProps<typeof WgStaleDataMarker>;
