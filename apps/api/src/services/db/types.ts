export namespace Db {
  export interface IData {
    projects  : Array<IProject>;
    teams     : Array<ITeam>;
    members   : Array<IMember>;
    repos     : Array<IRepo>;
    //identities: Array<IIdentity>;
    //users     : Array<IUser>;
    pullRequests: Array<IRepoPullRequest>;
  }

  export interface IProject {
    id         : string;
    name       : string;
    description: string;
  }

  export interface ITeam {
    projectId  : string;
    id         : string;
    name       : string;
    description: string;
  }

  export interface IRepo {
    projectId: string;
    id       : string;
    name     : string;
    webUrl   : string;
  }

  export interface IMember {
    teamId     : string;
    id         : string;
    descriptor : string;
    uniqueName : string;
    displayName: string;
  }

  export interface IRepoPullRequest {
    repoId             : string;
    id                 : number;
    title              : string;
    description        : string;
    status             : string;
    mergeStatus        : string;
    isDraft            : boolean;
    creationDate       : string;
    createdById        : string;
    createdByUniqueName: string;
    creationDay        : number;   // yyyymmdd
    closedDate         : string | null;
  }

  export interface IWorkItem {
    projectId          : string;
    id                 : number;
    title              : string;
    itemType           : string;
    state              : string;
    effort             : number;
    createdDate        : string;
    createdById        : string;
    createdByUniqueName: string;
  }
}

export interface IPullRequestStats {
  count: number;
  text: string;
}

export type IPullRequestStatsByDay = Record<string, IPullRequestStats>;
