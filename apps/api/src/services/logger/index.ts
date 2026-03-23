import { makeLogger } from '@rataqa/sijil';

// TODO: avoid using .js
import { IConfig } from '../env-settings/types.js';

export function makeMyLogger(config: IConfig) {
  return makeLogger('pino', config.appInfo, { level: config.logger.level });
}
