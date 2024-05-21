import { IsNotEmpty } from "class-validator";

export class SubredditDto {

    @IsNotEmpty()
    readonly name: string;
}
