import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

// Services
import { UserService } from '../services/user.service';

// Auth Guard
import { RolesAuthGuard } from '../roles-auth.guard';
import { Roles } from '../roles.decorator';
import { UserType } from '../../common/enums/index';
import { GenerateCaptionDto } from '../dto/generateCaption.dto';
import { UpdateScheduledPostDto } from 'src/scheduledPost/dto/update-scheduled-post.dto';

@Controller('user')
@UseGuards(RolesAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @Roles(UserType.Standard, UserType.Premium)
  async getProfile(@Req() req) {
    return await this.userService.getProfile(req.user.id);
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
  async createProject(
    @Body() generateCaptionDto: GenerateCaptionDto,
  ): Promise<any> {
    const data = this.userService.generateCaption(generateCaptionDto);
    return data;
  }
}
