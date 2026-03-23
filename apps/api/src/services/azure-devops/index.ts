//import { makeAxiosFactory } from '@rataqa/jalb';
import axios from 'axios';
import { IBasicLogger } from '@rataqa/sijil';

import { IConfig } from '../env-settings/types.js';
import { base64 } from '../../utils/index.js';

export type IAzureDevOpsApi = ReturnType<typeof makeAzureDevOpsApi>;

export function makeAzureDevOpsApi(
  conf: IConfig['azureDevOps'],
  logger: IBasicLogger,
) {
  const { azureUrl, orgRef, projectRef, user, pat, pat64 } = conf;

  const auth = {
    username: conf.user,
    password: conf.pat,
  };

  // const b64 = base64.fromStr(`${user}:${pat}`);
  // const headers = {
  //   authorization: `Basic ${b64}`,
  // };

  //const ax = makeAxiosFactory(azureUrl, { headers });
  // const client = ax.makeAxiosPerRequest({}, logger);

  const client = axios.create({
    baseURL: azureUrl,
    auth,
  });

  function makeOrgApi() {

    const path = (p: string) => `/${orgRef}/_apis${p}`;

    async function projects() {
      return client.get(path('/projects'));
    }

    async function project(projectId: string) {
      return client.get(path(`/projects/${projectId}`));
    }

    async function teams(projectId: string) {
      return client.get(path(`/projects/${projectId}/teams`));
    }

    return {
      projects,
      project,
      teams,
    };
  }

  return {
    makeOrgApi,
  };
}
