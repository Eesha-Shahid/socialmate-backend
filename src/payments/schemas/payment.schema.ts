import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SubscriptionStatus } from 'src/common/enums';

@Schema({ timestamps: true })
export class Payment {
  [x: string]: any;

  @Prop()
  status: SubscriptionStatus;

  @Prop()
  amount: number;

  @Prop()
  expiration_date: Date;

  @Prop({ type: Types.ObjectId })
  card_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  user_id: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
