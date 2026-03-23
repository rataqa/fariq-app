import dotenv from 'dotenv';
import express from 'express';

import { makeAxiosFactory } from '@rataqa/jalb';
import { mwFactory } from '@rataqa/wasit';

import { makeAzureDevOpsApiViaSdk } from './services/azure-devops-sdk/index.js';
import { makeAzureDevOpsApi } from './services/azure-devops/index.js';
import { MyEnvSettings } from './services/env-settings/index.js';
import { makeMyLogger } from './services/logger/index.js';

import { makeRoutes } from './http-routes/index.js';

import makeRoutesForAzureDevOpsProjects from './http-routes/projects/index.js';
import makeRoutesForAzureDevOpsRepos from './http-routes/repos/index.js';
import makeRoutesForAzureDevOpsTeams from './http-routes/teams/index.js';

export function factory() {

  dotenv.config();

  const app = express();

  const env = new MyEnvSettings(process.env);
  const config = env.config();

  const logger = makeMyLogger(config);

  const azureDevOpsViaSdk = makeAzureDevOpsApiViaSdk(config.azureDevOps, logger.defaultLogger);
  
  const azureDevOps = makeAzureDevOpsApi(config.azureDevOps, logger.defaultLogger);

  const mw = mwFactory(logger);

  mw.useAtStart(app);
  makeRoutes(app, config);
  makeRoutesForAzureDevOpsProjects(app, azureDevOps);
  makeRoutesForAzureDevOpsRepos(app, azureDevOpsViaSdk);
  makeRoutesForAzureDevOpsTeams(app, azureDevOpsViaSdk);
  mw.useAtFinish(app);

  return {
    app,
    config,
    env,
    logger,
    azureDevOps,
  };
}
