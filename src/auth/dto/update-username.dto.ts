import { IsNotEmpty, IsString, Matches, MinLength, Validate } from 'class-validator';
import { MatchPasswords } from '../match-passwords.validator';

export class UpdateUsernameDto {

  @IsNotEmpty()
  @IsString()
  newUsername: string;
}
