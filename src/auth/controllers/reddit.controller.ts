import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { RolesAuthGuard } from '../roles-auth.guard';
import { UserType } from '../../common/enums/index';
import { Roles } from '../roles.decorator';
import { RedditService } from '../services/reddit.service';
import { FormDataRequest } from 'nestjs-form-data';
import { SubredditDto } from '../dto/subreddit.dto';
import { SocialMediaCredentialsDto } from '../dto/social-media-credentials.dto';

@Controller('reddit')
@UseGuards(RolesAuthGuard)
export class RedditController {
  constructor(private readonly redditService: RedditService) {}

  @Post('login')
  @Roles(UserType.Standard, UserType.Premium)
  async saveRedditAccessToken(
    @Body() socialMediaCredentialsDto: SocialMediaCredentialsDto,
    @Req() req,
  ) {
    return await this.redditService.connectReddit(
      req.user,
      socialMediaCredentialsDto,
    );
  }

  @Post('profile')
  @Roles(UserType.Standard, UserType.Premium)
  async fetchProfile(@Req() req) {
    return await this.redditService.fetchProfile(req.user);
  }

  @Get('subreddits')
  @Roles(UserType.Standard, UserType.Premium)
  async getSubreddits(@Req() req) {
    return await this.redditService.getSubreddits();
  }

  @Post('karma')
  @Roles(UserType.Standard, UserType.Premium)
  async fetchKarma(@Req() req) {
    return await this.redditService.viewRedditKarma(req.user);
  }

  @Post('submit')
  @FormDataRequest()
  @Roles(UserType.Standard, UserType.Premium)
  async submitPost(
    @Body()
    body: {
      sr: string;
      title: string;
      text?: string;
      url?: string;
      flair_id: string;
      flair_text: string;
    },
    @Req() req,
  ): Promise<any> {
    if (body.text && body.text.trim() !== '') {
      return await this.redditService.createPostWithText(
        // req.user.id,
        body.sr,
        body.title,
        body.text,
        body.flair_id,
        body.flair_text,
      );
    } else if (body.url && body.url.trim() !== '') {
      return await this.redditService.createPostWithLink(
        req.user.id,
        body.sr,
        body.title,
        body.url,
      );
    } else {
      throw new BadRequestException('Either text or URL must be provided.');
    }
  }

  @Post('flairs')
  @Roles(UserType.Standard, UserType.Premium)
  async getFlairs(
    @Body() subredditDto: SubredditDto,
    @Req() req,
  ): Promise<any> {
    return await this.redditService.findFlairs(req.user, subredditDto);
  }

  @Post('logout')
  @Roles(UserType.Standard, UserType.Premium)
  async deleteAccessToken(@Req() req) {
    return await this.redditService.deleteAccessToken(req.user);
  }
}
