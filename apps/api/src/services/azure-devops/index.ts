// @see https://learn.microsoft.com/en-us/rest/api/azure/devops/core/projects?view=azure-devops-rest-7.1

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
  const { azureUrl, vsspsUrl, orgRef, projectRef, user, pat } = conf;

  const b64 = base64.fromStr(`${user}:${pat}`);

  const headers = {
    authorization: `Basic ${b64}`,
  };

  //const ax = makeAxiosFactory(azureUrl, { headers });
  // const client = ax.makeAxiosPerRequest({}, logger);

  const client = axios.create({ baseURL: azureUrl, headers, params: { 'api-version': '7.1' }});
  const clientVssps = axios.create({ baseURL: vsspsUrl, headers, params: { 'api-version': '7.1-preview.1' }});

  function makeOrgApi() {

    async function projects() {
      const res = await client.get(`/${orgRef}/_apis/projects`);
      return res.data;
    }

    async function project(projectId = projectRef) {
      const res = await client.get(`/${orgRef}/_apis/projects/${projectId}`);
      return res.data;
    }

    async function teams(projectId = projectRef) {
      const res = await client.get(`/${orgRef}/_apis/projects/${projectId}/teams`);
      return res.data;
    }

    async function team(projectId = projectRef, teamId: string) {
      const res = await client.get(`/${orgRef}/_apis/projects/${projectId}/teams/${teamId}`);
      return res.data;
    }

    async function teamMembers(projectId = projectRef, teamId: string) {
      const res = await client.get(`/${orgRef}/_apis/projects/${projectId}/teams/${teamId}/members`);
      return res.data;
    }

    async function user(userDescriptor: string) {
      const res = await clientVssps.get(`/${orgRef}/_apis/graph/users/${userDescriptor}`);
      return res.data;
    }

    return {
      projects,
      project,
      teams,
      team,
      teamMembers,
      user,
    };
  }

  return {
    client,
    clientVssps,
    makeOrgApi,
  };
}
