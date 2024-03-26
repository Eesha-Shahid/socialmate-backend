import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Payment {

    [x: string]: any;
    
    @Prop()
    card: string;

    @Prop()
    amount: Number;

    @Prop()
    created: Number

    @Prop()
    currency: String

    @Prop()
    payment_method: String
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
