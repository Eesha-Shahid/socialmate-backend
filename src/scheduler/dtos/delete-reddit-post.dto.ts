import { IsNotEmpty, IsString } from "class-validator"

export class DeleteRedditPostDto {
    
    @IsNotEmpty()
    @IsString()
    readonly postId: string 
}