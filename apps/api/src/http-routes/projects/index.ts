import { IBasicLogger } from '@rataqa/sijil';
import { Application, Request } from 'express';

import { IAzureDevOpsApi } from '../../services/azure-devops';
import { IDb } from '../../services/db';
import { makeDaysOfMonth, waitForMs } from '../../utils';
import { IResponse } from '../types';
import * as Types from './types';
import { IPullRequestStats } from '../../services/db/types';

export default function makeRoutes(
  app: Application,
  azureDevOps: IAzureDevOpsApi,
  db: IDb,
  logger: IBasicLogger,
) {

  async function getProjects(req: Request, res: IResponse) {
    const sync = String(req.query['sync'] || '') === 'true';
    if (sync) {
      const api = azureDevOps.makeOrgApi();
      const result = await api.projects();
      const adapted = result.adapt();
      res.json(adapted);

      for (const row of adapted.value) {
        await db.upsertProject(row); // cache
      }
    } else {
      const value = await db.findProjects();
      res.json({ value, count: value.length });
    }
  }

  async function getProject(req: Types.IRequestByProject, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const result = await api.project(projectId);
    res.json(result);
  }

  async function getTeams(req: Types.IRequestByProject, res: IResponse) {
    const { projectId } = req.params;
    const sync = String(req.query['sync'] || '') === 'true';
    if (sync) {
      const api = azureDevOps.makeOrgApi();
      const result = await api.teams(projectId);
      const adapted = result.adapt();
      res.json(adapted);

      for (const row of adapted.value) {
        await db.upsertTeam(row); // cache
      }
    } else {
      const value = await db.findTeamsByProject(projectId);
      res.json({ value, count: value.length });
    }
  }

  async function getTeam(req: Types.IRequestByProjectAndTeam, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, teamId } = req.params;
    const result = await api.team(projectId, teamId);
    res.json(result);
  }

  async function getTeamMembers(req: Types.IRequestByProjectAndTeam, res: IResponse) {
    const { projectId, teamId } = req.params;
    const sync = String(req.query['sync'] || '') === 'true';
    if (sync) {
      const api = azureDevOps.makeOrgApi();
      const result = await api.teamMembers(projectId, teamId);
      const adapted = result.adapt();
      res.json(adapted);

      for (const row of adapted.value) {
        await db.upsertMember({ teamId, ...row }); // cache
      }
    } else {
      const value = await db.findMembersByTeam(teamId);
      res.json({ value, count: value.length });
    }
  }

  async function getAllTeamMembers(req: Types.IRequestByProjectAndTeam, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const teams = await api.teams(projectId);

    const result: any = [];

    for (const team of teams.adapt().value) {
      await db.upsertTeam(team); // cache

      const members = await api.teamMembers(projectId, team.id);
      const adaptedMembers = members.adapt();

      result.push({
        ...team,
        members: adaptedMembers.value,
      });

      for (const member of adaptedMembers.value) {
        await db.upsertMember({ teamId: team.id, ...member });
      }
    }
    res.json(result);
  }

  // async function getIdentities(_req: Request, res: IResponse) {
  //   const api = azureDevOps.makeOrgApi();
  //   const result = await api.identities();
  //   res.json(result.adapt());
  // }

  // async function getUsers(_req: Request, res: IResponse) {
  //   const api = azureDevOps.makeOrgApi();
  //   const result = await api.users();
  //   res.json(result.adapt());
  // }

  // async function getUser(req: Types.IRequestByMember, res: IResponse) {
  //   const api = azureDevOps.makeOrgApi();
  //   const { userDescriptor } = req.params;
  //   const result = await api.user(userDescriptor);
  //   res.json(result);
  // }

  async function getRepos(req: Types.IRequestByProject, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;
    const result = await api.repos(projectId);
    const adapted = result.adapt();
    res.json(adapted);

    for (const row of adapted.value) {
      await db.upsertRepo(row); // cache
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
    const project = await db.findProject(projectId);
    res.json(project);
    if (!project) return;
    
    const repos = await db.findReposByProject(projectId);

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
          logger.info('PR', { repo: repo.name, member: pr.createdByUniqueName, pr: pr.id });
          await db.upsertPullRequest({ repoId: repo.id, ...pr });
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
          logger.info('PR', { repo: repo.name, member: pr.createdByUniqueName, pr: pr.id });
          await db.upsertPullRequest({ repoId: repo.id, ...pr });
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
    const dayList = Object.keys(daysOfMonth).map(parseInt);
    const prList = await db.pullRequestsInReposOfProjectAndMonth(projectId, dayList);
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
    const dayList = Object.keys(daysOfMonth).map(parseInt);
    const prList = await db.pullRequestsInReposOfProjectAndMonthByMember(projectId, dayList, memberId);
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

    // TODO: implement
    // for (const row of adapted.value) {
    //   await db.upsertWorkItem({ projectId, ...row }); // cache
    // }
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
  
  // app.get('/identities', getIdentities);
  // app.get('/users', getUsers);
  // app.get('/users/:userDescriptor', getUser);

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
    // getUsers,
    // getUser,
    // getIdentities,
  };
}
