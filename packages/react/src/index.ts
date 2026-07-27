import type { SyntheticEvent } from 'react';

export type WayglassEventHandler<TElement extends Element, TDetail> = (
  event: SyntheticEvent<TElement> & { nativeEvent: CustomEvent<TDetail> },
) => void;
