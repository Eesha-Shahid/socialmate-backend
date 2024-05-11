import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MediaType, SocialMediaPlatform } from '../../common/enums/index';
import { IsEnum } from 'class-validator';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ScheduledPost {
  [x: string]: any;

  @Prop()
  media_type: MediaType;

  @Prop()
  caption?: string;

  @Prop()
  description?: string;

  @Prop()
  location?: string;

  @Prop({ default: [] })
  hashtags?: string[];

  @Prop({ default: [] })
  tagged_accounts?: string[];

  @Prop({ default: [] })
  media: string[];

  @Prop()
  scheduled_time: Date;

  @Prop({ type: [String] })
  @IsEnum(SocialMediaPlatform, { each: true, message: 'Invalid platform' })
  platform: SocialMediaPlatform[];

  @Prop({ type: Types.ObjectId })
  user_id: Types.ObjectId;
}

export const ScheduledPostSchema = SchemaFactory.createForClass(ScheduledPost);
