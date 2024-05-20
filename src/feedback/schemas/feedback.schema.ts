import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema()
export class Feedback extends Document {
  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId })
  user_id: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
