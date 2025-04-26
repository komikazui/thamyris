import { PermissionValue } from "@/utils/enums";

interface UserRoles {
	upload: number;
	download: number;
	special: number;
}

export function hasSpecialAccess(systemAdmin: any, userRoles: UserRoles | undefined): boolean {
  const hasAdminPerms = systemAdmin?.isAdmin ?? false;
  return hasAdminPerms || userRoles?.special === PermissionValue.Enabled;
}

export function hasDownloadAccess(systemAdmin: any, userRoles: UserRoles | undefined): boolean {
  const hasAdminPerms = !!(systemAdmin?.isAdmin);
  return hasAdminPerms || userRoles?.download === PermissionValue.Enabled;
}