/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';
import { UserType } from '../common/enums/index';
export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);
