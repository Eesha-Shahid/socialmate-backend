import { IsNotEmpty, IsString } from 'class-validator';
export class UpdateUsernameDto {

  @IsNotEmpty()
  @IsString()
  newUsername: string;
}