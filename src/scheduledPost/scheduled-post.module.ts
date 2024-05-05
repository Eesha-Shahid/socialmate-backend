import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduledPostSchema } from './schemas/scheduled-post.schema';
import { ScheduledPostService } from './services/scheduled-post.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ScheduledPost', schema: ScheduledPostSchema },
    ]),
  ],
  providers: [ScheduledPostService],
  exports: [ScheduledPostService],
})
export class ScheduledPostModule {}
