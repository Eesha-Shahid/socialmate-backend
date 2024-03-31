import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

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
}
