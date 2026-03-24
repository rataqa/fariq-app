import { RepoStats } from './types';

export class RepoStatsAdapter {
  constructor(
    protected result: RepoStats.Root,
  ) {
    // do nothing
  }

  adapt() {
    const { count, value } = this.result;
    return {
      count,
      value: value.map(
        ({ commit }) => {
          const { commitId, comment, committer, author } = commit;
          return {
            commitId,
            comment,
            author: author.email,
            committer: committer.email,
          };
        }
      ),
    };
  }
}
