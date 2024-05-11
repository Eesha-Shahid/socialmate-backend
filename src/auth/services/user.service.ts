import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as mongoose from 'mongoose';
import { GenerateCaptionDto } from '../dto/generateCaption.dto';
import { HttpService } from '@nestjs/axios';
import { ScheduledPostService } from 'src/scheduledPost/services/scheduled-post.service';
import { UpdateScheduledPostDto } from 'src/scheduledPost/dto/update-scheduled-post.dto';
import { InfluencerService } from 'src/influencer/services/influencer.service';
import { InfluencerDto } from '../dto/toggle-influencer.dto';
import { AddCardDto } from 'src/card/dto/add-card.dto';
import { CardService } from 'src/card/services/card.service';
import { SubscriptionStatus, UserType } from 'src/common/enums';
import { StripeService } from 'src/payments/services/stripe.service';
import { UpdateCardDto } from 'src/card/dto/update-card.dto';
import { AddScheduledPostDto } from 'src/scheduledPost/dto/add-scheduled-post.dto';
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';
const { ObjectId } = mongoose.Types;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly httpService: HttpService,
    private readonly scheduledPostService: ScheduledPostService,
    private readonly influencerService: InfluencerService,
    private readonly cardService: CardService,
    private readonly cloudinaryService: CloudinaryService,

    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
  ) {}

  async getProfile(userId: string): Promise<any> {
    return await this.userModel.findById(userId);
  }

  async getDefaultCard(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'user_id',
          as: 'cards',
        },
      },
      {
        $unwind: '$cards',
      },
      {
        $match: {
          'cards.default': true,
        },
      },
      {
        $replaceRoot: {
          newRoot: '$cards',
        },
      },
    ]);
    return data[0];
  }

  async setDefaultCard(userId: string, updateCardDto: UpdateCardDto) {
    try {
      const { cardId } = updateCardDto;
      const defaultCard = await this.getDefaultCard(userId);
      const defaultCardId = String(defaultCard._id);
      await this.cardService.updateCard(defaultCardId, false);
      const card = await this.cardService.updateCard(cardId, true);
      return { card: card, message: 'Card is set to default' };
    } catch (error) {
      return { card: null, message: error };
    }
  }

  async addCard(userId: string, addCardDto: AddCardDto): Promise<any> {
    try {
      const defaultCard = await this.getDefaultCard(userId);
      const isDefault = defaultCard ? false : true;
      const res = await this.cardService.addCard({
        ...addCardDto,
        user_id: new ObjectId(userId),
        default: isDefault,
      });
      return { card: res, message: 'Card Added Successfully' };
    } catch (error) {
      return { card: null, message: 'Error adding Card' };
    }
  }

  async subscribe(userId: string) {
    const user = await this.userModel.findById(userId);
    const customerId = user.stripe_customer_id;
    const defaultCard = await this.getDefaultCard(userId);

    if (!defaultCard) {
      console.error('SUBSCRIBE.NO_CARD_FOUND');
      return null;
    }

    const clientSecret =
      await this.stripeService.createPaymentIntent(customerId);
    const paymentIntent =
      await this.stripeService.confirmCardPayment(clientSecret);

    const currentDate = new Date();
    const expirationDate = new Date(currentDate);
    expirationDate.setMonth(currentDate.getMonth() + 1);

    const savePaymentDto = {
      status: SubscriptionStatus.Active,
      amount: paymentIntent.amount,
      expiration_date: expirationDate,
      card_id: defaultCard._id,
      user_id: user._id,
    };

    try {
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: { user_type: UserType.Premium },
        },
        { new: true },
      );
      return await this.stripeService.savePayment(savePaymentDto);
    } catch (error) {
      console.error('SUBSCRIBE.', error);
      return null;
    }
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

  async getInfluencers(): Promise<any> {
    return await this.influencerService.getInfluencers();
  }

  async getUserInfluencers(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $unwind: '$influencers',
      },
      {
        $lookup: {
          from: 'influencers',
          localField: 'influencers',
          foreignField: '_id',
          as: 'result',
        },
      },
      {
        $unwind: '$result',
      },
      {
        $replaceRoot: {
          newRoot: '$result',
        },
      },
    ]);
    return data;
  }

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

  async createScheduledPost(
    userId: string,
    file: Express.Multer.File,
    addScheduledPostDto: AddScheduledPostDto,
  ): Promise<any> {
    const cloudinaryResponse = await this.cloudinaryService.uploadFile(
      file,
      'post-media',
    );
    const imageUrl = cloudinaryResponse.secure_url;
    const res = await this.scheduledPostService.createScheduledPost({
      ...addScheduledPostDto,
      user_id: new ObjectId(userId),
      media: [imageUrl],
    });
    return {
      post: res,
      message: res.message || 'Post added successfully!',
    };
  }

  async createPost(
    file: Express.Multer.File,
    addScheduledPostDto: AddScheduledPostDto,
  ): Promise<any> {
    const cloudinaryResponse = await this.cloudinaryService.uploadFile(
      file,
      'published-post-media',
    );
    const imageUrl = cloudinaryResponse.secure_url;

    try {
      const res = await this.httpService
        .post(
          `${process.env.MODEL_API}/publish-image`,
          {
            image_url: imageUrl,
            caption: addScheduledPostDto.caption,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .toPromise();
      return { message: res.data.message };
    } catch (error) {
      return { error: error };
    }
  }

  async calculateSentiment(caption: string): Promise<any> {
    try {
      const res = await this.httpService
        .post(
          `${process.env.MODEL_API}/calculate-sentiment`,
          {
            caption: caption,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .toPromise();
      return { sentiment: res.data.sentiment };
    } catch (error) {
      return { error: error };
    }
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

  async addInfluencer(
    userId: string,
    influencerDto: InfluencerDto,
  ): Promise<any> {
    try {
      const { influencer_id } = influencerDto;
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      if (!user.influencers) {
        user.influencers = [];
      }
      user.influencers.push(new ObjectId(influencer_id));
      await user.save();
      return { user: user, message: 'Influencer added successfully' };
    } catch (error) {
      return { user: null, message: error.message };
    }
  }

  async removeInfluencer(
    userId: string,
    influencerDto: InfluencerDto,
  ): Promise<any> {
    try {
      const { influencer_id } = influencerDto;
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.influencers.length > 0) {
        user.influencers = user.influencers.filter((item) => {
          return !item.equals(new ObjectId(influencer_id));
        });
      }
      await user.save();
      return { user: user, message: 'Influencer removed successfully' };
    } catch (error) {
      return { user: null, message: error.message };
    }
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
                _id: 1,
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
      return { suggestions: res.data.suggestions };
    } catch (error) {
      return { error: error };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generateCaptionFromImage(file: Express.Multer.File): Promise<any> {
    try {
      console.log('Called');
      const res = await this.httpService
        .post(
          `${process.env.MODEL_API}/generate-caption-from-image`,
          {
            data: null,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .toPromise();
      return { caption: res.data.caption };
    } catch (error) {
      return { error: error };
    }
  }

  async getInstagramIntegrationDetail(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $unwind: '$access_token',
      },
      {
        $project: {
          access_token: 1,
        },
      },
      {
        $lookup: {
          from: 'instagram_user',
          let: { token: '$access_token.token' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$token'] },
              },
            },
            {
              $project: {
                name: 1,
                username: 1,
                profile_picture_url: 1,
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
        $project: {
          _id: 0,
          platform: '$access_token.platform',
          name: '$user_details.name',
          username: '$user_details.username',
          profile_picture_url: '$user_details.profile_picture_url',
          login_time: '$access_token.login_time',
        },
      },
    ]);
    return data[0];
  }

  async getFacebookIntegrationDetail(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $unwind: '$access_token',
      },
      {
        $project: {
          access_token: 1,
        },
      },
      {
        $lookup: {
          from: 'facebook_user',
          let: { token: '$access_token.token' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$token'] },
              },
            },
            {
              $project: {
                name: 1,
                username: 1,
                profile_picture_url: 1,
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
        $project: {
          _id: 0,
          platform: '$access_token.platform',
          name: '$user_details.name',
          username: '$user_details.username',
          profile_picture_url: '$user_details.profile_picture_url',
          login_time: '$access_token.login_time',
        },
      },
    ]);
    return data[0];
  }

  async getRedditIntegrationDetail(userId: string): Promise<any> {
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $unwind: '$access_token',
      },
      {
        $project: {
          access_token: 1,
        },
      },
      {
        $lookup: {
          from: 'reddit_user',
          let: { token: '$access_token.token' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$token'] },
              },
            },
            {
              $project: {
                name: 1,
                username: 1,
                profile_picture_url: 1,
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
        $project: {
          _id: 0,
          platform: '$access_token.platform',
          name: '$user_details.name',
          username: '$user_details.username',
          profile_picture_url: '$user_details.profile_picture_url',
          login_time: '$access_token.login_time',
        },
      },
    ]);
    return data[0];
  }

  async getIntegrationDetail(userId: string): Promise<any> {
    const [instagram_user, facebook_user, reddit_user] = await Promise.all([
      this.getInstagramIntegrationDetail(userId),
      this.getFacebookIntegrationDetail(userId),
      this.getRedditIntegrationDetail(userId),
    ]);

    const user_integration_details = [
      instagram_user,
      facebook_user,
      reddit_user,
    ].filter(Boolean);

    return user_integration_details;
  }
}
