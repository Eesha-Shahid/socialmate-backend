/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class AddCardDto {
  @IsNotEmpty()
  @IsString()
  readonly card_number: string;

  @IsNotEmpty()
  readonly exp_month: number;

  @IsNotEmpty()
  readonly exp_year: number;

  @IsNotEmpty()
  @IsString()
  readonly cvc: string;
}
