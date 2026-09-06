export type CandidateDirectory = 'core' | 'tokens' | 'themes' | 'elements' | 'icons' | 'react';

export type JsonPrimitive = boolean | number | string | null;
export type JsonValue =
  JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export interface CandidateSource {
  readonly directory: CandidateDirectory;
  readonly manifest: unknown;
}

export interface ProjectedManifest {
  readonly name: string;
  readonly version: string;
  readonly private: true;
  readonly description: string;
  readonly license: 'Apache-2.0';
  readonly author: JsonValue;
  readonly homepage: string;
  readonly repository: JsonValue;
  readonly bugs: JsonValue;
  readonly keywords: readonly string[];
  readonly publishConfig: JsonValue;
  readonly type: 'module';
  readonly sideEffects: boolean | readonly string[];
  readonly engines: JsonValue;
  readonly files: readonly string[];
  readonly exports: JsonValue;
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly peerDependencies?: Readonly<Record<string, string>>;
}

export interface PackageFile {
  readonly path: string;
  readonly bytes: Uint8Array;
  readonly kind?: 'file' | 'directory' | 'symlink' | 'socket';
}

export interface InspectedFile {
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface PackageInspection {
  readonly files: readonly InspectedFile[];
  readonly totalBytes: number;
  readonly inventorySha256: string;
}

export interface CommandRequest {
  readonly command: string;
  readonly arguments: readonly string[];
  readonly cwd: string;
  readonly environment?: Readonly<Record<string, string>>;
}

export interface CommandResult {
  readonly stdout: string;
  readonly stderr: string;
}

export type CommandRunner = (request: CommandRequest) => Promise<CommandResult>;

export interface PackedCandidate {
  readonly directory: CandidateDirectory;
  readonly name: string;
  readonly version: '0.1.0';
  readonly file: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly manifestSha256: string;
  readonly inventorySha256: string;
  readonly unpackedBytes: number;
  readonly files: readonly InspectedFile[];
}

export interface CandidateEvidence {
  readonly schemaVersion: 1;
  readonly source: {
    readonly commit: string;
    readonly tree: string;
    readonly lockfileSha256: string;
  };
  readonly tooling: {
    readonly commit: string;
    readonly tree: string;
  };
  readonly environment: {
    readonly platform: string;
    readonly architecture: string;
    readonly node: string;
    readonly pnpm: string;
    readonly npm: string;
  };
  readonly reproducibility: {
    readonly runs: 2;
    readonly byteIdentical: true;
  };
  readonly packages: readonly PackedCandidate[];
}

export type ConsumerKind = 'vanilla' | 'react';

export interface ReactVersionLine {
  readonly react: '19.0.0' | '19.2.8';
  readonly reactDom: '19.0.0' | '19.2.8';
  readonly reactTypes: '19.0.0' | '19.2.17';
  readonly reactDomTypes: '19.0.0' | '19.2.3';
}

export interface ConsumerScenario {
  readonly id: string;
  readonly kind: ConsumerKind;
  readonly typescript: '5.9.3' | '6.0.3';
  readonly react?: ReactVersionLine;
}

export interface ConsumerTemplateFile {
  readonly path: string;
  readonly contents: string;
}

export interface ConsumerTemplate {
  readonly scenario: ConsumerScenario;
  readonly files: readonly ConsumerTemplateFile[];
}

export interface ConsumerProjectContext {
  readonly root: string;
  readonly scenario: ConsumerScenario;
  readonly run: CommandRunner;
  readonly environment: Readonly<Record<string, string>>;
}
