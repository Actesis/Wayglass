import { createComponent } from '@lit/react';
import {
  defineWgBooleanValue,
  WgBooleanValue as WgBooleanValueElement,
  wgBooleanValueTagName,
} from '@wayglass/elements/boolean-value';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgBooleanValue);

export const WgBooleanValue = createComponent({
  react: React,
  tagName: wgBooleanValueTagName,
  elementClass: WgBooleanValueElement,
  displayName: 'WgBooleanValue',
});

export type WgBooleanValueProps = ComponentProps<typeof WgBooleanValue>;
