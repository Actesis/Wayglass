import { createComponent } from '@lit/react';
import { defineWgAlert, WgAlert as WgAlertElement, wgAlertTagName } from '@wayglass/elements/alert';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgAlert);

export const WgAlert = createComponent({
  react: React,
  tagName: wgAlertTagName,
  elementClass: WgAlertElement,
  displayName: 'WgAlert',
});

export type WgAlertProps = ComponentProps<typeof WgAlert>;
