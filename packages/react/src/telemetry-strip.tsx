import { createComponent } from '@lit/react';
import {
  defineWgTelemetryStrip,
  WgTelemetryStrip as WgTelemetryStripElement,
  wgTelemetryStripTagName,
} from '@wayglass/elements/telemetry-strip';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgTelemetryStrip);

export const WgTelemetryStrip = createComponent({
  react: React,
  tagName: wgTelemetryStripTagName,
  elementClass: WgTelemetryStripElement,
  displayName: 'WgTelemetryStrip',
});

export type WgTelemetryStripProps = ComponentProps<typeof WgTelemetryStrip>;
