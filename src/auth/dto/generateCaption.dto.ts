import { IsString } from 'class-validator';

export class GenerateCaptionDto {
  @IsString()
  readonly queryString: string;
}
