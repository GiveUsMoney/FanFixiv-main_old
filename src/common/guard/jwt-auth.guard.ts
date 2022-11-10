import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from '@src/dto/user.dto';
import { ROLES_KEY } from '../enum/roles.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    const { user } = context.switchToHttp().getRequest<{ user: UserInfo }>();

    if (!roles) return true;

    return user.roles.some((x) => roles.includes(x)) && (result as boolean);
  }
}
