import { Application, Request, Response } from 'express';

import { IConfig } from '../services/env-settings/types.js';

export function makeRoutes(
  app: Application,
  config: IConfig,
) {

  function root(_req: Request, res: Response) {
    res.json({ data: config.appInfo, ts: new Date() });
  }

  const ts = new Date().getTime();

  function test1(_req: Request, res: Response) {
    res.json({ ts, path: 1 });
  }

  function test2(req: Request, res: Response) {
    res.json({ ts, path: 2, input: req.body });
  }

  app.get('/', root);
  app.get('/1', test1);
  app.post('/2', test2);

  return {
    root,
    test1,
    test2,
  };
}
