import { Types } from 'mongoose';

export class AddScheduledPostDto {
  caption?: string;
  description?: string;
  location?: string;
  subreddit?: string;
  flair_id?: string;
  flair_text?: string;
  hashtags?: string[];
  tagged_accounts?: string[];
  scheduled_time: Date;
  platform?: string[];
  user_id: Types.ObjectId;
  media?: string[];
}
