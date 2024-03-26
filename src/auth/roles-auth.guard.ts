import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserType } from 'src/common/enums/users.enum';

@Injectable()
export class RolesAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredUserTypes = this.reflector.get<UserType[]>('roles', context.getHandler());

    if (!requiredUserTypes) {
      return true; // No roles defined, allow access
    }

    // Perform authentication
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      throw new UnauthorizedException('Authentication failed');
    }

    const user = context.switchToHttp().getRequest().user;

    if (requiredUserTypes.includes(user.userType)) {
      return true; 
    }

    throw new UnauthorizedException('Insufficient role');
  }
}
