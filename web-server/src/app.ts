/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import express from 'express';
import path from 'path';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';
import { cspService } from './services/csp.service.js';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { pfService } from './services/pf.service.js';
import { hstsService } from './services/hsts.service.js';
import { corpService } from './services/corp.service.js';

const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url), 'utf-8'));

export async function start() {
  const basedir = fileURLToPath(path.dirname(import.meta.url));
  const clientDir = path.join(basedir, '..', config.client.dir);

  const app = express();
  app.use(express.json({ type: ['json', 'application/csp-report'] }));
  app.use(hstsService.hstsMiddelware);
  app.post('/reports', hstsService.hstsPostMiddleware);
  app.use(pfService.pfMiddelware);
  app.post('/reports', pfService.pfPostMiddleware);
  app.use(cspService.cspMiddleware);
  app.post('/reports', cspService.cspPostMiddleware);
  app.use(corpService.corpMiddleware);
  app.get('/', (_, res) => res.redirect('/app/index.html'));
  app.use('/app', express.static(clientDir));
  app.use('/app', (_, res) => res.sendFile(path.join(clientDir, 'index.html')));

  const createOptions = () => {
    const basedir = fileURLToPath(path.dirname(import.meta.url));
    const certDir = path.join(basedir, 'certs');
    return {
      key: fs.readFileSync(path.join(certDir, 'server.key.pem')),
      cert: fs.readFileSync(path.join(certDir, 'server.cert.pem')),
      ca: fs.readFileSync(path.join(certDir, 'intermediate-ca.cert.pem'))
    };
  };
  const httpServer = config.server.https ? https.createServer(createOptions(), app) : http.createServer(app);
  await new Promise<void>(resolve => {
    httpServer.listen(config.server.port, () => {
      console.log(`WebServer running at http${config.server.https ? 's' : ''}://localhost:${config.server.port}`);
      resolve();
    });
  });
  return async () => await new Promise<void>(resolve => httpServer.close(() => resolve()));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  start();
}
