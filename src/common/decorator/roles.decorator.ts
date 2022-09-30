import { SetMetadata } from '@nestjs/common';
import { Role, ROLES_KEY } from '../enum/roles.enum';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
