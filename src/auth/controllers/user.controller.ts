import { Controller, Get, Req, UseGuards } from '@nestjs/common';

// Services
import { UserService } from '../services/user.service';

// Auth Guard
import { RolesAuthGuard } from '../roles-auth.guard';
import { Roles } from '../roles.decorator';
import { UserType } from 'src/common/enums/users.enum';

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
}
