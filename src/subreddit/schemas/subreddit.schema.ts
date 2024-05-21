import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Subreddit {
  [x: string]: any;

  @Prop()
  name: string;
}

export const SubredditSchema = SchemaFactory.createForClass(Subreddit);
