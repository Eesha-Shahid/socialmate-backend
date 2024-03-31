/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Card {
  [x: string]: any;

  @Prop({ default: false })
  default: boolean;

  @Prop()
  cardNumber: string;

  @Prop()
  expMonth: number;

  @Prop()
  expYear: number;

  @Prop()
  cvc: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);
