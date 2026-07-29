import { copyFile, mkdir } from 'node:fs/promises';

const outputDirectory = new URL('../dist/', import.meta.url);

await mkdir(outputDirectory, { recursive: true });
await copyFile(
  new URL('../src/foundations.css', import.meta.url),
  new URL('foundations.css', outputDirectory),
);
