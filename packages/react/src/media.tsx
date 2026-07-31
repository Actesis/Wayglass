import { createComponent } from '@lit/react';
import { defineWgMedia, WgMedia as WgMediaElement, wgMediaTagName } from '@wayglass/elements/media';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgMedia);

export const WgMedia = createComponent({
  react: React,
  tagName: wgMediaTagName,
  elementClass: WgMediaElement,
  displayName: 'WgMedia',
});

export type WgMediaProps = ComponentProps<typeof WgMedia>;
