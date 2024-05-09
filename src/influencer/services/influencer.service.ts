import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Influencer } from '../schemas/influencer.schema';
// import * as mongoose from 'mongoose';
// const { ObjectId } = mongoose.Types;

@Injectable()
export class InfluencerService {
  constructor(
    @InjectModel(Influencer.name)
    private InfluencerModel: Model<Influencer>,
  ) {}

  async getInfluencers(): Promise<any> {
    return await this.InfluencerModel.find();
  }

  // async getUserInfluencers(userId: string): Promise<any> {
  //   const data = await this.InfluencerModel.aggregate([
  //     {
  //       $match: {
  //         user_id: new ObjectId(userId),
  //       },
  //     },
  //     {
  //       $unwind: '$influencers',
  //     },
  //     {
  //       $lookup: {
  //         from: 'influencers',
  //         localField: 'influencers',
  //         foreignField: '_id',
  //         as: 'result',
  //       },
  //     },
  //     {
  //       $unwind: '$result',
  //     },
  //     {
  //       $replaceRoot: {
  //         newRoot: '$result',
  //       },
  //     },
  //   ]);
  //   console.log(data);
  //   return data;
  // }
}
