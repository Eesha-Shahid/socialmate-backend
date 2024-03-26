import { IsNotEmpty } from "class-validator";

export class SavePaymentDto {
    
    @IsNotEmpty()
    card: String

    @IsNotEmpty()
    amount: Number

    @IsNotEmpty()
    currency: String

    @IsNotEmpty()
    payment_method: String
}
