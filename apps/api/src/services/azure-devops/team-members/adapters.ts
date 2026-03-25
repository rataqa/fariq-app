import { TeamMembers } from './types';

export class TeamMembersAdapter {
  constructor(
    protected result: TeamMembers.Root,
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
