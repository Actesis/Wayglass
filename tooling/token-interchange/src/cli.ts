#!/usr/bin/env node

import { runTokenToolingCommand } from './command.ts';
import { createTokenToolingCommandHandlers } from './handlers.ts';

const io = {
  stdout: (message: string) => console.log(message),
  stderr: (message: string) => console.error(message),
};

process.exitCode = await runTokenToolingCommand(
  process.argv.slice(2),
  createTokenToolingCommandHandlers(io),
  io,
);
