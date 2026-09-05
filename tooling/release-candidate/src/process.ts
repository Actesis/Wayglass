import { spawn } from 'node:child_process';

import { ReleaseCandidateError } from './error.ts';
import type { CommandRequest, CommandRunner } from './types.ts';

export const runCommand: CommandRunner = async ({ command, arguments: args, cwd, environment }) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, [...args], {
      cwd,
      env: environment,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => (stdout += chunk));
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => (stderr += chunk));
    child.once('error', (error) =>
      reject(new ReleaseCandidateError('WG_RC_COMMAND_START', `${command}: ${error.message}`)),
    );
    child.once('close', (code, signal) => {
      if (code !== 0) {
        const detail = stderr.trim() || stdout.trim() || `signal ${signal ?? 'unknown'}`;
        reject(
          new ReleaseCandidateError(
            'WG_RC_COMMAND_FAILED',
            `${command} ${args.join(' ')} exited ${String(code)}: ${detail}`,
          ),
        );
        return;
      }
      resolve({ stdout, stderr });
    });
  });

export async function commandText(runner: CommandRunner, request: CommandRequest): Promise<string> {
  return (await runner(request)).stdout.trim();
}
