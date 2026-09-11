import { createServer, type Server } from 'node:http';

import { fail, SiteComposerError } from './error.ts';
import { checkSiteResponses, type SiteResponseOracle } from './response.ts';

export interface StartSiteServerOptions {
  readonly input: string;
  readonly host?: '127.0.0.1';
  readonly port?: number;
}

export interface RunningSiteServer {
  readonly host: '127.0.0.1';
  readonly port: number;
  readonly origin: string;
  readonly oracle: SiteResponseOracle;
  close(): Promise<void>;
}

function listen(server: Server, host: '127.0.0.1', port: number): Promise<number> {
  return new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      const address = server.address();
      if (address === null || typeof address === 'string') {
        reject(new SiteComposerError('WG_SITE_SERVER_LISTEN', 'Local server has no TCP address.'));
        return;
      }
      resolvePromise(address.port);
    });
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    server.close((error) => (error === undefined ? resolvePromise() : reject(error)));
  });
}

export async function startSiteServer(options: StartSiteServerOptions): Promise<RunningSiteServer> {
  const host = options.host ?? '127.0.0.1';
  const port = options.port ?? 0;
  if (host !== '127.0.0.1') {
    fail('WG_SITE_SERVER_HOST', 'The proof server may bind only to 127.0.0.1.');
  }
  if (!Number.isSafeInteger(port) || port < 0 || port > 65_535) {
    fail('WG_SITE_SERVER_PORT', 'The proof server port must be an integer from 0 through 65535.');
  }
  const oracle = checkSiteResponses(options.input);
  const server = createServer((request, response) => {
    try {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, { Allow: 'GET, HEAD', 'Content-Length': '0' });
        response.end();
        return;
      }
      const url = new URL(request.url ?? '/', `http://${host}`);
      const result = oracle.resolve(url, 'GET');
      const headers = Object.fromEntries(result.headers);
      headers['Content-Length'] = String(result.body.byteLength);
      response.writeHead(result.status, headers);
      response.end(request.method === 'HEAD' ? undefined : result.body);
    } catch {
      response.writeHead(400, { 'Content-Length': '0' });
      response.end();
    }
  });
  const boundPort = await listen(server, host, port);
  return {
    host,
    port: boundPort,
    origin: `http://${host}:${boundPort}`,
    oracle,
    close: () => close(server),
  };
}

export async function serveSite(options: StartSiteServerOptions): Promise<void> {
  const running = await startSiteServer(options);
  console.log(
    `Serving verified site ${running.oracle.site.manifest.bundleSha256} at ${running.origin}.`,
  );
  await new Promise<void>((resolvePromise) => {
    const stop = () => {
      process.off('SIGINT', stop);
      process.off('SIGTERM', stop);
      void running.close().finally(resolvePromise);
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
  });
}
