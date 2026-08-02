import { createComponent } from '@lit/react';
import {
  defineWgNumberField,
  WgNumberField as WgNumberFieldElement,
  wgNumberFieldTagName,
} from '@wayglass/elements/number-field';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgNumberField);
export const WgNumberField = createComponent({
  react: React,
  tagName: wgNumberFieldTagName,
  elementClass: WgNumberFieldElement,
  displayName: 'WgNumberField',
});
export type WgNumberFieldProps = ComponentProps<typeof WgNumberField>;
