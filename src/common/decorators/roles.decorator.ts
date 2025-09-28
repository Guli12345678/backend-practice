import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../generated/prisma';

export type AllowedRoles = Role;

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AllowedRoles[]) =>
  SetMetadata(ROLES_KEY, roles);
