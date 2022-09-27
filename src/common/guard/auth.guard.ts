import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY } from '../enum/roles.enum';

interface JwtClaims {
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization?.replace('Bearer ', '');

    let userRoles: string[];

    if (authorization !== null) {
      try {
        const data = this.jwtService.verify(authorization) as JwtClaims;
        userRoles = data?.roles;
      } catch (e: unknown) {
        return false;
      }
    }

    if (!roles || roles.some((itme) => userRoles.includes(itme))) {
      return true;
    }

    return false;
  }
}
