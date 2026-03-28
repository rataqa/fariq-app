export interface IProject {
  id         : string;
  name       : string;
  description: string;
}

export interface ITeam {
  id         : string;
  name       : string;
  description: string;
}

export interface IMember {
  id         : string;
  uniqueName : string;
  displayName: string;
}

export interface IApiResponse<TBody = any> {
  data: TBody;
}

export interface IApiResponseWithList<TBody = any> {
  data: TBody[];
  count: number;
}

export type IApiResponseWithProject = IApiResponse<IProject>;
export type IApiResponseWithProjects = IApiResponseWithList<IProject>;

export type IApiResponseWithTeam = IApiResponse<ITeam>;
export type IApiResponseWithTeams = IApiResponseWithList<ITeam>;

export type IApiResponseWithMember = IApiResponse<IMember>;
export type IApiResponseWithMembers = IApiResponseWithList<IMember>;

export interface IPullRequestStats {
  count: number;
  text: string;
}

export type IPullRequestStatsByDay = Record<string, IPullRequestStats>;

export interface IApiResponseWithPullRequestStats {
  data?: {
    [memberEmail: string]: {
      [yyyymmdd: string]: {
        count: number
        text: string
      };
    };
  };
  meta?: {
    totalPullRequests      ?: number;
    totalClosedPullRequests?: number;
    avgTimeToCloseInHrs    ?: number;
  };
}
