import { IsNotEmpty } from "class-validator";

export class CreateRedditPostDto {

	@IsNotEmpty()
    sr: string;

	@IsNotEmpty()
	title: string;
	
	text?: string;
	url?: string;
	flair_text?: string;
	flair_id?: string;   
}