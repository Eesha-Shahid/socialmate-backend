import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { SchedulerService } from './services/scheduler.service';
import { ScheduledPostSchema } from './schemas/scheduledPost.schema';

@Module({
  imports:[
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: 'ScheduledPost', schema: ScheduledPostSchema }])
  ],
  providers: [SchedulerService],
  exports: [SchedulerService]
})
export class SchedulerModule {}
