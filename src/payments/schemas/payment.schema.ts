import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Card } from 'src/card/schemas/card.schema';
import { CardStatus } from '../../common/enums/index';

@Schema({ timestamps: true })
export class Payment {
  [x: string]: any;

  @Prop()
  status: CardStatus;

  @Prop()
  amount: number;

  @Prop()
  expiration_date: Date;

  @Prop()
  card_id: Card;

  @Prop()
  user_id: User;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
