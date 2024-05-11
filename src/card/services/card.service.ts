import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card } from '../schemas/card.schema';
import { AddCardDto } from '../dto/add-card.dto';
import * as mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name)
    private cardModel: Model<Card>,
  ) {}

  async addCard(addCardDto: AddCardDto): Promise<any> {
    console.log(addCardDto);
    return await this.cardModel.create(addCardDto);
  }

  async updateCard(cardId: string, default_value: boolean): Promise<any> {
    const res = await this.cardModel.findByIdAndUpdate(
      { _id: new ObjectId(cardId) },
      {
        $set: { default: default_value },
      },
      { new: true },
    );
    return res;
  }
}
