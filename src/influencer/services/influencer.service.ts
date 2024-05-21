import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Influencer } from '../schemas/influencer.schema';

@Injectable()
export class InfluencerService {
  constructor(
    @InjectModel(Influencer.name)
    private influencerModel: Model<Influencer>,
  ) {}

  async getInfluencers(): Promise<any> {
    return await this.influencerModel.find();
  }

  async getInfluencer(_id: string): Promise<any> {
    return await this.influencerModel.findById({ _id: _id });
  }
}
