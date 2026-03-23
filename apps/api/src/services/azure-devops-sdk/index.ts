//import { IAxiosFactory } from '@rataqa/jalb';
import { type IBasicLogger } from '@rataqa/sijil';
import * as AzDev from 'azure-devops-node-api';

import { IConfig } from '../env-settings/types.js';

export type IAzureDevOpsApiViaSdk = ReturnType<typeof makeAzureDevOpsApiViaSdk>;

export function makeAzureDevOpsApiViaSdk(
  conf: IConfig['azureDevOps'],
  logger: IBasicLogger,
) {

  const authHandler = AzDev.getPersonalAccessTokenHandler(conf.pat);
  const webApi = new AzDev.WebApi(conf.orgUrl, authHandler);
  
  async function teams() {
    const connected = await webApi.connect();
    logger.info('Azure DevOps', { connected });
    const coreApi = await webApi.getCoreApi();
    //const project = await coreApi.getProject(conf.projectRef);
    //const projectAnalysisApi = await webApi.getProjectAnalysisApi();
    //const gitApi = await webApi.getGitApi();
    //const repoList = await gitApi.getRepositories(conf.projectRef);
    //const repoNames = repoList.map(r => r.name);

    const teams = await coreApi.getTeams(conf.projectRef);

    return teams;
  }

  async function repos() {
    const connected = await webApi.connect();
    logger.info('Azure DevOps', { connected });
    const gitApi = await webApi.getGitApi();
    const repoList = await gitApi.getRepositories(conf.projectRef);
    const repoNames = repoList.map(r => r.name);
    return repoNames;
  }

  return {
    webApi,
    teams,
    repos,
  };
}
