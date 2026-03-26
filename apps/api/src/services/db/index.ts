import { JSONFilePreset } from 'lowdb/node';

import { IConfig } from '../env-settings/types';
import { Db, IPullRequestStatsByDay } from './types';
import { dateDiffInHours, deepClone, isInMonth } from '../../utils';

export type IDb = Awaited<ReturnType<typeof makeDb>>;

export async function makeDb(conf: IConfig['lowdb']) {
  const db = await JSONFilePreset<Db.IData>(conf.coreFilePath, {
    projects    : [],
    teams       : [],
    members     : [],
    repos       : [],
    pullRequests: [],
  });

  async function data() {
    await db.read();
    return db.data;
  }

  async function addProject(row: Db.IProject) {
    await db.read();
    const found = db.data.projects.find(r => r.id === row.id);
    if (!found) {
      db.data.projects.push(row);
      await db.write();
    }
    return !!found;
  }

  async function addTeam(row: Db.ITeam) {
    await db.read();
    const found = db.data.teams.find(r => r.id === row.id);
    if (!found) {
      db.data.teams.push(row);
      await db.write();
    }
    return !!found;
  }

  async function addMember(row: Db.IMember) {
    await db.read();
    const found = db.data.members.find(r => r.id === row.id);
    if (!found) {
      db.data.members.push(row);
      await db.write();
    }
    return !!found;
  }

  async function addRepo(row: Db.IRepo) {
    await db.read();
    const found = db.data.repos.find(r => r.id === row.id);
    if (!found) {
      db.data.repos.push(row);
      await db.write();
    }
    return !!found;
  }

  async function addPullRequest(row: Db.IRepoPullRequest) {
    await db.read();
    const found = db.data.pullRequests.find(r => r.id === row.id);
    if (!found) {
      db.data.pullRequests.push(row);
      await db.write();
    }
    return !!found;
  }

  async function pullRequestsInReposOfProject(projectId: string) {
    await db.read();
    const { repos, pullRequests } = db.data;

    const repoToProject: Record<string, string> = {};
    repos.forEach(r => { repoToProject[r.id] = r.projectId });
    const projectOfRepo = (rid: string) => repoToProject[rid] || '';

    return pullRequests.filter(pr => projectOfRepo(pr.repoId) === projectId);
  }

  async function pullRequestsInReposOfProjectAndMonth(projectId: string, daysOfMonth: Record<string, unknown>) {
    const prList = await pullRequestsInReposOfProject(projectId);
    return prList.filter(pr => isInMonth(pr.creationDay, daysOfMonth));
  }

  async function pullRequestsInReposOfProjectAndMonthByMember(projectId: string, daysOfMonth: Record<string, unknown>, memberId: string) {
    const prList = await pullRequestsInReposOfProjectAndMonth(projectId, daysOfMonth);
    return prList.filter(pr => pr?.createdBy?.id === memberId);
  }

  function pullRequestsStatsGroupedByMembers(prList: Db.IRepoPullRequest[], daysOfMonth: IPullRequestStatsByDay) {
    const data: Record<string, IPullRequestStatsByDay> = {};

    let totalPullRequests = 0;
    let totalClosedPullRequests = 0;
    let totalDeltaToCloseInHrs = 0.0;

    prList.forEach(pr => {
        const email = pr.createdBy.uniqueName;
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
    data,
    addProject,
    addTeam,
    addMember,
    addRepo,
    addPullRequest,
    pullRequestsInReposOfProject,
    pullRequestsInReposOfProjectAndMonth,
    pullRequestsInReposOfProjectAndMonthByMember,
    pullRequestsStatsGroupedByMembers,
  };
}
