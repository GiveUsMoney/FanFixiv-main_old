import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../enum/roles.enum';

interface JwtClaims {
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    const { user } = context.switchToHttp().getRequest<{ user: JwtClaims }>();

    if (!roles) return true;

    return roles.some((item) => user?.roles.includes(item));
  }
}
