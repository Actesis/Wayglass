import { createComponent } from '@lit/react';
import {
  defineWgDataTable,
  WgDataTable as WgDataTableElement,
  wgDataTableTagName,
} from '@wayglass/elements/data-table';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgDataTable);

export const WgDataTable = createComponent({
  react: React,
  tagName: wgDataTableTagName,
  elementClass: WgDataTableElement,
  displayName: 'WgDataTable',
});

export type WgDataTableProps = ComponentProps<typeof WgDataTable>;
