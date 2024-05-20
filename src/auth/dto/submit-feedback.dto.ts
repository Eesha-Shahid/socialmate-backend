import { IsNotEmpty } from 'class-validator';

export class SubmitFeedbackDto {
  @IsNotEmpty()
  readonly message: string;
}
