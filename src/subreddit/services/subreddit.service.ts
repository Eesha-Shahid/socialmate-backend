import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subreddit } from '../schemas/subreddit.schema';

@Injectable()
export class SubredditService {
  constructor(
    @InjectModel(Subreddit.name)
    private subredditModel: Model<Subreddit>,
  ) {}

  async getSubreddits(): Promise<any> {
    return await this.subredditModel.find();
  }
}
