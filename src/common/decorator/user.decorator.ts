import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { IProfile } from '../sdto/ProfileDto';
import { api } from '../utils/api';

export const User = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const { authorization } = ctx.switchToHttp().getRequest<Request>().headers;

    //TODO: 후일 localhost에서 인증서버의 주소로 변경할 것.
    return await api<IProfile>('http://localhost:8080/profile', {
      headers: { authorization },
    });
  },
);
