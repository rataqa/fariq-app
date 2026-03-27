import { Db, IPullRequestStatsByDay } from './types';
import { dateDiffInHours, deepClone } from '../../utils';
import { PrismaClient } from '../../generated/prisma/client';

export type IDb = ReturnType<typeof makeDb>;

export function makeDb(db: PrismaClient) {

  async function upsertProject(data: Db.IProject) {
    const found = await db.project.findUnique({ where: { id: data.id }});
    if (!found) {
      await db.project.create({ data });
    }
    return !!found;
  }

  async function findProjects() {
    return db.project.findMany();
  }

  async function findProject(id: string) {
    return db.project.findUnique({ where: { id }});
  }

  async function upsertTeam(data: Db.ITeam) {
    const found = db.team.findUnique({ where: { id: data.id }});
    if (!found) {
      await db.team.create({ data });
    }
    return !!found;
  }

  async function findTeamsByProject(projectId: string ) {
    return db.team.findMany({ where: { projectId }});
  }

  async function upsertMember(data: Db.IMember) {
    const found = db.member.findUnique({ where: { id: data.id }});
    if (!found) {
      await db.member.create({ data });
    }
    return !!found;
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
    const found = db.repo.findUnique({ where: { id: data.id }});
    if (!found) {
      await db.repo.create({ data });
    }
    return !!found;
  }

  async function findReposByProject(projectId: string ) {
    return db.repo.findMany({ where: { projectId }});
  }

  async function upsertPullRequest(data: Db.IRepoPullRequest) {
    const found = db.repoPullRequest.findUnique({ where: { id: data.id }});
    if (!found) {
      await db.repoPullRequest.create({ data });
    }
    return !!found;
  }

  async function pullRequestsInReposOfProject(projectId: string) {
    const repos = await db.repo.findMany({ where: { projectId }});
    const repoIdList = repos.map(r => r.id);
    const pullRequests = await db.repoPullRequest.findMany({
      where: { repoId: { in: repoIdList }}
    });
    return pullRequests;
  }

  async function pullRequestsInReposOfProjectAndMonth(projectId: string, dayList: number[]) {
    const repos = await db.repo.findMany({ where: { projectId }});
    const repoIdList = repos.map(r => r.id);
    const pullRequests = await db.repoPullRequest.findMany({
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
    const pullRequests = await db.repoPullRequest.findMany({
      where: {
        repoId: { in: repoIdList },
        creationDay: { in: dayList },
        createdById: memberId,
      },
    });
    return pullRequests;
  }

  function pullRequestsStatsGroupedByMembers(prList: Db.IRepoPullRequest[], daysOfMonth: IPullRequestStatsByDay) {
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
    findReposByProject,

    upsertPullRequest,
    pullRequestsInReposOfProject,
    pullRequestsInReposOfProjectAndMonth,
    pullRequestsInReposOfProjectAndMonthByMember,
    pullRequestsStatsGroupedByMembers,
  };
}
