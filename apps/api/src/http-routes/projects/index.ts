import { IBasicLogger } from '@rataqa/sijil';
import { Application, Request } from 'express';

import { IAzureDevOpsApi } from '../../services/azure-devops';
import { IDb } from '../../services/db';
import { isInRange, makeDaysOfMonth, waitForMs } from '../../utils';
import { IResponse } from '../types';
import { IRequestByMember, IRequestByProject, IRequestByProjectAndYearMonth, IRequestByProjectAndRepo, IRequestByProjectAndTeam } from './types';

export default function makeRoutes(
  app: Application,
  azureDevOps: IAzureDevOpsApi,
  db: IDb,
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

  async function getAllPullRequestsByMonth(req: IRequestByProjectAndYearMonth, res: IResponse) {
    const api = azureDevOps.makeOrgApi();
    const { projectId, yyyy = '2026', mm = '03' } = req.params;
    const { projects, repos, members } = await db.data();
    const project = projects.find(p => p.id === projectId);
    res.json(project);

    const month = parseInt(mm);
    if (isNaN(month)) {
      logger
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

  async function getRepoPrStatsByMonth(req: IRequestByProjectAndYearMonth, res: IResponse) {
    const { projectId, yyyy, mm } = req.params;
    const { repos, pullRequests } = await db.data();

    const result: any = {};

    const repoToProject: Record<string, string> = {};
    repos.forEach(r => { repoToProject[r.id] = r.projectId });
    const projectOfRepo = (rid: string) => repoToProject[rid] || '';

    const daysOfMonth = makeDaysOfMonth<{ count: number; text: string; }>(yyyy, mm, { count: 0, text: '' });

    let totalPullRequests = 0;
    let totalClosedPullRequests = 0;
    let totalDeltaToCloseInHrs = 0.0;

    pullRequests
      .filter(pr => (isInRange(pr.creationDay, daysOfMonth) && projectOfRepo(pr.repoId) === projectId)) 
        // String(pr.creationDay).startsWith(`${yyyy}${mm}`))
      //.map(pr => ({ ...pr, creationDay: String(pr.creationDay) }))
      .forEach(pr => {
        const mid = pr.createdBy.uniqueName;
        const day = String(pr.creationDay);
        if (!(mid in result)) result[mid] = {}; // ...daysOfMonth };
        if (!(day in result[mid])) result[mid][day] = { count: 0, text: '' };
        result[mid][day].count += 1;
        result[mid][day].text += pr.title + '\n';
        totalPullRequests++;
        if (pr.closedDate) {
          totalClosedPullRequests++;
          const t0 = new Date(pr.creationDate);
          const t1 = new Date(pr.closedDate);
          const deltaInHrs = (t1.getTime() / 1000.0 - t0.getTime() / 1000.0) / 60.0 / 60.0;
          totalDeltaToCloseInHrs += deltaInHrs;
        }
      });

    const avgTimeToCloseInHrs = totalDeltaToCloseInHrs / totalClosedPullRequests;
    res.json({ data: result, meta: { totalPullRequests, totalClosedPullRequests, avgTimeToCloseInHrs }});
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
  app.get('/projects/:projectId/all-pull-requests/:yyyy/:mm', getAllPullRequestsByMonth);
  app.get('/projects/:projectId/pull-request-stats/:yyyy/:mm', getRepoPrStatsByMonth);

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
