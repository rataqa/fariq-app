import dotenv from 'dotenv';
import express from 'express';

//import { makeAxiosFactory } from '@rataqa/jalb';
import { mwFactory } from '@rataqa/wasit';

import { makeAzureDevOpsApi } from './services/azure-devops';
import { MyEnvSettings } from './services/env-settings';
import { makeMyLogger } from './services/logger';

import { makeRoutes } from './http-routes';

import makeRoutesForAzureDevOpsProjects from './http-routes/projects';
import { makeDb } from './services/db';
import { makePrisma } from './services/prisma';

export async function factory() {

  dotenv.config();

  const app = express();

  const env = new MyEnvSettings(process.env);
  const config = env.config();

  const logger = makeMyLogger(config);

  const prisma = makePrisma(config.prisma);
  const db = makeDb(prisma);

  const azureDevOps = makeAzureDevOpsApi(config.azureDevOps, logger.defaultLogger);

  const mw = mwFactory(logger);

  mw.useAtStart(app);
  makeRoutes(app, config);
  makeRoutesForAzureDevOpsProjects(app, azureDevOps, db, logger.defaultLogger);
  mw.useAtFinish(app);

  return {
    app,
    config,
    env,
    logger,
    azureDevOps,
  };
}
