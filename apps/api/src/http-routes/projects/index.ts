import { Application, Request } from 'express';

import { IResponse } from '../types.js';

// TODO: avoid using .js
import { IAzureDevOpsApi } from '../../services/azure-devops/index.js';

export default function makeRoutes(
  app: Application,
  azureDevOps: IAzureDevOpsApi,
) {

  
  async function getProjects(_req: Request, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { log } = res.locals;
    log.info('getProjects');
    try {
      const result = await api.projects();
      res.json(result);
    } catch (err: any) {
      log.warn('Invalid request', { err: err?.stack });
      const error = err instanceof Error ? err.message : 'Bad request';
      res.status(404).json({ error });
    }
  }

  app.get('/projects', getProjects);

  return {
    getProjects,
  };
}
