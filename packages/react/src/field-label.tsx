import { createComponent } from '@lit/react';
import {
  defineWgFieldLabel,
  WgFieldLabel as WgFieldLabelElement,
  wgFieldLabelTagName,
} from '@wayglass/elements/field-label';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgFieldLabel);
export const WgFieldLabel = createComponent({
  react: React,
  tagName: wgFieldLabelTagName,
  elementClass: WgFieldLabelElement,
  displayName: 'WgFieldLabel',
});
export type WgFieldLabelProps = ComponentProps<typeof WgFieldLabel>;
