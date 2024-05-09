import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InfluencerSchema } from './schemas/influencer.schema';
import { InfluencerService } from './services/influencer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Influencer', schema: InfluencerSchema },
    ]),
  ],
  providers: [InfluencerService],
  exports: [InfluencerService],
})
export class InfluencerModule {}
