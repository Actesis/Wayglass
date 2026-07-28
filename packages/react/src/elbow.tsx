import { createComponent } from '@lit/react';
import { defineWgElbow, WgElbow as WgElbowElement, wgElbowTagName } from '@wayglass/elements/elbow';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgElbow);

export const WgElbow = createComponent({
  react: React,
  tagName: wgElbowTagName,
  elementClass: WgElbowElement,
  displayName: 'WgElbow',
});

export type WgElbowProps = ComponentProps<typeof WgElbow>;
