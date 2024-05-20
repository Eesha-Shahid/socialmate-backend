import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Ad {
  [x: string]: any;

  @Prop()
  ad_name: string;

  @Prop()
  ad_copy: string;

  @Prop({
    type: {
      age: String,
      location: String,
      interests: String,
    },
  })
  targeting_criteria: {
    age: string;
    location: string;
    interests: string;
  };

  @Prop({
    type: {
      ad_spend: Number,
      revenue_generated: Number,
      engagement_rate: Number,
      impressions: Number,
      clicks: Number,
      ctr: Number,
    },
  })
  performance_metrics: {
    ad_spend: number;
    revenue_generated: number;
    engagement_rate: number;
    impressions: number;
    clicks: number;
    ctr: number;
  };

  @Prop()
  date: Date;
}

export const AdSchema = SchemaFactory.createForClass(Ad);
