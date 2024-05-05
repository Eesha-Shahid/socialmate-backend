import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScheduledPost } from '../schemas/scheduled-post.schema';
import { UpdateScheduledPostDto } from '../dto/update-scheduled-post.dto';
import * as mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

@Injectable()
export class ScheduledPostService {
  constructor(
    @InjectModel(ScheduledPost.name)
    private scheduledPostModel: Model<ScheduledPost>,
  ) {}

  async getScheduledPost(postId: string): Promise<any> {
    return await this.scheduledPostModel.findById(postId);
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
      console.log(error);
      return { post: null, message: error };
    }
  }
}
