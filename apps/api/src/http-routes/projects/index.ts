import { IBasicLogger } from '@rataqa/sijil';
import { Application, Request } from 'express';

import { IAzureDevOpsApi } from '../../services/azure-devops';
import { IDb } from '../../services/db';
import { getTopAndSkipParams, getYearAndMonthParams, makeDaysOfMonth, noOp, waitForMs } from '../../utils';
import { IResponse } from '../types';
import * as Types from './types';
import { IPullRequestStats, IPullRequestStatsByDay } from '../../services/db/types';
import { addMonths } from 'date-fns';

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
      const data = result.adapt();
      res.json({ data });

      for (const row of data.value) {
        await db.upsertProject(row); // cache
      }
    } else {
      const data = await db.findProjects();
      res.json({ data, count: data.length });
    }
  }

  async function getProject(req: Types.IRequestByProject, res: IResponse) {
    const { projectId } = req.params;
    const sync = String(req.query['sync'] || '') === 'true';
    if (sync) {
      const api = azureDevOps.makeOrgApi();
      const data = await api.project(projectId);
      res.json({ data });

      await db.upsertProject({
        id: data.id,
        name: data.name,
        description: data.description,
      });
    } else {
      const data = await db.findProject(projectId);
      res.json({ data });
    }
  }

  async function getTeams(req: Types.IRequestByProject, res: IResponse) {
    const { projectId } = req.params;
    const sync = String(req.query['sync'] || '') === 'true';
    if (sync) {
      const api = azureDevOps.makeOrgApi();
      const result = await api.teams(projectId);
      const data = result.adapt();
      res.json({ data });

      for (const row of data.value) {
        await db.upsertTeam({ ...row, projectId }); // cache
      }
    } else {
      const data = await db.findTeamsByProject(projectId);
      res.json({ data, count: data.length });
    }
  }

  async function getTeam(req: Types.IRequestByProjectAndTeam, res: IResponse) {
    const { projectId, teamId } = req.params;
    const sync = String(req.query['sync'] || '') === 'true';
    if (sync) {
      const api = azureDevOps.makeOrgApi();
      const data = await api.team(projectId, teamId);
      res.json({ data });

      await db.upsertTeam({
        id: data.id,
        name: data.name,
        description: data.description,
        projectId,
      });
    } else {
      const value = await db.findTeamsByProject(projectId);
      const team = value.find(t => t.id === teamId);
      res.json({ data: team });
    }
  }

  async function getTeamMembers(req: Types.IRequestByProjectAndTeam, res: IResponse) {
    const { projectId, teamId } = req.params;
    const sync = String(req.query['sync'] || '') === 'true';
    if (sync) {
      const api = azureDevOps.makeOrgApi();
      const result = await api.teamMembers(projectId, teamId);
      const data = result.adapt();
      res.json({ data });

      for (const row of data.value) {
        await db.upsertMember({ teamId, ...row }); // cache
      }
    } else {
      const data = await db.findMembersByTeam(teamId);
      res.json({ data, count: data.length });
    }
  }

  async function syncAllTeamsAndMembers(req: Types.IRequestByProjectAndTeam, res: IResponse) {
    const { projectId } = req.params;

    const api = azureDevOps.makeOrgApi();
    const teams = await api.teams(projectId);
    const { value: data, count } = teams.adapt();
    res.json({ data, count }); // respond as early as possible

    for (const team of data) {
      await db.upsertTeam(team); // cache

      const members = await api.teamMembers(projectId, team.id);
      const { value: adaptedMembers } = members.adapt();

      for (const member of adaptedMembers) {
        await db.upsertMember({ teamId: team.id, ...member });
      }
    }
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
    const { projectId } = req.params;
    const sync = String(req.query['sync'] || '') === 'true';
    if (sync) {
      const api = azureDevOps.makeOrgApi();
      const result = await api.repos(projectId);
      const { value: data, count } = result.adapt();
      res.json({ data, count });

      for (const row of data) {
        await db.upsertRepo(row); // cache
      }
    } else {
      const data = await db.findReposByProject(projectId);
      res.json({ data, count: data.length });
    }
  }

  async function getRepoPullRequests(req: Types.IRequestByProjectAndRepo, res: IResponse) {
    const { projectId, repoId } = req.params;
    const sync = String(req.query['sync'] || '') === 'true';
    if (sync) {
      const api = azureDevOps.makeOrgApi();
      let repoName = '';
      const repo = await db.findRepo(repoId);
      if (!repo) {
        const repoResult = await api.repos(projectId);
        const found = repoResult.adapt().value.find(r => r.id);
        if (found) {
          await db.upsertRepo(found);
        } else {
          return res.json({ error: 'not found' });
        }
      } else {
        repoName = repo.name;
      }

      const { $top, $skip } = getTopAndSkipParams(req.query);
      const options = { $top, $skip, "searchCriteria.status": 'completed' };
      const result = await api.repoPullRequests(repoId, options, projectId);
      const { value: data, count } = result.adapt();
      res.json({ data, count });

      for (const row of data) {
        db.upsertPullRequest({ ...row, repoId }, repoName, false).then(noOp).catch(noOp);
      }
    } else {
      const data = await db.pullRequestsInRepo(repoId);
      res.json({ data, count: data.length });
    }
  }

  async function getRepoStats(req: Types.IRequestByProjectAndRepo, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, repoId } = req.params;
    const result = await api.repoStats(repoId, projectId);
    res.json(result.adapt());
  }

  async function syncAllPullRequestsByMonth(req: Types.IRequestByProjectAndYearMonth, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId } = req.params;

    const project = await db.findProject(projectId);
    res.json({ data: project });
    if (!project) return;

    const { year, month } = getYearAndMonthParams(req.params); // validate year and month

    const repos = await db.findReposByProject(projectId);

    const start = `${year}-${month}-01T00:00:00Z`;
    const nextMonth = addMonths(new Date(year, month - 1, 1), 1);
    const end = nextMonth.toISOString();
    const baseOptions = {
      $top: 100,
      "searchCriteria.minTime": start,
      "searchCriteria.maxTime": end,
    };
  
    for (const repo of repos) {
      logger.info(' -- completed PRs...', { repo: repo.name });
      const pullRequests = await api.repoPullRequests(repo.id, {
        //"searchCriteria.creatorId": member.id,
        ...baseOptions,
        "searchCriteria.status": 'completed',
      }, projectId);
      const adapted = pullRequests.adapt();
      logger.info(' > found', { count: adapted.count });
      for (const pr of adapted.value) {
        db.upsertPullRequest({ repoId: repo.id, ...pr }, repo.name).then(noOp).catch(() => logger.error('  - ERROR!'));
      }
      await waitForMs(100);

      logger.info(' -- active PRs...', { repo: repo.name });
      const pullRequests2 = await api.repoPullRequests(repo.id, {
        //"searchCriteria.creatorId": member.id,
        ...baseOptions,
        "searchCriteria.status": 'active',
      }, projectId);
      const adapted2 = pullRequests2.adapt();
      logger.info(' > found', { count: adapted2.count });
      for (const pr of adapted2.value) {
        db.upsertPullRequest({ repoId: repo.id, ...pr }, repo.name).then(noOp).catch(() => logger.error('  - ERROR!'));
      }
      await waitForMs(100);
    }
    logger.info('DONE!');
  }

  async function getRepoPrStatsByMonth(req: Types.IRequestByProjectAndYearMonth, res: IResponse) {
    const { projectId } = req.params;

    const { yyyy, mm } = getYearAndMonthParams(req.params); // validate year and month
    const dayList = makeDaysOfMonth(yyyy, mm);
    const daysOfMonth: IPullRequestStatsByDay = {};
    dayList.forEach(d => { daysOfMonth[`${d}`] = { count: 0, text: '' }; });

    const prList = await db.pullRequestsInReposOfProjectAndMonth(projectId, dayList);
    const stats = db.pullRequestsStatsGroupedByMembers(prList, daysOfMonth);
    res.json(stats);
  }

  async function getRepoPrStatsByMonthByMember(req: Types.IRequestByProjectAndYearMonthMember, res: IResponse) {
    const { projectId, memberId } = req.params;

    const { yyyy, mm } = getYearAndMonthParams(req.params); // validate year and month
    const dayList = makeDaysOfMonth(yyyy, mm);
    const daysOfMonth: IPullRequestStatsByDay = {};
    dayList.forEach(d => { daysOfMonth[`${d}`] = { count: 0, text: '' }; });

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
  app.get('/projects/:projectId/sync-teams-and-members', syncAllTeamsAndMembers);
  app.get('/projects/:projectId/teams/:teamId', getTeam);
  app.get('/projects/:projectId/teams/:teamId/members', getTeamMembers);
  app.get('/projects/:projectId/repos', getRepos);
  app.get('/projects/:projectId/repos/:repoId/pull-requests', getRepoPullRequests);
  app.get('/projects/:projectId/repos/:repoId/stats', getRepoStats);
  app.get('/projects/:projectId/pull-requests/:yyyy/:mm', syncAllPullRequestsByMonth);
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
    syncAllTeamsAndMembers,
    getRepos,
    getRepoPullRequests,
    getRepoStats,
    // getUsers,
    // getUser,
    // getIdentities,
  };
}
