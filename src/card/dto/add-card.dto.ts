import { IsNotEmpty, IsString } from "class-validator"

export class AddCardDto {
    
    @IsNotEmpty()
    @IsString()
    readonly cardNumber: String

    @IsNotEmpty()
    readonly expMonth: Number

    @IsNotEmpty()
    readonly expYear: Number

    @IsNotEmpty()
    @IsString()
    readonly cvc: String
    
}