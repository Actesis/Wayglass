import { createComponent } from '@lit/react';
import {
  defineWgButton,
  WgButton as WgButtonElement,
  wgButtonTagName,
} from '@wayglass/elements/button';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgButton);

export const WgButton = createComponent({
  react: React,
  tagName: wgButtonTagName,
  elementClass: WgButtonElement,
  displayName: 'WgButton',
});

export type WgButtonProps = ComponentProps<typeof WgButton>;
