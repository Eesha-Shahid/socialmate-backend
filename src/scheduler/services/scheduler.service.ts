import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ScheduledPostService } from 'src/scheduledPost/services/scheduled-post.service';
import { UserService } from 'src/auth/services/user.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  @Inject(forwardRef(() => UserService))
  private readonly userService: UserService;

  constructor(private scheduledPostService: ScheduledPostService) {}

  @Cron('*/1 * * * *')
  async uploadScheduledPosts() {
    this.logger.debug('Processing scheduled posts...');
    try {
      const postsToBeScheduled =
        await this.scheduledPostService.getScheduledPosts();

      for (const post of postsToBeScheduled) {
        this.logger.debug(`Posting scheduled post: ${post._id}`);

        try {
          await this.userService.publishScheduledPost(post);
        } catch (error) {
          this.logger.error(
            `Error processing scheduled post: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error processing scheduled tasks: ${error.message}`);
    }
  }
}
