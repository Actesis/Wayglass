import { createComponent } from '@lit/react';
import {
  defineWgCluster,
  WgCluster as WgClusterElement,
  wgClusterTagName,
} from '@wayglass/elements/cluster';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgCluster);

export const WgCluster = createComponent({
  react: React,
  tagName: wgClusterTagName,
  elementClass: WgClusterElement,
  displayName: 'WgCluster',
});

export type WgClusterProps = ComponentProps<typeof WgCluster>;
