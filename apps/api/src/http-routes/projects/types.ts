import { Request } from 'express';

export type IRequestByProject = Request<IRequestParamsByProject>;

interface IRequestParamsByProject {
  projectId: string;
}

export type IRequestByProjectAndTeam = Request<IRequestParamsByProjectAndTeam>;

interface IRequestParamsByProjectAndTeam extends IRequestParamsByProject {
  teamId: string;
}

export type IRequestByMember = Request<IRequestParamsByMember>;

interface IRequestParamsByMember {
  userDescriptor: string;
}
