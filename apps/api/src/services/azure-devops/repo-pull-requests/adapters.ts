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
        ({ pullRequestId, title, description, status, mergeStatus, isDraft, createdBy }) => {
          return {
            id: pullRequestId,
            title,
            description,
            status,
            mergeStatus,
            isDraft,
            createdBy: createdBy.uniqueName,
          };
        }
      ),
    };
  }
}
