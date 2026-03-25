import { RepoPullRequests } from './types';

export class RepoPullRequestsAdapter {
  constructor(
    protected result: RepoPullRequests.Root,
  ) {
    // do nothing
  }

  adapt() {
    const { count, value } = this.result;
    return {
      count,
      value: value.map(
        ({ pullRequestId, title, description, status, mergeStatus, isDraft, createdBy, creationDate }) => {
          return {
            id: pullRequestId,
            title,
            description,
            status,
            mergeStatus,
            isDraft,
            createdBy: {
              teamMemberId: createdBy.id,
              emailAddress: createdBy.uniqueName,
            },
            creationDate,
          };
        }
      ),
    };
  }
}
