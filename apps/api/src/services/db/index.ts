import { JSONFilePreset } from 'lowdb/node';

import { IConfig } from '../env-settings/types';
import { Db } from './types';

export type IDb = Awaited<ReturnType<typeof makeDb>>;

export async function makeDb(conf: IConfig['lowdb']) {
  const db = await JSONFilePreset<Db.IData>(conf.filePath, {
    projects: [],
    teams   : [],
    members : [],
    repos   : [],
  });

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

  return {
    db,
    addProject,
    addTeam,
    addMember,
    addRepo,
  };
}
