import axios from 'axios';
import * as M from './types';

export type IApi = ReturnType<typeof makeApi>;

export function makeApi(baseURL = '/api') {
  const c = axios.create({ baseURL });

  async function getProjects() {
    const res = await c.get<M.IApiResponseWithProjects>('/projects');
    return res.data;
  }

  async function getTeams(projectId: string) {
    const res = await c.get<M.IApiResponseWithTeams>(`/projects/${projectId}/teams`);
    return res.data;
  }

  async function getMembers(projectId: string, teamId: string) {
    const res = await c.get<M.IApiResponseWithMembers>(`/projects/${projectId}/teams/${teamId}/members`);
    return res.data;
  }

  async function getMemberStats(projectId: string, memberId: string, yyyy: string, mm: string) {
    const res = await c.get<M.IApiResponseWithPullRequestStats>(`/projects/${projectId}/members/${memberId}/pull-request-stats/${yyyy}/${mm}`);
    return res.data;
  }

  return {
    getProjects,
    getTeams,
    getMembers,
    getMemberStats,
  };
}
