import { createComponent } from '@lit/react';
import {
  defineWgEventLog,
  WgEventLog as WgEventLogElement,
  wgEventLogTagName,
} from '@wayglass/elements/event-log';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgEventLog);

export const WgEventLog = createComponent({
  react: React,
  tagName: wgEventLogTagName,
  elementClass: WgEventLogElement,
  displayName: 'WgEventLog',
});

export type WgEventLogProps = ComponentProps<typeof WgEventLog>;
