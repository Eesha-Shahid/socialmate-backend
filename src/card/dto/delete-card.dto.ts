import { IsNotEmpty, IsString } from "class-validator"

export class DeleteCardDto {
    
    @IsNotEmpty()
    @IsString()
    readonly cardId: String 
}