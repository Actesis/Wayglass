#!/usr/bin/env node

import { runIconToolingCommand } from './command.ts';
import { createIconToolingCommandHandlers } from './handlers.ts';

const io = {
  stdout: (message: string) => console.log(message),
  stderr: (message: string) => console.error(message),
};

process.exitCode = await runIconToolingCommand(
  process.argv.slice(2),
  createIconToolingCommandHandlers(io),
  io,
);
