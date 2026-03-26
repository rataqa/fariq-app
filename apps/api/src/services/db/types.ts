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
    id         : string;
    name       : string;
    description: string;
    projectId  : string;
  }

  export interface IRepo {
    id       : string;
    name     : string;
    webUrl   : string;
    projectId: string;
  }

  export interface IMember {
    id         : string;
    descriptor : string;
    uniqueName : string;
    displayName: string;
    teamId     : string;
  }

  export interface IIdentity {
    id                 : string;
    descriptor         : string;
    subjectDescriptor  : string;
    providerDisplayName: string;
    isActive           : boolean;
  }

  export interface IUser {
    descriptor         : string;
    subjectDescriptor  : string;
    providerDisplayName: string;
    isActive           : boolean;
  };

  export interface IRepoPullRequest {
    repoId      : string;
    id          : number;
    title       : string;
    description : string;
    status      : string;
    mergeStatus : string;
    isDraft     : boolean;
    creationDate: string;
    createdBy   : { id: string; uniqueName: string; }
    creationDay : number; // yyyymmdd
    closedDate? : string;
  }

  export interface IWorkItem {
    id: number
    title      : string;
    itemType   : string;
    state      : string;
    effort     : number;
    createdDate: string;
    createdBy  : {
      id        : string;
      uniqueName: string;
    };
  }
}

export interface IPullRequestStats {
  count: number;
  text: string;
}

export type IPullRequestStatsByDay = Record<string, IPullRequestStats>;
