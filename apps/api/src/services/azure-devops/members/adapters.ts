import { Members } from './types';

export class MembersAdapter {
  constructor(
    protected result: Members.Root,
  ) {
    // do nothing
  }

  adapt() {
    const { count, value } = this.result;
    return {
      count,
      value: value.map(
        ({ identity }) => {
          const { id, displayName, uniqueName, descriptor } = identity;
          return {
            id,
            descriptor,
            uniqueName,
            displayName,
          };
        }
      ),
    };
  }
}
