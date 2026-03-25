import { User, Users } from './types';

export class UsersAdapter {
  constructor(
    protected result: Users.Root,
  ) {
    // do nothing
  }

  adapt() {
    const { count, value } = this.result;
    return {
      count,
      value: value.map(
        ({ subjectKind, metaType, displayName, principalName, mailAddress, descriptor }) => ({
          subjectKind,
          metaType,
          displayName,
          principalName,
          mailAddress,
          descriptor,
        })
      ),
    };
  }
}

export class UserAdapter {
  constructor(
    protected result: User.Root,
  ) {
    // do nothing
  }

  adapt() {
    const { displayName, principalName, mailAddress, descriptor } = this.result;
    return {
      descriptor,
      displayName,
      principalName,
      mailAddress,
    };
  }
}
