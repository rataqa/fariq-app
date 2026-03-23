
import { type IBasicLogger } from '@rataqa/sijil';
import { Request, Response } from 'express';

export interface IInputToGet {
  lat: number;
  lon: number;
}

export type IRequest = Request<any, any, IInputToGet>;

export type IResponse<TBody = any> = Response<TBody, IResLocals>;

export interface IResLocals {
  log: IBasicLogger;
  t0: Date;
  id: string;
}
