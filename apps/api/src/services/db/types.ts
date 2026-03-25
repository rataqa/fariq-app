export namespace Db {
  export interface IData {
    projects  : Array<IProject>;
    teams     : Array<ITeam>;
    members   : Array<IMember>;
    repos     : Array<IRepo>;
    //identities: Array<IIdentity>;
    //users     : Array<IUser>;
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
}
