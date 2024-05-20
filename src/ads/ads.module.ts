import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdSchema } from './schemas/ads.schema';
import { AdService } from './services/ads.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Ad', schema: AdSchema }])],
  providers: [AdService],
  exports: [AdService],
})
export class AdModule {}
