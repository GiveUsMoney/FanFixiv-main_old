import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from '@src/interfaces/user.interface';
import { Role, ROLES_KEY } from '../enum/roles.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextType = context.getType<'http' | 'rmq'>();

    if (contextType === 'rmq') return true;

    await super.canActivate(context);
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    const { user } = context.switchToHttp().getRequest<{ user: UserInfo }>();

    if (!roles) return true;

    if (!user) throw new UnauthorizedException();

    return user.roles.some((x) => roles.includes(x));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err, user, info, context, status) {
    if (err) {
      throw err || new UnauthorizedException();
    }
    if (process.env.NODE_ENV === 'test') {
      return {
        sub: 1,
        roles: [Role.USER],
      };
    }
    return user;
  }
}
