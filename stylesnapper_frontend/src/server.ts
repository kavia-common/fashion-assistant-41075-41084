import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

/**
 * Runtime config endpoint: exposes only NG_APP_* variables as JSON.
 * This is served from /assets/runtime-config.json to align with frontend fetch path.
 */
app.get('/assets/runtime-config.json', (_req, res) => {
  const env = (process as any).env as Record<string, string | undefined>;

  const allowedKeys = [
    'NG_APP_API_BASE',
    'NG_APP_BACKEND_URL',
    'NG_APP_WS_URL',
    'NG_APP_NODE_ENV',
    'NG_APP_FEATURE_FLAGS',
    'NG_APP_EXPERIMENTS_ENABLED',
    'NG_APP_LOG_LEVEL',
    'NG_APP_HEALTHCHECK_PATH',
  ];

  const result: Record<string, string> = {};
  for (const key of allowedKeys) {
    const val = env[key];
    if (val !== undefined) {
      result[key] = val;
    }
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).send(JSON.stringify(result));
});

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
