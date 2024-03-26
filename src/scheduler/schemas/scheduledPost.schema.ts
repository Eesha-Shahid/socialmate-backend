import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { RedditPost } from "src/scheduler/schemas/redditPost.schema";
import { User } from "src/auth/schemas/user.schema";
import { SchemaTypes } from "mongoose";

@Schema({ timestamps: true })
export class ScheduledPost {
    [x: string]: any;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
    user: string;

    @Prop()
    facebookPost?: RedditPost;

    @Prop()
    InstagramPost?: RedditPost;

    @Prop()
    twitterPost?: RedditPost;

    @Prop()
    redditPost?: RedditPost;  

    @Prop()
    scheduledTime: Date;
}

export const ScheduledPostSchema = SchemaFactory.createForClass(ScheduledPost);
