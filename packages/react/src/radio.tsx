import { createComponent } from '@lit/react';
import { defineWgRadio, WgRadio as WgRadioElement, wgRadioTagName } from '@wayglass/elements/radio';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgRadio);
export const WgRadio = createComponent({
  react: React,
  tagName: wgRadioTagName,
  elementClass: WgRadioElement,
  displayName: 'WgRadio',
});
export type WgRadioProps = ComponentProps<typeof WgRadio>;
