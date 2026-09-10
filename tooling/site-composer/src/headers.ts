import { fail } from './error.ts';

export interface SiteHeaderRule {
  readonly pattern: string;
  readonly headers: readonly (readonly [name: string, value: string])[];
}

const HEADER_NAME = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
const PREVIEW_PATTERN = 'https://:version.:subdomain.workers.dev/*';

function validPattern(pattern: string): boolean {
  if (pattern === PREVIEW_PATTERN) return true;
  return pattern.startsWith('/') && !pattern.includes('://') && !pattern.includes('**');
}

export function parseSiteHeaders(source: string): readonly SiteHeaderRule[] {
  const rules: { pattern: string; headers: [string, string][] }[] = [];
  let current: { pattern: string; headers: [string, string][] } | undefined;

  for (const [index, rawLine] of source.replaceAll('\r\n', '\n').split('\n').entries()) {
    if (rawLine.length > 2_000) {
      fail('WG_SITE_HEADERS_LINE', `Header metadata line ${index + 1} exceeds 2,000 characters.`);
    }
    const trimmed = rawLine.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;
    if (/^\s/.test(rawLine)) {
      if (current === undefined) {
        fail('WG_SITE_HEADERS_RULE', `Header line ${index + 1} has no preceding rule.`);
      }
      const separator = trimmed.indexOf(':');
      const name = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (separator <= 0 || !HEADER_NAME.test(name) || name.startsWith('!') || value === '') {
        fail('WG_SITE_HEADERS_VALUE', `Header line ${index + 1} is malformed or unsupported.`);
      }
      if (/\p{Cc}/u.test(value)) {
        fail('WG_SITE_HEADERS_VALUE', `Header line ${index + 1} contains a control character.`);
      }
      current.headers.push([name, value]);
      continue;
    }
    if (!validPattern(trimmed)) {
      fail('WG_SITE_HEADERS_PATTERN', `Header rule on line ${index + 1} has an unsafe pattern.`);
    }
    current = { pattern: trimmed, headers: [] };
    rules.push(current);
    if (rules.length > 100) fail('WG_SITE_HEADERS_RULES', 'Header metadata exceeds 100 rules.');
  }

  if (rules.length === 0 || rules.some((rule) => rule.headers.length === 0)) {
    fail('WG_SITE_HEADERS_RULE', 'Every header rule must contain at least one header.');
  }
  return rules;
}

function pathPatternMatches(pattern: string, pathname: string): boolean {
  if (pattern.endsWith('*')) return pathname.startsWith(pattern.slice(0, -1));
  return pathname === pattern;
}

function previewPatternMatches(hostname: string): boolean {
  const labels = hostname.toLowerCase().split('.');
  return labels.length === 4 && labels[2] === 'workers' && labels[3] === 'dev';
}

export function appliedSiteHeaders(
  rules: readonly SiteHeaderRule[],
  url: URL,
): ReadonlyMap<string, string> {
  const values = new Map<string, { name: string; values: string[] }>();
  for (const rule of rules) {
    const matches =
      rule.pattern === PREVIEW_PATTERN
        ? previewPatternMatches(url.hostname)
        : pathPatternMatches(rule.pattern, url.pathname);
    if (!matches) continue;
    for (const [name, value] of rule.headers) {
      const key = name.toLowerCase();
      const existing = values.get(key);
      if (existing === undefined) values.set(key, { name, values: [value] });
      else existing.values.push(value);
    }
  }
  return new Map(
    [...values.values()].map(({ name, values: entries }) => [name, entries.join(', ')]),
  );
}
