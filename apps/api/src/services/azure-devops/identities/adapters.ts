import { Identities } from './types';

export class IdentitiesAdapter {
  constructor(
    protected result: Identities.Root,
  ) {
    // do nothing
  }

  adapt() {
    const { count, value } = this.result;
    return {
      count,
      value: value.map(
        ({ id, providerDisplayName, isActive, subjectDescriptor }) => ({
          id,
          providerDisplayName,
          isActive,
          subjectDescriptor,
        })
      ),
    };
  }
}


