import { createComponent } from '@lit/react';
import {
  defineWgKeyValue,
  WgKeyValue as WgKeyValueElement,
  wgKeyValueTagName,
} from '@wayglass/elements/key-value';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgKeyValue);

export const WgKeyValue = createComponent({
  react: React,
  tagName: wgKeyValueTagName,
  elementClass: WgKeyValueElement,
  displayName: 'WgKeyValue',
});

export type WgKeyValueProps = ComponentProps<typeof WgKeyValue>;
