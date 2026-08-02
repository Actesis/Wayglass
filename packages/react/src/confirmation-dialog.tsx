import { createComponent } from '@lit/react';
import type { EventName } from '@lit/react';
import {
  defineWgConfirmationDialog,
  WgConfirmationDialog as WgConfirmationDialogElement,
  type WgConfirmationActionDetail,
  type WgConfirmationCloseDetail,
  wgConfirmationDialogTagName,
} from '@wayglass/elements/confirmation-dialog';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';
import type { WayglassCustomEvent } from './types.js';

registerElement(defineWgConfirmationDialog);

export type WgConfirmationActionEvent = WayglassCustomEvent<
  WgConfirmationDialogElement,
  WgConfirmationActionDetail
>;
export type WgConfirmationCloseEvent = WayglassCustomEvent<
  WgConfirmationDialogElement,
  WgConfirmationCloseDetail
>;

export const WgConfirmationDialog = createComponent({
  react: React,
  tagName: wgConfirmationDialogTagName,
  elementClass: WgConfirmationDialogElement,
  events: {
    onWgConfirmationAction: 'wg-confirmation-action' as EventName<WgConfirmationActionEvent>,
    onWgConfirmationClose: 'wg-confirmation-close' as EventName<WgConfirmationCloseEvent>,
  },
  displayName: 'WgConfirmationDialog',
});

export type WgConfirmationDialogProps = ComponentProps<typeof WgConfirmationDialog>;
