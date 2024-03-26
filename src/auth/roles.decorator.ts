import { SetMetadata } from '@nestjs/common';
import { UserType } from '../common/enums/users.enum';

export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);
