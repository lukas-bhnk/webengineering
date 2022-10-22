/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import http from 'http';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import startDB from './db.js';
import { corsService } from './services/cors.service.js';
import fs from 'fs';
import { pathToFileURL } from 'url';
// TODO: Routen importieren
import users from './routes/users.js';
import expenditures from './routes/expenditures.js';
import earnings from './routes/earnings.js';
import sumsUserMonthEarnings from './routes/sumsUserMonthEarnings.js';
import sumsUserMonthExpenditures from './routes/sumsUserMonthExpenditures.js';
import tips from './routes/tips.js';
import finances from './routes/finances.js';
import budgets from './routes/budgets.js';

const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url), 'utf-8'));

function configureApp(app: Express) {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(corsService.corsMiddleware);
  // TODO: Routen einbinden
  app.use('/api/users', users);
  app.use('/api/expenditures', expenditures);
  app.use('/api/earnings', earnings);
  app.use('/api/sumsUserMonthEarnings', sumsUserMonthEarnings);
  app.use('/api/sumsUserMonthExpenditures', sumsUserMonthExpenditures);
  app.use('/api/tips', tips);
  app.use('/api/finances', finances);
  app.use('/api/budgets', budgets);
}

export async function start() {
  const app = express();

  configureApp(app);
  const stopDB = await startDB(app);
  const stopHttpServer = await startHttpServer(app, config.server.port);
  return async () => {
    await stopHttpServer();
    await stopDB();
  };
}

async function startHttpServer(app: Express, port: number) {
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
    httpServer.listen(port, () => {
      console.log(`Server running at http${config.server.https ? 's' : ''}://localhost:${port}`);
      resolve();
    });
  });
  return async () => await new Promise<void>(resolve => httpServer.close(() => resolve()));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  start();
}
