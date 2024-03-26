import { IsEmail, IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { MatchPasswords } from '../match-passwords.validator';

export class ForgotPasswordDto {

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(8) 
    newPassword: string;

    @IsNotEmpty()
    @IsString()
    @Validate(MatchPasswords, ['newPassword'])
    confirmPassword: string;
}
