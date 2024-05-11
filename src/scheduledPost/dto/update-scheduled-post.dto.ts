import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateScheduledPostDto {
  _id: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  caption?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  location?: string;

  @IsOptional()
  hashtags?: string[];

  @IsOptional()
  tagged_accounts?: string[];

  @IsDate()
  @IsOptional()
  scheduled_time?: Date;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  platform?: string[];
}
