import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserType } from "../../common/enums/users.enum";
import { Card } from "src/card/schemas/card.schema";
import { Payment } from "src/payments/schemas/payment.schema";

@Schema({ timestamps: true })
export class User {
    [x: string]: any;
    
    @Prop()
    username: string;

    @Prop({ unique: [ true, 'Duplicate email entered' ] })
    email: string;

    @Prop()
    password: string;

    @Prop()
    profilePic: string;

    @Prop({default: false})
    googleAuth: boolean;

    @Prop({enum: Object.values(UserType), default: UserType.Standard})
    userType: UserType;

    @Prop()
    stripeCustomerId: string;

    @Prop({default: null})
    facebookAccessToken: string;

    @Prop({default: null})
    instagramAccessToken: string;

    @Prop({default: null})
    twitterAccessToken: string;

    @Prop({default: null})
    redditAccessToken: string;

    @Prop({ type: [Card], default:[] })
    cards: Card[];

    @Prop({ type: [Payment], default:[] })
    payments: Payment[];
}

export const UserSchema = SchemaFactory.createForClass(User);
