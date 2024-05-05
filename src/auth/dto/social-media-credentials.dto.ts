import { IsNotEmpty, IsString } from 'class-validator';

export class SocialMediaCredentialsDto {
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
