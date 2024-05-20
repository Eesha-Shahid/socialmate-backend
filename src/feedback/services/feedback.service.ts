import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback } from '../schemas/feedback.schema';
import { CreateFeedbackDto } from '../dtos/create-feedback.dto';
import * as mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const { message, user_id } = createFeedbackDto;
    const createdFeedback = new this.feedbackModel({
      message,
      user_id: new ObjectId(user_id),
      createAt: Date.now(),
    });
    return createdFeedback.save();
  }
}
