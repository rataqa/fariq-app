import { Application, Request } from 'express';

import { IResponse } from '../types';

import { IAzureDevOpsApi } from '../../services/azure-devops';
import { IRequestByMember, IRequestByProject, IRequestByProjectAndRepo, IRequestByProjectAndTeam } from './types';
import { IDb } from '../../services/db';

export default function makeRoutes(
  app: Application,
  azureDevOps: IAzureDevOpsApi,
  db: IDb,
) {
  
  async function getProjects(_req: Request, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const result = await api.projects();
    const adapted = result.adapt();
    res.json(adapted);

    for (const row of adapted.value) {
      await db.addProject(row); // cache
    }
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
    const adapted = result.adapt();
    res.json(adapted);

    for (const row of adapted.value) {
      await db.addTeam(row); // cache
    }
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
    const adapted = result.adapt();
    res.json(adapted);

    for (const row of adapted.value) {
      await db.addMember({ teamId, ...row }); // cache
    }
  }

  async function getAllTeamMembers(req: IRequestByProjectAndTeam, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const teams = await api.teams(projectId);

    const result: any = [];

    for (const team of teams.adapt().value) {
      await db.addTeam(team); // cache

      const members = await api.teamMembers(projectId, team.id);
      const adaptedMembers = members.adapt();

      result.push({
        ...team,
        members: adaptedMembers.value,
      });

      for (const member of adaptedMembers.value) {
        await db.addMember({ teamId: team.id, ...member });
      }
    }
    res.json(result);
  }

  async function getIdentities(_req: Request, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const result = await api.identities();
    res.json(result.adapt());
  }

  async function getUsers(_req: Request, res: IResponse) {
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
    const adapted = result.adapt();
    res.json(adapted);

    for (const row of adapted.value) {
      await db.addRepo(row); // cache
    }
  }

  async function getRepoPullRequests(req: IRequestByProjectAndRepo, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, repoId } = req.params;
    const $top = Number.parseInt(String(req.query['$top']) || '100');
    const $skip = Number.parseInt(String(req.query['$skip']) || '0');

    const result = await api.repoPullRequests(repoId, {
      $top,
      $skip,
    }, projectId);
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
  app.get('/projects/:projectId/teams-all', getAllTeamMembers);
  app.get('/projects/:projectId/teams/:teamId', getTeam);
  app.get('/projects/:projectId/teams/:teamId/members', getTeamMembers);
  //app.get('/projects/:projectId/all/members', getAllMembers); // TODO
  app.get('/projects/:projectId/repos', getRepos);
  app.get('/projects/:projectId/repos/:repoId/pull-requests', getRepoPullRequests);
  app.get('/projects/:projectId/repos/:repoId/stats', getRepoStats);

  app.get('/identities', getIdentities);
  app.get('/users', getUsers);
  app.get('/users/:userDescriptor', getUser);

  return {
    getProjects,
    getProject,
    getTeams,
    getTeam,
    getTeamMembers,
    getAllTeamMembers,
    getRepos,
    getRepoPullRequests,
    getRepoStats,
    getUsers,
    getUser,
    getIdentities,
  };
}
