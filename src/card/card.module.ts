import { Module } from '@nestjs/common';
import { CardSchema } from './schemas/card.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[MongooseModule.forFeature([{ name: 'Card', schema: CardSchema }])],
})
export class CardModule {}
