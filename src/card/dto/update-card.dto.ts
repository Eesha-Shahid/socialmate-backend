import { IsNotEmpty, IsString } from "class-validator"

export class UpdateCardDto {
    
    @IsNotEmpty()
    @IsString()
    readonly cardId: string 
}