/* Autor: Lukas Behnke (FH Münster) */

import { Request, Response, NextFunction } from 'express';

class CorpService {
  corpMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.set('Cross-Origin-Resource-Policy', 'same-origin');
    next();
  };
}

export const corpService = new CorpService();
