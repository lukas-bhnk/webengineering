/* Autor: Lukas Behnke (FH Münster) */

import { Request, Response, NextFunction } from 'express';

class CspService {
  cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.set(
      'Content-Security-Policy',
      "default-src 'self' https://localhost:3443 http://localhost:3000; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; report-uri /reports"
    );
    next();
  };
  cspPostMiddleware = (req: Request, res: Response) => {
    console.log(req.body);
  };
}

export const cspService = new CspService();
