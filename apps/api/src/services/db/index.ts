import { JSONFilePreset } from 'lowdb/node';

import { IConfig } from '../env-settings/types';
import { Db } from './types';

export type IDb = Awaited<ReturnType<typeof makeDb>>;

export async function makeDb(conf: IConfig['lowdb']) {
  const db = await JSONFilePreset<Db.IData>(conf.filePath, {
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

  return {
    db,
    data,
    addProject,
    addTeam,
    addMember,
    addRepo,
    addPullRequest,
  };
}
