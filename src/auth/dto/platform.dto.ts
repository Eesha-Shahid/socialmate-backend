import { IsNotEmpty, IsEnum } from "class-validator";
import { SocialMediaPlatform } from "src/common/enums/platforms.enum";

export class PlatformDto {

    @IsNotEmpty()
    @IsEnum(SocialMediaPlatform)
    readonly platform: SocialMediaPlatform;
}
