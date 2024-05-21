/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

// Services
import { UserService } from '../services/user.service';

// Auth Guard
import { RolesAuthGuard } from '../roles-auth.guard';
import { Roles } from '../roles.decorator';
import { UserType } from '../../common/enums/index';
import { GenerateCaptionDto } from '../dto/generateCaption.dto';
import { UpdateScheduledPostDto } from 'src/scheduledPost/dto/update-scheduled-post.dto';
import { InfluencerDto } from '../dto/toggle-influencer.dto';
import { AddCardDto } from 'src/card/dto/add-card.dto';
import { UpdateCardDto } from 'src/card/dto/update-card.dto';
import { AddScheduledPostDto } from 'src/scheduledPost/dto/add-scheduled-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubmitFeedbackDto } from '../dto/submit-feedback.dto';

@Controller('user')
@UseGuards(RolesAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @Roles(UserType.Standard, UserType.Premium)
  async getProfile(@Req() req) {
    return await this.userService.getProfile(req.user.id);
  }

  @Post('add-card')
  @Roles(UserType.Standard, UserType.Premium)
  async addCard(@Req() req, @Body() addCardDto: AddCardDto) {
    console.log(addCardDto);
    return await this.userService.addCard(req.user.id, addCardDto);
  }

  @Post('subscribe')
  @Roles(UserType.Standard, UserType.Premium)
  async subscribe(@Req() req) {
    return await this.userService.subscribe(req.user.id);
  }

  @Post('set-default-card')
  @Roles(UserType.Standard, UserType.Premium)
  async setDefaultCard(@Req() req, @Body() updateCardDto: UpdateCardDto) {
    return this.userService.setDefaultCard(req.user.id, updateCardDto);
  }

  @Get('account-details/instagram')
  @Roles(UserType.Standard, UserType.Premium)
  async getInstagramAccountDetails(@Req() req) {
    return await this.userService.getInstagramAccountDetails(req.user.id);
  }

  @Get('analytics-summary/instagram')
  @Roles(UserType.Standard, UserType.Premium)
  async getInstagramAnalyticsSummary(@Req() req) {
    return await this.userService.getInstagramAnalyticsSummary(req.user.id);
  }

  @Get('profile-views/instagram')
  @Roles(UserType.Standard, UserType.Premium)
  async getInstagramProfileViews(@Req() req) {
    return await this.userService.getInstagramProfileViews(req.user.id);
  }

  @Get('audientce-insights/instagram')
  @Roles(UserType.Standard, UserType.Premium)
  async getInstagramAudienceInsights(@Req() req) {
    return await this.userService.getInstagramAudienceInsights(req.user.id);
  }

  @Get('milestones/instagram')
  @Roles(UserType.Standard, UserType.Premium)
  async getInstagramMilestones(@Req() req) {
    return await this.userService.getInstagramMilestones(req.user.id);
  }

  @Get('goals/instagram')
  @Roles(UserType.Standard, UserType.Premium)
  async getInstagramGoals(@Req() req) {
    return await this.userService.getInstagramGoals(req.user.id);
  }

  @Get('scheduled-posts')
  @Roles(UserType.Standard, UserType.Premium)
  async getScheduledPosts(@Req() req) {
    return await this.userService.getScheduledPosts(req.user.id);
  }

  @Post('update-scheduled-post')
  @Roles(UserType.Standard, UserType.Premium)
  async updateScheduledPost(
    @Req() req,
    @Body() updateScheduledPostDto: UpdateScheduledPostDto,
  ) {
    return await this.userService.updateScheduledPost(updateScheduledPostDto);
  }

  @Post('add-scheduled-post')
  @Roles(UserType.Standard, UserType.Premium)
  @UseInterceptors(FileInterceptor('file'))
  async createScheduledPost(
    @Req() req,
    @Body('addScheduledPostDto') addScheduledPostDtoJson: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const addScheduledPostDtoParsed: AddScheduledPostDto = JSON.parse(
      addScheduledPostDtoJson,
    );
    return await this.userService.createScheduledPost(
      req.user.id,
      addScheduledPostDtoParsed,
      file,
    );
  }

  @Post('create-post')
  @Roles(UserType.Standard, UserType.Premium)
  @UseInterceptors(FileInterceptor('file'))
  async createPost(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('addScheduledPostDto') addScheduledPostDtoJson: string,
  ) {
    const addScheduledPostDtoParsed: AddScheduledPostDto = JSON.parse(
      addScheduledPostDtoJson,
    );
    return await this.userService.createPost(file, addScheduledPostDtoParsed);
  }

  @Get('influencers')
  @Roles(UserType.Standard, UserType.Premium)
  async getInfluencers(@Req() req) {
    return await this.userService.getInfluencers();
  }

  @Get('ads')
  @Roles(UserType.Standard, UserType.Premium)
  async getAds(@Req() req) {
    return await this.userService.getAds();
  }

  @Get('influencer-list')
  @Roles(UserType.Standard, UserType.Premium)
  async getUserInfluencers(@Req() req) {
    return await this.userService.getUserInfluencers(req.user.id);
  }

  @Post('influencer-list/add')
  @Roles(UserType.Standard, UserType.Premium)
  async addInfluencer(@Req() req, @Body() influencerDto: InfluencerDto) {
    return await this.userService.addInfluencer(req.user.id, influencerDto);
  }

  @Post('influencer-list/remove')
  @Roles(UserType.Standard, UserType.Premium)
  async removeInfluencer(@Req() req, @Body() influencerDto: InfluencerDto) {
    return await this.userService.removeInfluencer(req.user.id, influencerDto);
  }

  @Get('payment-methods')
  @Roles(UserType.Standard, UserType.Premium)
  async getPaymentMethods(@Req() req) {
    return await this.userService.getPaymentMethods(req.user.id);
  }

  @Get('subscription-history')
  @Roles(UserType.Standard, UserType.Premium)
  async getSubscriptionHisotry(@Req() req) {
    return await this.userService.getSubscriptionHistory(req.user.id);
  }

  @Post('generate-caption')
  @Roles(UserType.Standard, UserType.Premium)
  async generateCaption(
    @Req() Req,
    @Body() generateCaptionDto: GenerateCaptionDto,
  ): Promise<any> {
    const data = this.userService.generateCaption(generateCaptionDto);
    return data;
  }

  @Post('generate-caption-from-image')
  @Roles(UserType.Standard, UserType.Premium)
  @UseInterceptors(FileInterceptor('file'))
  async generateCaptionFromImage(
    @Req() Req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const data = this.userService.generateCaptionFromImage(file);
    return data;
  }

  @Post('calculate-sentiment')
  @Roles(UserType.Standard, UserType.Premium)
  async calculateSentiment(@Req() Req, @Body() captionDto: any): Promise<any> {
    const { caption } = captionDto;
    const data = this.userService.calculateSentiment(caption);
    return data;
  }

  @Get('integrations')
  @Roles(UserType.Standard, UserType.Premium)
  async getIntegrationDetail(@Req() req): Promise<any> {
    return await this.userService.getIntegrationDetail(req.user.id);
  }

  @Post('submit/feedback')
  @Roles(UserType.Standard, UserType.Premium)
  async submitFeedback(
    @Req() req,
    @Body() submitFeedbackDto: SubmitFeedbackDto,
  ) {
    return await this.userService.submitFeedback(
      req.user.id,
      submitFeedbackDto,
    );
  }
}
