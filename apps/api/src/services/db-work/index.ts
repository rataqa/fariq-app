import { JSONFilePreset } from 'lowdb/node';

import { IConfig } from '../env-settings/types';
import { DbWork } from './types';

export type IDbWork = Awaited<ReturnType<typeof makeDbWork>>;

export async function makeDbWork(conf: IConfig['lowdb']) {
  const db = await JSONFilePreset<DbWork.IData>(conf.workFilePath, {
    workItems: [],
  });

  async function data() {
    await db.read();
    return db.data;
  }

  async function addWorkItem(row: DbWork.IWorkItem) {
    await db.read();
    const found = db.data.workItems.find(r => r.id === row.id);
    if (!found) {
      db.data.workItems.push(row);
      await db.write();
    }
    return !!found;
  }

  return {
    db,
    data,
    addWorkItem,
  };
}
