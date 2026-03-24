import { Projects } from './types';

export class ProjectsAdapter {
  constructor(
    protected result: Projects.Root,
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
