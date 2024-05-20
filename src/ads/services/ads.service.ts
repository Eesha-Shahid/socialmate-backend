import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ad } from '../schemas/ads.schema';

@Injectable()
export class AdService {
  constructor(
    @InjectModel(Ad.name)
    private AdModel: Model<Ad>,
  ) {}

  async getAds(): Promise<any> {
    return await this.AdModel.find();
  }
}
