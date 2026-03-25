import { JSONFilePreset } from 'lowdb/node';

import { IConfig } from '../env-settings/types';


export async function makeDb(conf: IConfig['lowdb']) {
  const db = await JSONFilePreset(conf.filePath, {
    projects: [],
    teams: [],
    repos: [],
    members: [],
  });

  async function addProject(project: any) {
    const { projects } = await db.read();
    projects.push(project);
    await db.write();
  }

  return {
    db,
    addProject,
  };
}
