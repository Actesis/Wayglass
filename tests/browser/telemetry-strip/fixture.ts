import {
  defineWgTelemetryStrip,
  type TelemetrySample,
  type WgTelemetryStrip,
} from '/packages/elements/src/telemetry-strip.ts';

const start = Date.parse('2026-08-09T18:00:00Z');
const end = Date.parse('2026-08-09T19:00:00Z');

export function createTelemetrySamples(offset = 0): readonly TelemetrySample[] {
  const samples: TelemetrySample[] = [];
  for (let index = 0; index < 240; index += 1) {
    const progress = index / 239;
    const observedAt =
      index === 111
        ? samples[110]!.observedAt
        : start + Math.round(progress ** 1.08 * (end - start));
    let knowledge: TelemetrySample['knowledge'] = 'confirmed';
    if (index >= 40 && index < 70) knowledge = 'inferred';
    if (index >= 70 && index < 100) knowledge = 'stale';
    if (index >= 100 && index < 130) knowledge = 'conflicting';
    if (index === 145 || index === 146) knowledge = 'unknown';
    if (index === 185 || index === 186 || index === 187) knowledge = 'unavailable';
    const gap = knowledge === 'unknown' || knowledge === 'unavailable' || index === 25;
    samples.push({
      observedAt,
      value: gap ? null : 22 + Math.sin((index + offset) / 12) * 7 + ((index + offset) % 9) / 3,
      knowledge,
    });
  }
  return samples;
}

declare global {
  interface Window {
    createTelemetrySamples: typeof createTelemetrySamples;
    telemetryStart: number;
    telemetryEnd: number;
  }
}

window.createTelemetrySamples = createTelemetrySamples;
window.telemetryStart = start;
window.telemetryEnd = end;

const parameters = new URLSearchParams(window.location.search);
const strip = document.querySelector<WgTelemetryStrip>('#history')!;
strip.windowStart = start;
strip.windowEnd = end;
strip.scaleMinimum = 0;
strip.scaleMaximum = 40;
strip.samples = createTelemetrySamples();
document.body.dataset.theme = parameters.get('theme') ?? 'wayglass-dark';
document.body.dataset.density = parameters.get('density') ?? 'compact';
if (parameters.get('dir') === 'rtl') document.documentElement.dir = 'rtl';
if (parameters.get('upgrade') !== 'false') defineWgTelemetryStrip();
