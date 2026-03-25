import { Identities } from './identities';
import { TeamMembers } from './team-members/types';
import { Projects } from './projects/types';
import { RepoPullRequests } from './repo-pull-requests/types';
import { RepoStats } from './repo-stats/types';
import { Repos } from './repos/types';
import { Teams } from './teams/types';
import { User, Users } from './users/types';

export namespace AzureDevOpsModels {
  export interface IList<TRow> {
    count: number;
    value: TRow[];
  }

  export type IProjects = Projects.Root;

  export type ITeams = Teams.Root;

  export type ITeamMembers = TeamMembers.Root;

  export type IIdentities = Identities.Root;

  export type IUsers = Users.Root;

  export type IUser = User.Root;

  export type IRepos = Repos.Root;
  export type IReposSearchOptions = Repos.ISearchOptions;

  export type IRepoPullRequests = RepoPullRequests.Root;

  export type IRepoStats = RepoStats.Root;
}
