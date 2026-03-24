import { Teams } from './types';

export class TeamsAdapter {
  constructor(
    protected result: Teams.Root,
  ) {
    // do nothing
  }

  adapt() {
    const { count, value } = this.result;
    return {
      count,
      value: value.map(
        ({ id, name, description }) => ({
          id,
          name,
          description,
        })
      ),
    };
  }
}
