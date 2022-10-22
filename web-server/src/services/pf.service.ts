/* Autor: Christopher Lupton (FH Münster) */

import { Request, Response, NextFunction } from 'express';

class PfService {
  pfMiddelware = (req: Request, res: Response, next: NextFunction) => {
    res.set('Access-Control-Allow-Origin', req.get('Origin'));
    res.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.set('Access-Control-Allow-Credentials', 'true');
    next();
  };
  pfPostMiddleware = (req: Request, res: Response) => {
    console.log(req.body);
  };
}

export const pfService = new PfService();
