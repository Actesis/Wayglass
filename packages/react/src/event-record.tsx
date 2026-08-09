import { createComponent } from '@lit/react';
import {
  defineWgEventRecord,
  WgEventRecord as WgEventRecordElement,
  wgEventRecordTagName,
} from '@wayglass/elements/event-record';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgEventRecord);

export const WgEventRecord = createComponent({
  react: React,
  tagName: wgEventRecordTagName,
  elementClass: WgEventRecordElement,
  displayName: 'WgEventRecord',
});

export type WgEventRecordProps = ComponentProps<typeof WgEventRecord>;
