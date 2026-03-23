import { Application, Request } from 'express';

import { IResponse } from '../types.js';

// TODO: avoid using .js
import { IAzureDevOpsApiViaSdk } from '../../services/azure-devops-sdk/index.js';

export default function makeRoutes(
  app: Application,
  azureDevOps: IAzureDevOpsApiViaSdk,
) {

  async function getTeams(_req: Request, res: IResponse) {
    const { log } = res.locals;
    log.info('getTeams');
    try {
      const result = await azureDevOps.teams();
      res.json(result);
    } catch (err: unknown) {
      log.warn('Invalid request', { err });
      const error = err instanceof Error ? err.message : 'Bad request';
      res.status(404).json({ error });
    }
  }

  app.get('/teams', getTeams);

  return {
    getTeams,
  };
}
