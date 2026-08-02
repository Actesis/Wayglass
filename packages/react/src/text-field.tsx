import { createComponent } from '@lit/react';
import {
  defineWgTextField,
  WgTextField as WgTextFieldElement,
  wgTextFieldTagName,
} from '@wayglass/elements/text-field';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgTextField);
export const WgTextField = createComponent({
  react: React,
  tagName: wgTextFieldTagName,
  elementClass: WgTextFieldElement,
  displayName: 'WgTextField',
});
export type WgTextFieldProps = ComponentProps<typeof WgTextField>;
