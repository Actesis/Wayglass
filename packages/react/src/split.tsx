import { createComponent } from '@lit/react';
import { defineWgSplit, WgSplit as WgSplitElement, wgSplitTagName } from '@wayglass/elements/split';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgSplit);

export const WgSplit = createComponent({
  react: React,
  tagName: wgSplitTagName,
  elementClass: WgSplitElement,
  displayName: 'WgSplit',
});

export type WgSplitProps = ComponentProps<typeof WgSplit>;
