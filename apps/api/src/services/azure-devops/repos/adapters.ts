import { Repos } from './types';

export class ReposAdapter {
  constructor(
    protected result: Repos.Root,
  ) {
    // do nothing
  }

  adapt() {
    const { count, value } = this.result;
    return {
      count,
      value: value.map(
        ({ id, name, webUrl, project }) => ({
          id,
          name,
          webUrl,
          projectId: project.id,
        })
      ),
    };
  }
}
