import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const PlatformRole = {
  ADMIN: 'ADMIN',
  OPERATIONS: 'OPERATIONS',
  FINANCE: 'FINANCE',
  SUPPORT: 'SUPPORT',
  INSPECTOR: 'INSPECTOR',
  PARTNER: 'PARTNER',
  CLIENT: 'CLIENT',
} as const;

export const StaffRoles = [
  PlatformRole.ADMIN,
  PlatformRole.OPERATIONS,
  PlatformRole.FINANCE,
  PlatformRole.SUPPORT,
  PlatformRole.INSPECTOR,
];
