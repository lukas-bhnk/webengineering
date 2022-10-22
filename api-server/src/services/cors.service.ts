/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Request, Response, NextFunction } from 'express';

// array with all alllowed origins, possibility to add more :)
const allowedOrigins = ['https://localhost:8443', 'http://localhost:8080'];

class CorsService {
  corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (this.isOriginAllowed(req.get('Origin'))) {
      res.set('Access-Control-Allow-Origin', req.get('Origin'));
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Content-Security-Policy', "script-src 'self'; report-uri /reports");
    }
    if (this.isPreflight(req)) {
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
      res.status(204).end();
    } else {
      next();
    }
  };

  isPreflight(req: Request) {
    return req.method === 'OPTIONS' && req.get('Origin') && req.get('Access-Control-Request-Method');
  }

  isOriginAllowed(origin?: string) {
    for (const allowedOrigin of allowedOrigins) {
      if (allowedOrigin === origin) return true;
    }
    return false;
  }
}

export const corsService = new CorsService();
