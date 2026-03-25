// @see https://learn.microsoft.com/en-us/rest/api/azure/devops/core/projects?view=azure-devops-rest-7.1

//import { makeAxiosFactory } from '@rataqa/jalb';
import axios from 'axios';
import { IBasicLogger } from '@rataqa/sijil';

import { IConfig } from '../env-settings/types';
import { base64 } from '../../utils';
import { AzureDevOpsModels as M } from './types';

import { UserAdapter, UsersAdapter } from './users/adapters';
import { TeamMembersAdapter } from './team-members/adapters';
import { TeamsAdapter } from './teams/adapters';
import { ProjectsAdapter } from './projects/adapters';
import { ReposAdapter } from './repos/adapters';
import { RepoPullRequestsAdapter } from './repo-pull-requests/adapters';
import { RepoStatsAdapter } from './repo-stats/adapters';
import { IdentitiesAdapter } from './identities';

export type IAzureDevOpsApi = ReturnType<typeof makeAzureDevOpsApi>;

export function makeAzureDevOpsApi(
  conf: IConfig['azureDevOps'],
  logger: IBasicLogger,
) {
  const { azureUrl, vsspsUrl, orgRef, projectRef, user, pat } = conf;

  const b64 = base64.fromStr(`${user}:${pat}`);

  const headers = {
    authorization: `Basic ${b64}`,
  };

  //const ax = makeAxiosFactory(azureUrl, { headers });
  // const client = ax.makeAxiosPerRequest({}, logger);

  const client = axios.create({ baseURL: azureUrl, headers, params: { 'api-version': '7.1' }});
  const clientVssps = axios.create({ baseURL: vsspsUrl, headers, params: { 'api-version': '7.1-preview.1' }});

  function makeOrgApi() {

    async function projects() {
      const res = await client.get<M.IProjects>(`/${orgRef}/_apis/projects`);
      return new ProjectsAdapter(res.data);
    }

    async function project(projectId = projectRef) {
      const res = await client.get(`/${orgRef}/_apis/projects/${projectId}`);
      return res.data;
    }

    async function teams(projectId = projectRef) {
      const res = await client.get<M.ITeams>(`/${orgRef}/_apis/projects/${projectId}/teams`);
      return new TeamsAdapter(res.data);
    }

    async function team(projectId = projectRef, teamId: string) {
      const res = await client.get(`/${orgRef}/_apis/projects/${projectId}/teams/${teamId}`);
      return res.data;
    }

    async function teamMembers(projectId = projectRef, teamId: string) {
      const res = await client.get<M.ITeamMembers>(`/${orgRef}/_apis/projects/${projectId}/teams/${teamId}/members`);
      return new TeamMembersAdapter(res.data);
    }

    async function identities(identityIdCsv = '', descriptorsCsv = '') {
      const params = identityIdCsv ? { identityIds: identityIdCsv } : { subjectDescriptors: descriptorsCsv };
      const res = await client.get<M.IIdentities>(`/${orgRef}/_apis/identities`, { params });
      return new IdentitiesAdapter(res.data);
    }

    async function users() {
      const res = await clientVssps.get<M.IUsers>(`/${orgRef}/_apis/graph/users`);
      return new UsersAdapter(res.data);
    }

    async function user(userDescriptor: string) {
      const res = await clientVssps.get<M.IUser>(`/${orgRef}/_apis/graph/users/${userDescriptor}`);
      return new UserAdapter(res.data);
    }

    async function repos(projectId = projectRef) {
      const res = await client.get<M.IRepos>(`/${orgRef}/${projectId}/_apis/git/repositories`);
      return new ReposAdapter(res.data);
    }

    async function repoPullRequests(repoId: string, options: M.IReposSearchOptions = {}, projectId = projectRef) {
      const params = { $top: 100, 'searchCriteria.status': 'active', ...options };
      const path = `/${orgRef}/${projectId}/_apis/git/repositories/${repoId}/pullrequests`;
      const res = await client.get<M.IRepoPullRequests>(path, { params });
      return new RepoPullRequestsAdapter(res.data);
    }

    async function repoStats(repoId: string, projectId = projectRef) {
      const path = `/${orgRef}/${projectId}/_apis/git/repositories/${repoId}/stats/branches`;
      const res = await client.get<M.IRepoStats>(path);
      return new RepoStatsAdapter(res.data);
    }

    return {
      projects,
      project,
      teams,
      team,
      teamMembers,
      identities,
      users,
      user,
      repos,
      repoPullRequests,
      repoStats,
    };
  }

  return {
    client,
    clientVssps,
    makeOrgApi,
  };
}
