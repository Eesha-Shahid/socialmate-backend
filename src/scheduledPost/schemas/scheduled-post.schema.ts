/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MediaType, SocialMediaPlatform } from '../../common/enums/index';
import { IsEnum } from 'class-validator';

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
  media: string[];

  @Prop()
  scheduled_time: string;

  @Prop({ type: [String] })
  @IsEnum(SocialMediaPlatform, { each: true, message: 'Invalid platform' })
  platform: SocialMediaPlatform[];
}

export const ScheduledPostSchema = SchemaFactory.createForClass(ScheduledPost);
