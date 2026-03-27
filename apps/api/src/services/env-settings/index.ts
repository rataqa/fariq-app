import { MuhitService } from '@rataqa/muhit';

import { IConfig, IEnvSettings } from './types';
import { base64 } from '../../utils';

export class MyEnvSettings extends MuhitService<IEnvSettings> {
  config(): IConfig {
    const azureUrl = this.str('AZURE_DEVOPS_BASE_URL', 'https://dev.azure.com');
    const vsspsUrl = this.str('AZURE_VSSPS_BASE_URL', 'https://vssps.dev.azure.com');
    const azureOrg = this.strRequired('AZURE_DEVOPS_ORG');
    const azurePat = this.strRequired('AZURE_DEVOPS_PAT');
    return {
      appInfo: {
        appName: 'api',
        appVersion: '1.2.3',
      },
      http: {
        port: this.portRequired('HTTP_PORT'),
      },
      logger: {
        level: this.str('LOG_LEVEL', 'info'),
      },
      azureDevOps: {
        vsspsUrl,
        azureUrl,
        orgRef    : azureOrg,
        projectRef: this.strRequired('AZURE_DEVOPS_PROJECT'),
        user      : this.strRequired('AZURE_DEVOPS_USER'),
        pat       : azurePat,
        pat64     : base64.fromStr(azurePat),
      },
      prisma: {
        connectionString: this.strRequired('DATABASE_URL'),
      },
    };
  }
}
