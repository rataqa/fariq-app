import { Application, Request } from 'express';

import { IResponse } from '../types.js';

// TODO: avoid using .js
import { IAzureDevOpsApi } from '../../services/azure-devops/index.js';
import { IRequestByMember, IRequestByProject, IRequestByProjectAndTeam } from './types.js';

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

  async function getProject(req: IRequestByProject, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const { log } = res.locals;
    log.info('getProject');
    try {
      const result = await api.project(projectId);
      res.json(result);
    } catch (err: any) {
      log.warn('Invalid request', { err: err?.stack });
      const error = err instanceof Error ? err.message : 'Bad request';
      res.status(404).json({ error });
    }
  }

  async function getTeams(req: IRequestByProject, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const { log } = res.locals;
    log.info('getTeams');
    try {
      const result = await api.teams(projectId);
      res.json(result);
    } catch (err: any) {
      log.warn('Invalid request', { err: err?.stack });
      const error = err instanceof Error ? err.message : 'Bad request';
      res.status(404).json({ error });
    }
  }

  async function getTeam(req: IRequestByProjectAndTeam, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, teamId } = req.params;
    const { log } = res.locals;
    log.info('getTeam');
    try {
      const result = await api.team(projectId, teamId);
      res.json(result);
    } catch (err: any) {
      log.warn('Invalid request', { err: err?.stack });
      const error = err instanceof Error ? err.message : 'Bad request';
      res.status(404).json({ error });
    }
  }

  async function getTeamMembers(req: IRequestByProjectAndTeam, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, teamId } = req.params;
    const { log } = res.locals;
    log.info('getTeamMembers');
    try {
      const result = await api.teamMembers(projectId, teamId);
      res.json(result);
    } catch (err: any) {
      log.warn('Invalid request', { err: err?.stack });
      const error = err instanceof Error ? err.message : 'Bad request';
      res.status(404).json({ error });
    }
  }

  /*async function getAllMembers(req: IRequestByProjectAndTeam, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const { log } = res.locals;
    log.info('getAllMembers');
    try {
      const result = await api.teamMembers(projectId, teamId);
      res.json(result);
    } catch (err: any) {
      log.warn('Invalid request', { err: err?.stack });
      const error = err instanceof Error ? err.message : 'Bad request';
      res.status(404).json({ error });
    }
  }*/

  async function getUser(req: IRequestByMember, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { userDescriptor } = req.params;
    const { log } = res.locals;
    log.info('getUser');
    try {
      const result = await api.user(userDescriptor);
      res.json(result);
    } catch (err: any) {
      log.warn('Invalid request', { err: err?.stack });
      const error = err instanceof Error ? err.message : 'Bad request';
      res.status(404).json({ error });
    }
  }

  app.get('/projects', getProjects);
  app.get('/projects/:projectId', getProject);
  app.get('/projects/:projectId/teams', getTeams);
  app.get('/projects/:projectId/teams/:teamId', getTeam);
  app.get('/projects/:projectId/teams/:teamId/members', getTeamMembers);
  //app.get('/projects/:projectId/all/members', getAllMembers); // TODO
  app.get('/users/:userDescriptor', getUser);

  return {
    getProjects,
    getProject,
    getTeams,
    getTeam,
    getTeamMembers,
    getUser,
  };
}
