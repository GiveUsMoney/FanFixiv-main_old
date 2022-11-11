import { Action } from '@src/interfaces/action.interface';

export class ActionDto implements Action {
  constructor(obj: any) {
    Object.assign(this, obj);
  }

  ip: string;

  user: number;

  path: string;

  data: any;

  time: string;
}
