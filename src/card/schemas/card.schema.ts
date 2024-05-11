/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
@Schema({ timestamps: true })
export class Card {
  [x: string]: any;

  @Prop({ default: false })
  default: boolean;

  @Prop()
  holder_name: string;

  @Prop()
  card_number: string;

  @Prop()
  exp_month: number;

  @Prop()
  exp_year: number;

  @Prop()
  cvc: string;

  @Prop({ type: Types.ObjectId })
  user_id: Types.ObjectId;
}

export const CardSchema = SchemaFactory.createForClass(Card);
