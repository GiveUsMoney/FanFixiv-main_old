import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { IProfile } from '@src/dto/ProfileDto';
import { api } from '../utils/api';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Promise<IProfile | null> => {
    const { authorization } = ctx.switchToHttp().getRequest<Request>().headers;

    if (authorization == null) return null;

    //TODO: 후일 localhost에서 인증서버의 주소로 변경할 것.
    return api<IProfile>('http://localhost:8080/profile', {
      headers: { authorization },
    }).catch(() => null);
  },
);
