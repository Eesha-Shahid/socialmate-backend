import { IsNotEmpty } from 'class-validator';

export class CreateFeedbackDto {
  @IsNotEmpty()
  readonly message: string;

  @IsNotEmpty()
  readonly user_id: string;
}
