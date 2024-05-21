import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubredditSchema } from './schemas/subreddit.schema';
import { SubredditService } from './services/subreddit.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Subreddit', schema: SubredditSchema }]),
  ],
  providers: [SubredditService],
  exports: [SubredditService],
})
export class SubredditModule {}
