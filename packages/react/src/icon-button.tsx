import { createComponent } from '@lit/react';
import {
  defineWgIconButton,
  WgIconButton as WgIconButtonElement,
  wgIconButtonTagName,
} from '@wayglass/elements/icon-button';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgIconButton);

export const WgIconButton = createComponent({
  react: React,
  tagName: wgIconButtonTagName,
  elementClass: WgIconButtonElement,
  displayName: 'WgIconButton',
});

export type WgIconButtonProps = ComponentProps<typeof WgIconButton>;
