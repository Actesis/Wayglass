import { createComponent } from '@lit/react';
import {
  defineWgFormGroup,
  WgFormGroup as WgFormGroupElement,
  wgFormGroupTagName,
} from '@wayglass/elements/form-group';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgFormGroup);
export const WgFormGroup = createComponent({
  react: React,
  tagName: wgFormGroupTagName,
  elementClass: WgFormGroupElement,
  displayName: 'WgFormGroup',
});
export type WgFormGroupProps = ComponentProps<typeof WgFormGroup>;
