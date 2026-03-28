import { Request } from 'express';

export type IRequestByProject = Request<IRequestParamsByProject>;

interface IRequestParamsByProject extends Record<string, string> {
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

export type IRequestByProjectAndRepo = Request<IRequestParamsByProjectAndRepo>;

interface IRequestParamsByProjectAndRepo extends IRequestParamsByProject {
  repoId: string;
}

export type IRequestByProjectAndYearMonth = Request<IRequestParamsByProjectAndYearMonth>;

interface IRequestParamsByProjectAndYearMonth extends IRequestParamsByProject {
  yyyy: string;
  mm: string;
}

export type IRequestByProjectAndYearMonthMember = Request<IRequestParamsByProjectAndYearMonthMember>;

interface IRequestParamsByProjectAndYearMonthMember extends IRequestParamsByProject {
  memberId: string;
  yyyy: string;
  mm: string;
}

export type IRequestByProjectAndYearMonthDay = Request<IRequestParamsByProjectAndYearMonthDay>;

interface IRequestParamsByProjectAndYearMonthDay extends IRequestParamsByProject {
  yyyy: string;
  mm: string;
  dd: string;
}
