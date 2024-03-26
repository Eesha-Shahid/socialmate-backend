import { IsNotEmpty, IsString, Matches, MinLength, Validate } from 'class-validator';
import { MatchPasswords } from '../match-passwords.validator';

export class ChangePasswordDto {

  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8) 
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @Validate(MatchPasswords, ['newPassword'])
  confirmPassword: string;
}
