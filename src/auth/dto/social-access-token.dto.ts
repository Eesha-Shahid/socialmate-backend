import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { SocialMediaPlatform } from '../../common/enums/platforms.enum';

export class SocialAccessToken {
  @IsNotEmpty()
  @IsEnum(SocialMediaPlatform)
  readonly platform: SocialMediaPlatform;

  @IsNotEmpty()
  @IsString()
  readonly accessToken: string;
}
