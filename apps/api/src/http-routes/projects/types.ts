import { Request } from 'express';

export type IRequestForx = Request<any, any, IRequestQueryForx>;

interface IRequestQueryForx {
  demo?: string;
}
