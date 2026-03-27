import { WorkItems } from './types';

export class WorkItemsAdapter {
  constructor(
    protected result: WorkItems.Root,
  ) {
    // do nothing
  }

  adapt() {
    const { count, value } = this.result;
    return {
      count,
      value: value.map(
        ({ id, fields: f }) => ({
          id,
          title              : f['System.Title'],
          itemType           : f['System.WorkItemType'],
          state              : f['System.State'],
          createdDate        : f['System.CreatedDate'],
          createdById        : f['System.CreatedBy'].id,
          createdByUniqueName: f['System.CreatedBy'].uniqueName,
        }),
      ),
    };
  }
}
