import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<{ entity: string; action: string }>(
      'permission',
      context.getHandler(),
    );

    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Not authenticated');

    if (user.is_admin) return true;

    if (!user.roles || user.roles.length === 0) {
      throw new ForbiddenException('User must have at least one role assigned');
    }

    const hasPermission = user.roles.some((role: any) => {
      const perms = role.permissions as Record<string, Record<string, boolean>>;
      return perms?.[required.entity]?.[required.action] === true;
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `You do not have permission to ${required.action} ${required.entity}`,
      );
    }

    return true;
  }
}