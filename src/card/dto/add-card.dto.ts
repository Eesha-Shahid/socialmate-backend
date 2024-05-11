/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class AddCardDto {
  @IsNotEmpty()
  @IsString()
  readonly card_number: string;

  @IsNotEmpty()
  @IsString()
  readonly holder_name: string;

  @IsNotEmpty()
  readonly exp_month: number;

  @IsNotEmpty()
  readonly exp_year: number;

  @IsNotEmpty()
  @IsString()
  readonly cvc: string;

  @IsOptional()
  readonly default?: boolean;

  @IsOptional()
  readonly user_id?: Types.ObjectId;
}
