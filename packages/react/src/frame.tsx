import { createComponent } from '@lit/react';
import { defineWgFrame, WgFrame as WgFrameElement, wgFrameTagName } from '@wayglass/elements/frame';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgFrame);

export const WgFrame = createComponent({
  react: React,
  tagName: wgFrameTagName,
  elementClass: WgFrameElement,
  displayName: 'WgFrame',
});

export type WgFrameProps = ComponentProps<typeof WgFrame>;
