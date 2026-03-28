import { IBasicLogger } from '@rataqa/sijil';

import { PrismaClient } from '../../generated/prisma/client';
import { dateDiffInHours, deepClone } from '../../utils';
import { Db, IPullRequestStatsByDay } from './types';
import { title } from 'process';

export type IDb = ReturnType<typeof makeDb>;

export function makeDb(db: PrismaClient, logger: IBasicLogger) {

  async function upsertProject(data: Db.IProject) {
    let found = await db.project.findUnique({ where: { id: data.id }});
    if (!found) {
      found = await db.project.create({ data });
    }
    return found;
  }

  async function findProjects() {
    return db.project.findMany();
  }

  async function findProject(id: string) {
    return db.project.findUnique({ where: { id }});
  }

  async function upsertTeam(data: Db.ITeam) {
    let found = await db.team.findUnique({ where: { id: data.id }});
    if (!found) {
      found = await db.team.create({ data });
    }
    return found;
  }

  async function findTeamsByProject(projectId: string ) {
    return db.team.findMany({ where: { projectId }});
  }

  async function upsertMember(data: Db.IMember) {
    let found = await db.member.findUnique({ where: { id: data.id }});
    if (!found) {
      found = await db.member.create({ data });
      logger.info('new member', { member: data.uniqueName });
    }
    return found;
  }

  async function findMembersByProject(projectId: string ) {
    const teams = await findTeamsByProject(projectId);
    const teamIdList = teams.map(t => t.id);
    return db.member.findMany({ where: { teamId: { in: teamIdList }}});
  }

  async function findMembersByTeam(teamId: string ) {
    return db.member.findMany({ where: { teamId }});
  }

  async function upsertRepo(data: Db.IRepo) {
    let found = await db.repo.findUnique({ where: { id: data.id }});
    if (!found) {
      found = await db.repo.create({ data });
      logger.info(' + new repo', { name: data.name });
    }
    return found;
  }

  async function findRepo(repoId: string ) {
    return db.repo.findUnique({ where: { id: repoId }});
  }

  async function findReposByProject(projectId: string ) {
    return db.repo.findMany({ where: { projectId }});
  }

  async function upsertPullRequest(data: Db.IPullRequest, repoName = '', updateWhenFound = false) {
    let found = await db.pullRequest.findUnique({ where: { id: data.id }});
    if (!found) {
      logger.info('  + insert PR', { repo: repoName, id: data.id, title: data.title });
      found = await db.pullRequest.create({ data });
      //logger.info('new PR', { id: data.id, title: data.title });
    } else if (updateWhenFound) {
      logger.info('  * update PR', { repo: repoName, id: data.id, title: data.title });
      const change = {
        isDraft: data.isDraft,
        status: data.status,
        ...(found.mergeStatus !== data.mergeStatus && { mergeStatus: data.mergeStatus }),
        ...(found.title !== data.title && { title: data.title }),
        ...(found.description !== data.description && { description: data.description }),
      };
      await db.pullRequest.update({ where: { id: data.id }, data: change });
      logger.debug('updated PR', { id: data.id, change });
    }
    return found;
  }

  async function pullRequestsInReposOfProject(projectId: string) {
    const repos = await db.repo.findMany({ where: { projectId }});
    const repoIdList = repos.map(r => r.id);
    const pullRequests = await db.pullRequest.findMany({ where: { repoId: { in: repoIdList }}});
    return pullRequests;
  }

  async function pullRequestsInRepo(repoId: string) {
    const pullRequests = await db.pullRequest.findMany({ where: { repoId }});
    return pullRequests;
  }

  async function pullRequestsInReposOfProjectAndMonth(projectId: string, dayList: number[]) {
    const repos = await db.repo.findMany({ where: { projectId }});
    const repoIdList = repos.map(r => r.id);
    const pullRequests = await db.pullRequest.findMany({
      where: {
        repoId: { in: repoIdList },
        creationDay: { in: dayList },
      },
    });
    return pullRequests;
  }

  async function pullRequestsInReposOfProjectAndMonthByMember(projectId: string, dayList: number[], memberId: string) {
    const repos = await db.repo.findMany({ where: { projectId }});
    const repoIdList = repos.map(r => r.id);
    const pullRequests = await db.pullRequest.findMany({
      where: {
        repoId: { in: repoIdList },
        creationDay: { in: dayList },
        createdById: memberId,
      },
    });
    return pullRequests;
  }

  function pullRequestsStatsGroupedByMembers(prList: Db.IPullRequest[], daysOfMonth: IPullRequestStatsByDay) {
    const data: Record<string, IPullRequestStatsByDay> = {};

    let totalPullRequests = 0;
    let totalClosedPullRequests = 0;
    let totalDeltaToCloseInHrs = 0.0;

    prList.forEach(pr => {
        const email = pr.createdByUniqueName;
        const day = String(pr.creationDay);
        if (!(email in data)) data[email] = deepClone(daysOfMonth);
        if (!(day in data[email])) data[email][day] = { count: 0, text: '' };

        data[email][day].count += 1;
        data[email][day].text += pr.title + '\n';

        totalPullRequests++;
        if (pr.closedDate) {
          totalClosedPullRequests++;
          totalDeltaToCloseInHrs += dateDiffInHours(pr.closedDate, pr.creationDate);
        }
      });

    const avgTimeToCloseInHrs = totalClosedPullRequests > 0 ? totalDeltaToCloseInHrs / totalClosedPullRequests : 0;
    return {
      data,
      meta: {
        totalPullRequests,
        totalClosedPullRequests,
        avgTimeToCloseInHrs: Math.round(10.0 * avgTimeToCloseInHrs) / 10.0,
      },
    };
  }

  return {
    db,
    upsertProject,
    findProject,
    findProjects,

    upsertTeam,
    findTeamsByProject,

    upsertMember,
    findMembersByProject,
    findMembersByTeam,

    upsertRepo,
    findRepo,
    findReposByProject,

    upsertPullRequest,
    pullRequestsInRepo,
    pullRequestsInReposOfProject,
    pullRequestsInReposOfProjectAndMonth,
    pullRequestsInReposOfProjectAndMonthByMember,
    pullRequestsStatsGroupedByMembers,
  };
}
