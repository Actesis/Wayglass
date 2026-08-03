import { copyFile, mkdir } from 'node:fs/promises';

const outputDirectory = new URL('../dist/', import.meta.url);

await mkdir(outputDirectory, { recursive: true });
await copyFile(
  new URL('../src/foundations.css', import.meta.url),
  new URL('foundations.css', outputDirectory),
);
await copyFile(new URL('../src/forms.css', import.meta.url), new URL('forms.css', outputDirectory));
await copyFile(new URL('../src/media.css', import.meta.url), new URL('media.css', outputDirectory));
await copyFile(
  new URL('../src/media-viewer.css', import.meta.url),
  new URL('media-viewer.css', outputDirectory),
);
