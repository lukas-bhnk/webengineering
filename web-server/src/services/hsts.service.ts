/* Autor: Christopher Lupton (FH Münster) */

import { Request, Response, NextFunction } from 'express';

class HstsService {
  hstsMiddelware = (req: Request, res: Response, next: NextFunction) => {
    res.set('Strict-Transport-Sequrity', "'max-age=31536000' 'includeSubDomains' 'preload'");
    next();
  };
  hstsPostMiddleware = (req: Request, res: Response) => {
    console.log(req.body);
  };
}

export const hstsService = new HstsService();
