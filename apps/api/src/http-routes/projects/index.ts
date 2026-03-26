import { IBasicLogger } from '@rataqa/sijil';
import { Application, Request } from 'express';

import { IAzureDevOpsApi } from '../../services/azure-devops';
import { IDb } from '../../services/db';
import { IDbWork } from '../../services/db-work';
import { makeDaysOfMonth, waitForMs } from '../../utils';
import { IResponse } from '../types';
import * as Types from './types';
import { IPullRequestStats } from '../../services/db/types';

export default function makeRoutes(
  app: Application,
  azureDevOps: IAzureDevOpsApi,
  db: IDb,
  dbWork: IDbWork,
  logger: IBasicLogger,
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

  async function getProject(req: Types.IRequestByProject, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const result = await api.project(projectId);
    res.json(result);
  }

  async function getTeams(req: Types.IRequestByProject, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const result = await api.teams(projectId);
    const adapted = result.adapt();
    res.json(adapted);

    for (const row of adapted.value) {
      await db.addTeam(row); // cache
    }
  }

  async function getTeam(req: Types.IRequestByProjectAndTeam, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, teamId } = req.params;
    const result = await api.team(projectId, teamId);
    res.json(result);
  }

  async function getTeamMembers(req: Types.IRequestByProjectAndTeam, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, teamId } = req.params;
    const result = await api.teamMembers(projectId, teamId);
    const adapted = result.adapt();
    res.json(adapted);

    for (const row of adapted.value) {
      await db.addMember({ teamId, ...row }); // cache
    }
  }

  async function getAllTeamMembers(req: Types.IRequestByProjectAndTeam, res: IResponse) {
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

  async function getUser(req: Types.IRequestByMember, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { userDescriptor } = req.params;
    const result = await api.user(userDescriptor);
    res.json(result);
  }

  async function getRepos(req: Types.IRequestByProject, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const result = await api.repos(projectId);
    const adapted = result.adapt();
    res.json(adapted);

    for (const row of adapted.value) {
      await db.addRepo(row); // cache
    }
  }

  async function getRepoPullRequests(req: Types.IRequestByProjectAndRepo, res: IResponse) {
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

  async function getRepoStats(req: Types.IRequestByProjectAndRepo, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, repoId } = req.params;
    const result = await api.repoStats(repoId, projectId);
    res.json(result.adapt());
  }

  async function syncAllPullRequestsByMonth(req: Types.IRequestByProjectAndYearMonth, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, yyyy = '2026', mm = '03' } = req.params;
    const { projects, repos } = await db.data();
    const project = projects.find(p => p.id === projectId);
    res.json(project);

    const currentYear = new Date().getFullYear();
    const year = parseInt(yyyy);
    if (isNaN(year) || (year < currentYear - 1) || (currentYear < year)) {
      logger.warn('invalid year', { yyyy });
      return;
    }

    const month = parseInt(mm);
    if (isNaN(month) || (month <= 0) || (12 < month)) {
      logger.warn('invalid month', { mm });
      return;
    }

    const start = `${yyyy}-${month}-01T00:00:01`;
    const end = `${yyyy}-${month+1}-01T00:00:00`;

    for (const repo of repos.filter(r => r.projectId === projectId)) {
      logger.info(' -', { repo: repo.name });
      //for (const member of members) {

        //logger.info(' -- completed PRs...', { repo: repo.name, member: member.uniqueName });
        logger.info(' -- completed PRs...', { repo: repo.name });
        const pullRequests = await api.repoPullRequests(repo.id, {
          //"searchCriteria.creatorId": member.id,
          "searchCriteria.minTime": start,
          "searchCriteria.maxTime": end,
          "searchCriteria.status": 'completed',
          $top: 100,
        }, projectId);
        const adapted = pullRequests.adapt();
        logger.info(' > found', { count: adapted.count });
        for (const pr of adapted.value) {
          //logger.info('PR', { repo: repo.name, member: member.uniqueName, pr: pr.id });
          logger.info('PR', { repo: repo.name, member: pr.createdBy.uniqueName, pr: pr.id });
          await db.addPullRequest({ repoId: repo.id, ...pr });
        }
        await waitForMs(100);

        //logger.info(' -- active PRs...', { repo: repo.name, member: member.uniqueName });
        logger.info(' -- active PRs...', { repo: repo.name });
        const pullRequests2 = await api.repoPullRequests(repo.id, {
          //"searchCriteria.creatorId": member.id,
          "searchCriteria.minTime": start,
          "searchCriteria.maxTime": end,
          "searchCriteria.status": 'active',
          $top: 100,
        }, projectId);
        const adapted2 = pullRequests2.adapt();
        logger.info(' > found', { count: adapted2.count });
        for (const pr of adapted2.value) {
          //logger.info('PR', { repo: repo.name, member: member.uniqueName, pr: pr.id });
          logger.info('PR', { repo: repo.name, member: pr.createdBy.uniqueName, pr: pr.id });
          await db.addPullRequest({ repoId: repo.id, ...pr });
        }
        await waitForMs(100);
        //break; // do it once for testing
      //}
      //break; // do it once for testing
    }
    logger.info('DONE!');
  }

  async function getRepoPrStatsByMonth(req: Types.IRequestByProjectAndYearMonth, res: IResponse) {
    const { projectId, yyyy, mm } = req.params;

    const currentYear = new Date().getFullYear();
    const year = parseInt(yyyy);
    if (isNaN(year) || (year < currentYear - 1) || (currentYear < year)) {
      logger.warn('invalid year', { yyyy });
      return res.json({ error: 'invalid year', yyyy });
    }

    const month = parseInt(mm);
    if (isNaN(month) || (month <= 0) || (12 < month)) {
      logger.warn('invalid month', { mm });
      return res.json({ error: 'invalid month', mm });
    }

    const daysOfMonth = makeDaysOfMonth<{ count: number; text: string; }>(yyyy, mm, { count: 0, text: '' });
    const prList = await db.pullRequestsInReposOfProjectAndMonth(projectId, daysOfMonth);
    const stats = db.pullRequestsStatsGroupedByMembers(prList, daysOfMonth);
    res.json(stats);
  }

  async function getRepoPrStatsByMonthByMember(req: Types.IRequestByProjectAndYearMonthMember, res: IResponse) {
    const { projectId, memberId, yyyy, mm } = req.params;

    const currentYear = new Date().getFullYear();
    const year = parseInt(yyyy);
    if (isNaN(year) || (year < currentYear - 1) || (currentYear < year)) {
      logger.warn('invalid year', { yyyy });
      return res.json({ error: 'invalid year', yyyy });
    }

    const month = parseInt(mm);
    if (isNaN(month) || (month <= 0) || (12 < month)) {
      logger.warn('invalid month', { mm });
      return res.json({ error: 'invalid month', mm });
    }

    const daysOfMonth = makeDaysOfMonth<IPullRequestStats>(yyyy, mm, { count: 0, text: '' });
    const prList = await db.pullRequestsInReposOfProjectAndMonthByMember(projectId, daysOfMonth, memberId);
    const stats = db.pullRequestsStatsGroupedByMembers(prList, daysOfMonth);
    res.json(stats);
  }

  async function syncWorkItems(req: Types.IRequestByProjectAndYearMonthDay, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const asOf = new Date(String(req.query.asOf || '')).toISOString();
    const result = await api.workItems(asOf, projectId);
    const adapted = result.adapt();
    res.json(adapted);

    for (const row of adapted.value) {
      await dbWork.addWorkItem({ projectId, ...row }); // cache
    }
  }

  app.get('/projects', getProjects);
  app.get('/projects/:projectId', getProject);
  app.get('/projects/:projectId/teams', getTeams);
  app.get('/projects/:projectId/teams-all', getAllTeamMembers);
  app.get('/projects/:projectId/teams/:teamId', getTeam);
  app.get('/projects/:projectId/teams/:teamId/members', getTeamMembers);
  app.get('/projects/:projectId/repos', getRepos);
  app.get('/projects/:projectId/repos/:repoId/pull-requests', getRepoPullRequests);
  app.get('/projects/:projectId/repos/:repoId/stats', getRepoStats);
  app.get('/projects/:projectId/sync-pull-requests/:yyyy/:mm', syncAllPullRequestsByMonth);
  app.get('/projects/:projectId/pull-request-stats/:yyyy/:mm', getRepoPrStatsByMonth);
  app.get('/projects/:projectId/members/:memberId/pull-request-stats/:yyyy/:mm', getRepoPrStatsByMonthByMember);

  app.get('/projects/:projectId/work-items', syncWorkItems);
  
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
