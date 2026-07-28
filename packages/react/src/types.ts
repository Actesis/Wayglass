export type WayglassCustomEvent<TElement extends Element, TDetail> = CustomEvent<TDetail> & {
  readonly currentTarget: TElement;
};

export type WayglassEventHandler<TElement extends Element, TDetail> = (
  event: WayglassCustomEvent<TElement, TDetail>,
) => void;
