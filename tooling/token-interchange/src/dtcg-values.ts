import type { TokenType } from '../../../packages/tokens/src/definitions.ts';

import type { NormalizedToken } from './normalize.ts';

export type DtcgType = Exclude<TokenType, 'fontSize'> | 'dimension';

export interface DtcgConversionSuccess {
  readonly ok: true;
  readonly type: DtcgType;
  readonly value: unknown;
}

export interface DtcgConversionFailure {
  readonly ok: false;
  readonly reason: string;
}

export type DtcgConversion = DtcgConversionSuccess | DtcgConversionFailure;

interface DtcgDimension {
  readonly value: number;
  readonly unit: 'px' | 'rem';
}

interface DtcgColor {
  readonly colorSpace: 'srgb';
  readonly components: readonly [number, number, number];
  readonly alpha?: number;
  readonly hex: string;
}

function failure(token: NormalizedToken, detail: string): DtcgConversionFailure {
  return { ok: false, reason: `${token.source}: ${detail}` };
}

function parseDimension(value: string): DtcgDimension | undefined {
  const match = /^(-?(?:\d+\.?\d*|\.\d+))(px|rem)$/.exec(value);
  if (!match) {
    return undefined;
  }

  const numericValue = Number(match[1]);
  const unit = match[2];
  return Number.isFinite(numericValue) && (unit === 'px' || unit === 'rem')
    ? { value: numericValue, unit }
    : undefined;
}

function parseZeroDimension(value: string, zeroUnit: 'px' | 'rem'): DtcgDimension | undefined {
  if (value === '0' || value === '-0') {
    return { value: 0, unit: zeroUnit };
  }

  return parseDimension(value);
}

function hexColor(value: string): DtcgColor | undefined {
  if (!/^#[\da-f]{6}$/i.test(value)) {
    return undefined;
  }

  const hex = value.toLowerCase();
  return {
    colorSpace: 'srgb',
    components: [
      Number.parseInt(hex.slice(1, 3), 16) / 255,
      Number.parseInt(hex.slice(3, 5), 16) / 255,
      Number.parseInt(hex.slice(5, 7), 16) / 255,
    ],
    hex,
  };
}

function rgbColor(value: string): DtcgColor | undefined {
  const match = /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*(\d+(?:\.\d+)?)%\s*\)$/i.exec(value);
  if (!match) {
    return undefined;
  }

  const channels = [match[1], match[2], match[3]].map(Number);
  const alpha = Number(match[4]) / 100;
  if (channels.some((channel) => channel < 0 || channel > 255) || alpha < 0 || alpha > 1) {
    return undefined;
  }

  const [red = 0, green = 0, blue = 0] = channels;
  return {
    colorSpace: 'srgb',
    components: [red / 255, green / 255, blue / 255],
    alpha,
    hex: `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`,
  };
}

function parseColor(value: string): DtcgColor | undefined {
  return hexColor(value) ?? rgbColor(value);
}

function parseFontFamilies(value: string): readonly string[] | undefined {
  const families: string[] = [];
  let current = '';
  let quote: '"' | "'" | undefined;

  for (const character of value) {
    if ((character === '"' || character === "'") && !quote) {
      quote = character;
      continue;
    }
    if (character === quote) {
      quote = undefined;
      continue;
    }
    if (character === ',' && !quote) {
      const family = current.trim();
      if (!family) {
        return undefined;
      }
      families.push(family);
      current = '';
      continue;
    }
    current += character;
  }

  if (quote) {
    return undefined;
  }

  const finalFamily = current.trim();
  if (!finalFamily) {
    return undefined;
  }
  families.push(finalFamily);
  return families;
}

function parseShadow(value: string): unknown | undefined {
  const colorStart = value.search(/(?:rgb\(|#[\da-f]{6}$)/i);
  if (colorStart < 0) {
    return undefined;
  }

  const dimensions = value.slice(0, colorStart).trim().split(/\s+/);
  if (dimensions.length < 3 || dimensions.length > 4) {
    return undefined;
  }

  const parsedNonzero = dimensions.map(parseDimension).find(Boolean);
  const zeroUnit = parsedNonzero?.unit ?? 'px';
  const [offsetXValue = '', offsetYValue = '', blurValue = '', spreadValue = '0'] = dimensions;
  const [offsetX, offsetY, blur, spread] = [offsetXValue, offsetYValue, blurValue, spreadValue].map(
    (dimension) => parseZeroDimension(dimension, zeroUnit),
  );
  const color = parseColor(value.slice(colorStart));
  if (!offsetX || !offsetY || !blur || !spread || !color) {
    return undefined;
  }

  return { color, offsetX, offsetY, blur, spread };
}

export function convertDtcgValue(token: NormalizedToken): DtcgConversion {
  if (token.alias) {
    return {
      ok: true,
      type: token.type === 'fontSize' ? 'dimension' : token.type,
      value: `{${token.alias.exchangePath.join('.')}}`,
    };
  }

  switch (token.type) {
    case 'color': {
      const value = typeof token.value === 'string' ? parseColor(token.value) : undefined;
      return value ? { ok: true, type: 'color', value } : failure(token, 'unsupported color value');
    }
    case 'dimension':
    case 'fontSize': {
      const value = typeof token.value === 'string' ? parseDimension(token.value) : undefined;
      return value
        ? { ok: true, type: 'dimension', value }
        : failure(
            token,
            `DTCG 2025.10 dimensions support only px and rem, received ${String(token.value)}`,
          );
    }
    case 'duration': {
      const match =
        typeof token.value === 'string'
          ? /^(-?(?:\d+\.?\d*|\.\d+))(ms|s)$/.exec(token.value)
          : undefined;
      const value = match ? Number(match[1]) : Number.NaN;
      return match && Number.isFinite(value) && value >= 0
        ? { ok: true, type: 'duration', value: { value, unit: match[2] } }
        : failure(token, 'unsupported duration value');
    }
    case 'fontFamily': {
      const value = typeof token.value === 'string' ? parseFontFamilies(token.value) : undefined;
      return value
        ? { ok: true, type: 'fontFamily', value }
        : failure(token, 'unsupported font-family list');
    }
    case 'fontWeight':
      return typeof token.value === 'number' && token.value >= 1 && token.value <= 1000
        ? { ok: true, type: 'fontWeight', value: token.value }
        : failure(token, 'font weight must be between 1 and 1000');
    case 'number':
      return typeof token.value === 'number' && Number.isFinite(token.value)
        ? { ok: true, type: 'number', value: token.value }
        : failure(token, 'number must be finite');
    case 'cubicBezier': {
      const value = token.value;
      return Array.isArray(value) &&
        value[0] >= 0 &&
        value[0] <= 1 &&
        value[2] >= 0 &&
        value[2] <= 1
        ? { ok: true, type: 'cubicBezier', value }
        : failure(token, 'cubic Bézier x coordinates must be between 0 and 1');
    }
    case 'shadow': {
      const value = typeof token.value === 'string' ? parseShadow(token.value) : undefined;
      return value
        ? { ok: true, type: 'shadow', value }
        : failure(token, 'unsupported shadow value');
    }
  }
}
