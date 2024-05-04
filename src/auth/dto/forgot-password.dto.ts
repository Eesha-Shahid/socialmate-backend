import { IsNotEmpty, IsString } from 'class-validator';
export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  resetToken: string;
}
