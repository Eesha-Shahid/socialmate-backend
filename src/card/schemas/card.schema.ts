import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Card {

    [x: string]: any;

    @Prop({ default: false })
    default: boolean;
    
    @Prop()
    cardNumber: string;

    @Prop()
    expMonth: Number

    @Prop()
    expYear: Number

    @Prop()
    cvc: String
}

export const CardSchema = SchemaFactory.createForClass(Card);
