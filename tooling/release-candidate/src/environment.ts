import { fail } from './error.ts';

const credentialNames = [
  /^(?:NODE_AUTH_TOKEN|NPM_TOKEN|NPM_AUTH_TOKEN)$/i,
  /^(?:GH|GITHUB)_(?:TOKEN|PAT)$/i,
  /^(?:CF|CLOUDFLARE)_(?:API_)?(?:TOKEN|KEY)$/i,
  /^(?:RELEASE|PUBLISH|REGISTRY)_(?:TOKEN|PASSWORD|SECRET|KEY)$/i,
  /^(?:NPM_CONFIG|npm_config)_(?:_?AUTH|_?AUTH_TOKEN|USERNAME|PASSWORD)$/,
];

export function assertNoReleaseCredentials(environment: NodeJS.ProcessEnv): void {
  const exposed = Object.keys(environment)
    .filter(
      (name) => environment[name] !== undefined && credentialNames.some((rule) => rule.test(name)),
    )
    .sort();
  if (exposed.length > 0) {
    fail('WG_RC_CREDENTIAL_EXPOSURE', `Release credentials are present: ${exposed.join(', ')}.`);
  }
}

export function assertSupportedNode(version: string): void {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (match === null) fail('WG_RC_UNSUPPORTED_NODE', `Cannot parse Node version ${version}.`);
  const [, majorText, minorText] = match;
  const major = Number(majorText);
  const minor = Number(minorText);
  if (major < 22 || major >= 27 || (major === 22 && minor < 13)) {
    fail('WG_RC_UNSUPPORTED_NODE', `Node ${version} is outside >=22.13.0 <27.`);
  }
}

export function offlineEnvironment(
  environment: NodeJS.ProcessEnv,
): Readonly<Record<string, string>> {
  assertNoReleaseCredentials(environment);
  const result = Object.fromEntries(
    Object.entries(environment).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
  return Object.freeze({
    ...result,
    CI: '1',
    FORCE_COLOR: '0',
    NO_COLOR: '1',
    PNPM_CONFIG_OFFLINE: 'true',
    TURBO_FORCE: 'true',
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    npm_config_ignore_scripts: 'true',
    npm_config_offline: 'true',
    npm_config_update_notifier: 'false',
  });
}
