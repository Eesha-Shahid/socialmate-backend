import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { SubscriptionStatus } from 'src/common/enums';
export class SavePaymentDto {
  @IsNotEmpty()
  status: SubscriptionStatus;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  expiration_date: Date;

  @IsNotEmpty()
  card_id: Types.ObjectId;

  @IsNotEmpty()
  user_id: Types.ObjectId;
}
