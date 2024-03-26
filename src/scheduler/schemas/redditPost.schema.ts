import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class RedditPost {
    [x: string]: any;

    @Prop()
    sr: string;

    @Prop()
	title: string;

    @Prop()
	text: string;

    @Prop()
	url: string;

    @Prop()
	flair_text: string;

    @Prop()
	flair_id: string;

    @Prop()
    scheduledTime: Date
    
}

export const RedditPostSchema = SchemaFactory.createForClass(RedditPost);
