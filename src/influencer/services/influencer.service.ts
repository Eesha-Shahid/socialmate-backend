import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Influencer } from '../schemas/influencer.schema';

@Injectable()
export class InfluencerService {
  constructor(
    @InjectModel(Influencer.name)
    private InfluencerModel: Model<Influencer>,
  ) {}

  async getInfluencers(): Promise<any> {
    return await this.InfluencerModel.find();
  }
}
