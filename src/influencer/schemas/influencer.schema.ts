import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Country, Gender, Industry } from 'src/common/enums/influencer.enum';
@Schema({ timestamps: true })
export class Influencer {
  [x: string]: any;

  @Prop()
  name: string;

  @Prop({ type: [String], enum: Object.values(Industry) })
  industry: Industry[];

  @Prop({
    type: {
      age: { type: Number, default: null },
    },
  })
  demographics: {
    age: number;
    gender: Gender;
    location: Country;
  };

  @Prop()
  follower_count: number;

  @Prop()
  email: string;
}

export const InfluencerSchema = SchemaFactory.createForClass(Influencer);
