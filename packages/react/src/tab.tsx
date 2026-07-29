import { createComponent } from '@lit/react';
import { defineWgTab, WgTab as WgTabElement, wgTabTagName } from '@wayglass/elements/tab';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgTab);

export const WgTab = createComponent({
  react: React,
  tagName: wgTabTagName,
  elementClass: WgTabElement,
  displayName: 'WgTab',
});

export type WgTabProps = ComponentProps<typeof WgTab>;
