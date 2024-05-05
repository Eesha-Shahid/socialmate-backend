import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as mongoose from 'mongoose';
import { GenerateCaptionDto } from '../dto/generateCaption.dto';
import { HttpService } from '@nestjs/axios';
import { ScheduledPostService } from 'src/scheduledPost/services/scheduled-post.service';
import { UpdateScheduledPostDto } from 'src/scheduledPost/dto/update-scheduled-post.dto';
const { ObjectId } = mongoose.Types;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly httpService: HttpService,
    private readonly scheduledPostService: ScheduledPostService,
  ) {}

  async getProfile(userId: string): Promise<any> {
    return await this.userModel.findById(userId);
  }

  async getInstagramAccountDetails(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'instagram_user',
          localField: '_id',
          foreignField: 'user_id',
          as: 'user_details',
        },
      },
      {
        $unwind: '$user_details',
      },
      {
        $replaceRoot: {
          newRoot: '$user_details',
        },
      },
      {
        $project: {
          name: 1,
          username: 1,
          profile_picture_url: 1,
          website: 1,
          bio: '$biography',
          media_count: 1,
          follows_count: 1,
          followers_count: 1,
        },
      },
    ]);
    return data[0];
  }

  async getInstagramAnalyticsSummary(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'instagram_user',
          localField: '_id',
          foreignField: 'user_id',
          as: 'user_details',
        },
      },
      {
        $unwind: '$user_details',
      },
      {
        $replaceRoot: {
          newRoot: '$user_details',
        },
      },
      {
        $project: {
          reach: {
            $let: {
              vars: {
                data: '$reach.data.total_value.value',
              },
              in: {
                value: { $arrayElemAt: ['$$data', 0] },
                last_value: { $arrayElemAt: ['$$data', -1] },
              },
            },
          },
          likes: {
            $let: {
              vars: {
                data: '$likes.data.total_value.value',
              },
              in: {
                value: { $arrayElemAt: ['$$data', 0] },
                last_value: { $arrayElemAt: ['$$data', -1] },
              },
            },
          },
          comments: {
            $let: {
              vars: {
                data: '$comments.data.total_value.value',
              },
              in: {
                value: { $arrayElemAt: ['$$data', 0] },
                last_value: { $arrayElemAt: ['$$data', -1] },
              },
            },
          },
          follows_and_unfollows: {
            $let: {
              vars: {
                data: '$follows_and_unfollows.data.total_value.value',
              },
              in: {
                value: { $arrayElemAt: ['$$data', 0] },
                last_value: { $arrayElemAt: ['$$data', -1] },
              },
            },
          },
        },
      },
    ]);
    return data[0];
  }

  async getInstagramProfileViews(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'instagram_user',
          localField: '_id',
          foreignField: 'user_id',
          as: 'user_details',
        },
      },
      {
        $unwind: '$user_details',
      },
      {
        $replaceRoot: {
          newRoot: '$user_details.profile_views',
        },
      },
      {
        $project: {
          day_views: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$data',
                      as: 'item',
                      cond: { $eq: ['$$item.period', 'day'] },
                    },
                  },
                  as: 'item',
                  in: '$$item.total_value.value',
                },
              },
              0,
            ],
          },
          week_views: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$data',
                      as: 'item',
                      cond: { $eq: ['$$item.period', 'week'] },
                    },
                  },
                  as: 'item',
                  in: '$$item.total_value.value',
                },
              },
              0,
            ],
          },
          month_views: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$data',
                      as: 'item',
                      cond: { $eq: ['$$item.period', 'day_28'] },
                    },
                  },
                  as: 'item',
                  in: '$$item.total_value.value',
                },
              },
              0,
            ],
          },
        },
      },
    ]);
    return data[0];
  }

  async getInstagramAudienceInsights(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'instagram_user',
          localField: '_id',
          foreignField: 'user_id',
          as: 'user_details',
        },
      },
      {
        $unwind: '$user_details',
      },
      {
        $replaceRoot: {
          newRoot: '$user_details.insights',
        },
      },
      {
        $project: {
          audience_country: 1,
          audience_gender_age: 1,
        },
      },
    ]);
    return data[0];
  }

  async getInstagramMilestones(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'benchmark',
          let: {
            id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $eq: ['$user_id', '$$id'] } },
                  { platform: 'instagram' },
                ],
              },
            },
          ],
          as: 'user_details',
        },
      },
      {
        $unwind: '$user_details',
      },
      {
        $group: {
          _id: '$user_details.metric',
          user_id: { $first: '$user_details.user_id' },
          value: { $first: '$user_details.value' },
          latestDate: { $first: '$user_details.createdAt' },
        },
      },
      {
        $group: {
          _id: '$user_id',
          metrics: {
            $push: {
              k: '$_id',
              v: '$value',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          data: {
            $arrayToObject: '$metrics',
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$data',
        },
      },
    ]);
    return data[0];
  }

  async getInstagramGoals(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'goal',
          let: {
            id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $eq: ['$user_id', '$$id'] } },
                  { platform: 'instagram' },
                ],
              },
            },
          ],
          as: 'user_details',
        },
      },
      {
        $unwind: '$user_details',
      },
      {
        $group: {
          _id: '$user_details.metric',
          user_id: { $first: '$user_details.user_id' },
          value: { $first: '$user_details.value' },
          latestDate: { $first: '$user_details.createdAt' },
        },
      },
      {
        $group: {
          _id: '$user_id',
          metrics: {
            $push: {
              k: '$_id',
              v: '$value',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          data: {
            $arrayToObject: '$metrics',
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$data',
        },
      },
    ]);
    return data[0];
  }

  // async getInstagramScheduledPosts(userId: string): Promise<any> {}

  async getScheduledPosts(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'scheduledposts',
          let: {
            id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $eq: ['$user_id', '$$id'] } },
                  // { platform: 'instagram' },
                ],
              },
            },
            {
              $project: {
                user_id: 0,
                user_created: 0,
              },
            },
          ],
          as: 'data',
        },
      },
      {
        $project: {
          data: 1,
        },
      },
    ]);
    return data[0];
  }

  async updateScheduledPost(
    updateScheduledPostDto: UpdateScheduledPostDto,
  ): Promise<any> {
    const res = await this.scheduledPostService.updateScheduledPost(
      updateScheduledPostDto,
    );
    return {
      post: res.post,
      message: res.message || 'Post updated successfully!',
    };
  }

  async getPaymentMethods(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'cards',
          let: {
            id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $and: [{ $expr: { $eq: ['$user_id', '$$id'] } }],
              },
            },
            {
              $project: {
                _id: 0,
                user_id: 0,
              },
            },
            {
              $sort: {
                expiration_date: -1,
              },
            },
          ],
          as: 'data',
        },
      },
      {
        $project: {
          data: 1,
        },
      },
    ]);
    return data[0];
  }

  async getSubscriptionHistory(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'payments',
          let: {
            id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $and: [{ $expr: { $eq: ['$user_id', '$$id'] } }],
              },
            },
            {
              $project: {
                _id: 0,
                // user_id: 0,
              },
            },
            {
              $sort: {
                expiration_date: -1,
              },
            },
          ],
          as: 'data',
        },
      },
      {
        $unwind: '$data',
      },
      {
        $replaceRoot: {
          newRoot: '$data',
        },
      },
      {
        $lookup: {
          from: 'cards',
          let: {
            card_id: '$card_id',
          },
          pipeline: [
            {
              $match: {
                $and: [{ $expr: { $eq: ['$_id', '$$card_id'] } }],
              },
            },
            {
              $project: {
                _id: 0,
                holder_name: 1,
                card_number: 1,
              },
            },
          ],
          as: 'card_data',
        },
      },
      {
        $unwind: '$card_data',
      },
      {
        $project: {
          user_id: 1,
          status: 1,
          expiration_date: 1,
          amount: 1,
          card_number: '$card_data.card_number',
          holder_name: '$card_data.holder_name',
        },
      },
      {
        $group: {
          _id: '$user_id',
          data: { $push: '$$ROOT' },
        },
      },
    ]);
    return data[0];
  }

  async generateCaption(generateCaptionDto: GenerateCaptionDto): Promise<any> {
    try {
      const res = await this.httpService
        .post(
          `${process.env.MODEL_API}/generate-caption`,
          {
            query: `Generate prompt for ${generateCaptionDto.queryString} post`,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .toPromise();

      return res.data; // Assuming that the response contains a 'data' field
    } catch (error) {
      console.error('Error generating caption:', error);
      throw new InternalServerErrorException('Failed to generate caption');
    }
  }
}
