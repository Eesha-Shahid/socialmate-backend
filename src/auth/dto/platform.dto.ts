import { IsNotEmpty, IsEnum } from 'class-validator';
import { SocialMediaPlatform } from '../../common/enums/index';

export class PlatformDto {
  @IsNotEmpty()
  @IsEnum(SocialMediaPlatform)
  readonly platform: SocialMediaPlatform;
}
