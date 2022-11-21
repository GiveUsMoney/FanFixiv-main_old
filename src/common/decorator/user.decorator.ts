import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { api } from '../utils/api';
import { UserInfo, UserProfile } from '@src/interfaces/user.interface';
import { config } from 'dotenv';

config({
  path: `.env.${process.env.NODE_ENV}`,
});

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number | null => {
    const { user } = ctx
      .switchToHttp()
      .getRequest<Request & { user: UserInfo }>();
    return user ? parseInt(user?.sub) : -1;
  },
);

export const Profile = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Promise<UserProfile | null> => {
    const { authorization } = ctx.switchToHttp().getRequest<Request>().headers;

    if (authorization === null) return null;

    if (process.env.NODE_ENV === 'test') {
      if (authorization === 'Bearer ADULT')
        return new Promise<UserProfile>((res) => {
          res({
            email: 'example@example.com',
            nickname: 'test',
            profile_img: null,
            descript: 'test',

            nn_md_date: '2022-10-17',
            birth: '2000-01-01',
            _tr: false,
          } as UserProfile);
        });
      else if (authorization === 'Bearer CHILD')
        return new Promise<UserProfile>((res) => {
          res({
            email: 'example@example.com',
            nickname: 'test',
            profile_img: null,
            descript: 'test',

            nn_md_date: '2022-10-17',
            birth: '3000-01-01',
            _tr: false,
          } as UserProfile);
        });
    }

    return api<UserProfile>(process.env.USER_SERVER + '/profile', {
      headers: { authorization },
    }).catch(() => null);
  },
);
