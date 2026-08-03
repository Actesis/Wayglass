import { createComponent } from '@lit/react';
import type { EventName } from '@lit/react';
import {
  defineWgMediaViewer,
  WgMediaViewer as WgMediaViewerElement,
  type WgMediaViewChangeDetail,
  type WgMediaViewerCloseDetail,
  type WgMediaViewerDetail,
  wgMediaViewerTagName,
} from '@wayglass/elements/media-viewer';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';
import type { WayglassCustomEvent } from './types.js';

registerElement(defineWgMediaViewer);

export type WgMediaViewerOpenEvent = WayglassCustomEvent<WgMediaViewerElement, WgMediaViewerDetail>;
export type WgMediaViewerCloseEvent = WayglassCustomEvent<
  WgMediaViewerElement,
  WgMediaViewerCloseDetail
>;
export type WgMediaViewChangeEvent = WayglassCustomEvent<
  WgMediaViewerElement,
  WgMediaViewChangeDetail
>;

export const WgMediaViewer = createComponent({
  react: React,
  tagName: wgMediaViewerTagName,
  elementClass: WgMediaViewerElement,
  events: {
    onWgMediaViewerOpen: 'wg-media-viewer-open' as EventName<WgMediaViewerOpenEvent>,
    onWgMediaViewerClose: 'wg-media-viewer-close' as EventName<WgMediaViewerCloseEvent>,
    onWgMediaViewChange: 'wg-media-view-change' as EventName<WgMediaViewChangeEvent>,
  },
  displayName: 'WgMediaViewer',
});

export type WgMediaViewerProps = ComponentProps<typeof WgMediaViewer>;
