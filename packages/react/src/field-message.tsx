import { createComponent } from '@lit/react';
import {
  defineWgFieldMessage,
  WgFieldMessage as WgFieldMessageElement,
  wgFieldMessageTagName,
} from '@wayglass/elements/field-message';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgFieldMessage);
export const WgFieldMessage = createComponent({
  react: React,
  tagName: wgFieldMessageTagName,
  elementClass: WgFieldMessageElement,
  displayName: 'WgFieldMessage',
});
export type WgFieldMessageProps = ComponentProps<typeof WgFieldMessage>;
