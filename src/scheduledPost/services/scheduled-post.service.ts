import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScheduledPost } from '../schemas/scheduled-post.schema';
import { UpdateScheduledPostDto } from '../dto/update-scheduled-post.dto';
import * as mongoose from 'mongoose';
import { AddScheduledPostDto } from '../dto/add-scheduled-post.dto';
const { ObjectId } = mongoose.Types;

@Injectable()
export class ScheduledPostService {
  constructor(
    @InjectModel(ScheduledPost.name)
    private scheduledPostModel: Model<ScheduledPost>,
  ) {}

  async getScheduledPosts(): Promise<any> {
    const currentDateTime = new Date();
    return await this.scheduledPostModel
      .find({ scheduled_time: { $eq: currentDateTime } })
      .exec();
  }

  async getScheduledPost(postId: string): Promise<any> {
    return await this.scheduledPostModel.findById(postId);
  }

  async createScheduledPost(
    addScheduledPostDto: AddScheduledPostDto,
  ): Promise<any> {
    return await this.scheduledPostModel.create(addScheduledPostDto);
  }

  async updateScheduledPost(
    updateScheduledPostDto: UpdateScheduledPostDto,
  ): Promise<any> {
    try {
      const { _id, ...updateData } = updateScheduledPostDto;
      const post = await this.scheduledPostModel.findByIdAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: updateData },
        { new: true },
      );
      return { post };
    } catch (error) {
      return { post: null, message: error };
    }
  }
}
