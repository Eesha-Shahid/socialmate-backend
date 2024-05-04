/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Card {
  [x: string]: any;

  @Prop({ default: false })
  default: boolean;

  @Prop()
  card_number: string;

  @Prop()
  exp_month: number;

  @Prop()
  exp_year: number;

  @Prop()
  cvc: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);
