import { createComponent } from '@lit/react';
import {
  defineWgStatusEntry,
  WgStatusEntry as WgStatusEntryElement,
  wgStatusEntryTagName,
} from '@wayglass/elements/status-entry';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgStatusEntry);

export const WgStatusEntry = createComponent({
  react: React,
  tagName: wgStatusEntryTagName,
  elementClass: WgStatusEntryElement,
  displayName: 'WgStatusEntry',
});

export type WgStatusEntryProps = ComponentProps<typeof WgStatusEntry>;
