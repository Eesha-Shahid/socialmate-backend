import { Module } from '@nestjs/common';
import { CardSchema } from './schemas/card.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CardService } from './services/card.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Card', schema: CardSchema }])],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
