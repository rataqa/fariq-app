import { format } from 'date-fns';
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
        ({ pullRequestId, title, description, status, mergeStatus, isDraft, createdBy, creationDate, closedDate }) => {
          return {
            id: pullRequestId,
            title,
            description,
            status,
            mergeStatus,
            isDraft,
            creationDate,
            createdById        : createdBy.id,
            createdByUniqueName: createdBy.uniqueName,
            creationDay        : parseInt(format(new Date(creationDate), 'yyyyMMdd')),
            closedDate         : closedDate || null,
          };
        }
      ),
    };
  }
}
