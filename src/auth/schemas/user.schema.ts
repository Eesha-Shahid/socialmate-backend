import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserType } from '../../common/enums/users.enum';
import { SocialMediaPlatform } from 'src/common/enums/platforms.enum';
// import { Card } from 'src/card/schemas/card.schema';
// import { Payment } from 'src/payments/schemas/payment.schema';

@Schema({ timestamps: true })
export class User {
  [x: string]: any;

  @Prop()
  username: string;

  @Prop({ unique: [true, 'Duplicate email entered'] })
  email: string;

  @Prop()
  password: string;

  @Prop()
  profile_pic: string;

  //   @Prop({ default: false })
  //   googleAuth: boolean;

  @Prop({ enum: Object.values(UserType), default: UserType.Standard })
  user_type: UserType;

  @Prop()
  resetToken: string;

  @Prop()
  resetTokenExpiry: Date;

  @Prop()
  stripe_customer_id: string;

  @Prop({
    type: [
      {
        token: { type: String, default: null },
      },
    ],
  })
  access_token: [
    {
      platform: SocialMediaPlatform;
      token: string;
    },
  ];

  @Prop({ default: false })
  two_factor: boolean;

  @Prop({
    type: {
      access_to_post_scheduling: { type: Boolean, default: false },
      access_to_analyzers: { type: Boolean, default: false },
      access_to_influencer_tools: { type: Boolean, default: false },
      access_to_ad_campaign: { type: Boolean, default: false },
    },
  })
  permissions: {
    access_to_post_scheduling: boolean;
    access_to_analyzers: boolean;
    access_to_influencer_tools: boolean;
    access_to_ad_campaign: boolean;
  };

  @Prop({
    type: {
      notification_type: { type: String, default: null },
      scheduled_post_reminders: { type: Boolean, default: false },
      goal_updates: { type: Boolean, default: false },
      benchmark_updates: { type: Boolean, default: false },
      subscription_expiry_reminder: { type: Boolean, default: false },
      subscription_renewal_reminder: { type: Boolean, default: false },
    },
  })
  notifications: {
    notification_type: string;
    scheduled_post_reminders: boolean;
    goal_updates: boolean;
    benchmark_updates: boolean;
    subscription_expiry_reminder: boolean;
    subscription_renewal_reminder: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
