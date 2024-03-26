import { IsNotEmpty } from "class-validator";

export class CardInfoDto {
    
    @IsNotEmpty()
    card:string
}
