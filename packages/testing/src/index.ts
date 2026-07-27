export const wayglassViewports = Object.freeze({
  phone: { width: 390, height: 844 },
  tablet: { width: 834, height: 1112 },
  desktop: { width: 1440, height: 900 },
  wall: { width: 1920, height: 1080 },
});

export type WayglassViewport = keyof typeof wayglassViewports;
