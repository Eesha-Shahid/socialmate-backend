import { Module, forwardRef } from '@nestjs/common';
import { SchedulerService } from './services/scheduler.service';
import { ScheduledPostModule } from 'src/scheduledPost/scheduled-post.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule), ScheduledPostModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
