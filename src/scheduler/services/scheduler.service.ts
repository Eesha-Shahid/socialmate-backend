import { BadRequestException, Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { ScheduledPost } from '../schemas/scheduledPost.schema';
import { CreateRedditPostDto } from '../dtos/create-reddit-post.dto';
import { RedditService } from 'src/auth/services/reddit.service';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  @Inject(forwardRef(() => RedditService)) 
  private readonly redditService: RedditService

  @Inject(forwardRef(() => AuthService)) 
  private readonly authService: AuthService

  constructor(
    @InjectModel(ScheduledPost.name) 
    private scheduledPostModel: Model<ScheduledPost>,
  ) {}

  async createScheduledPost(userId: string, createRedditPostDto: CreateRedditPostDto, scheduled_time: Date){
    return await this.scheduledPostModel.create({
      redditPost: createRedditPostDto,
      user: userId, 
      scheduledTime: scheduled_time
    })
  }

  async getScheduledPostbyId(userId: string){
    const dataObject = await this.scheduledPostModel.find({ user:  userId});
    return Object.values(dataObject);
  }

  async deleteScheduledPostbyId(postId: string){
    await this.scheduledPostModel.deleteOne({ _id: postId});
  }

  @Cron('*/1 * * * *')
  async uploadScheduledPosts() {
    this.logger.debug('Processing scheduled posts...');

    try {
      const currentDateTime = new Date();
      const postsToBeScheduled = await this.scheduledPostModel
        .find({ scheduledTime: { $lte: currentDateTime } })
        .exec();

      for (const post of postsToBeScheduled) {
        this.logger.debug(`Posting scheduled post: ${post.redditPost.title}`);

        const userData = await this.authService.findById(post.user)

        try {
          if (post.redditPost.text && post.redditPost.text.trim() !== '') {
            await this.redditService.createPostWithText(userData, post.redditPost.sr, post.redditPost.title, post.redditPost.text, post.redditPost.flair_id, post.redditPost.flair_text);
            await this.scheduledPostModel.deleteOne({ _id: post._id });
          } 
          else if (post.redditPost.url && post.redditPost.url.trim() !== '') {
            await this.redditService.createPostWithLink(userData, post.redditPost.sr, post.redditPost.title, post.redditPost.url);
            await this.scheduledPostModel.deleteOne({ _id: post._id });
          } 
          else {
            throw new BadRequestException('Either text or URL must be provided.');
          }
        } catch (error) {
          this.logger.error(`Error processing scheduled post: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error processing scheduled tasks: ${error.message}`);
    }
  }
}