import { Application, Request } from 'express';

import { IResponse } from '../types';

import { IAzureDevOpsApi } from '../../services/azure-devops';
import { IRequestByMember, IRequestByProject, IRequestByProjectAndRepo, IRequestByProjectAndTeam } from './types';

export default function makeRoutes(
  app: Application,
  azureDevOps: IAzureDevOpsApi,
) {
  
  async function getProjects(_req: Request, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const result = await api.projects();
    res.json(result.adapt());
  }

  async function getProject(req: IRequestByProject, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const result = await api.project(projectId);
    res.json(result);
  }

  async function getTeams(req: IRequestByProject, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const result = await api.teams(projectId);
    res.json(result.adapt());
  }

  async function getTeam(req: IRequestByProjectAndTeam, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, teamId } = req.params;
    const result = await api.team(projectId, teamId);
    res.json(result);
  }

  async function getTeamMembers(req: IRequestByProjectAndTeam, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, teamId } = req.params;
    const result = await api.teamMembers(projectId, teamId);
    res.json(result.adapt());
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

  async function getUsers(req: IRequestByMember, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const result = await api.users();
    res.json(result.adapt());
  }

  async function getUser(req: IRequestByMember, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { userDescriptor } = req.params;
    const result = await api.user(userDescriptor);
    res.json(result);
  }

  async function getRepos(req: IRequestByProject, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const result = await api.repos(projectId);
    res.json(result.adapt());
  }

  async function getRepoPullRequests(req: IRequestByProjectAndRepo, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, repoId } = req.params;
    const result = await api.repoPullRequests(repoId, projectId);
    res.json(result.adapt());
  }

  async function getRepoStats(req: IRequestByProjectAndRepo, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, repoId } = req.params;
    const result = await api.repoStats(repoId, projectId);
    res.json(result.adapt());
  }

  app.get('/projects', getProjects);
  app.get('/projects/:projectId', getProject);
  app.get('/projects/:projectId/teams', getTeams);
  app.get('/projects/:projectId/teams/:teamId', getTeam);
  app.get('/projects/:projectId/teams/:teamId/members', getTeamMembers);
  //app.get('/projects/:projectId/all/members', getAllMembers); // TODO
  app.get('/users', getUsers);
  app.get('/users/:userDescriptor', getUser);
  app.get('/projects/:projectId/repos', getRepos);
  app.get('/projects/:projectId/repos/:repoId/pull-requests', getRepoPullRequests);
  app.get('/projects/:projectId/repos/:repoId/stats', getRepoStats);

  return {
    getProjects,
    getProject,
    getTeams,
    getTeam,
    getTeamMembers,
    getUsers,
    getUser,
    getRepos,
    getRepoPullRequests,
    getRepoStats,
  };
}
