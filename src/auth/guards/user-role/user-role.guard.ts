import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorator/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler() ) || [];
    if( !validRoles || validRoles.length === 0 ) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    if( !user ) throw new BadRequestException('User not found');
    if( !user.roles ) throw new BadRequestException('User has no roles');
    for (const role of user.roles) {
      if( validRoles.includes(role) ) return true;
    }
    throw new BadRequestException(`User ${ user.fullName } need a valid role: [${ validRoles }]`);
  }
}
