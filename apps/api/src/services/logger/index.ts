import { makeLogger } from '@rataqa/sijil';

import { IConfig } from '../env-settings/types';

export function makeMyLogger(config: IConfig) {
  return makeLogger('pino', config.appInfo, { level: config.logger.level });
}
