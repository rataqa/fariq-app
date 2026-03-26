import { IProcessEnv } from '@rataqa/muhit';

export interface IEnvSettings extends IProcessEnv {
  HTTP_PORT?: string;
  LOG_LEVEL?: string;

  AZURE_DEVOPS_BASE_URL?: string;
  AZURE_VSSPS_BASE_URL?: string;
  AZURE_DEVOPS_ORG     ?: string;
  AZURE_DEVOPS_PROJECT ?: string;
  AZURE_DEVOPS_USER    ?: string;
  AZURE_DEVOPS_PAT     ?: string;

  LOWDB_CORE_FILE_PATH?: string;
  LOWDB_WORK_FILE_PATH?: string;
}

export interface IConfig {
  appInfo: {
    appName: string;
    appVersion: string;
  };
  http: {
    port: number;
  };
  logger: {
    level: string;
  };
  azureDevOps: {
    azureUrl  : string;
    vsspsUrl  : string;
    orgRef    : string;
    projectRef: string;
    user      : string;
    pat       : string;
    pat64     : string;  // in base64
  };
  lowdb: {
    coreFilePath: string;
    workFilePath: string;
  };
}
