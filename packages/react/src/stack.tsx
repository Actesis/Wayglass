import { createComponent } from '@lit/react';
import { defineWgStack, WgStack as WgStackElement, wgStackTagName } from '@wayglass/elements/stack';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgStack);

export const WgStack = createComponent({
  react: React,
  tagName: wgStackTagName,
  elementClass: WgStackElement,
  displayName: 'WgStack',
});

export type WgStackProps = ComponentProps<typeof WgStack>;
