import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';

// Dtos
import { SignUpDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateUsernameDto } from '../dto/update-username.dto';

// Services
import { AuthService } from '../services/auth.service';

// Auth Guard
import { RolesAuthGuard } from '../roles-auth.guard';
import { User } from '../schemas/user.schema';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { EmailDto } from '../dto/email.dto';
import { AddCardDto } from 'src/card/dto/add-card.dto';
import { DeleteCardDto } from 'src/card/dto/delete-card.dto';
import { OAuth2Client } from 'google-auth-library';
import { Roles } from '../roles.decorator';
import { UserType } from '../../common/enums/index';
import { UpdateCardDto } from 'src/card/dto/update-card.dto';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

@Controller('auth')
@UseGuards(RolesAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<{ token: string; message: string }> {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
  ): Promise<{ user: User; token: string; message: string }> {
    return this.authService.login(loginDto);
  }

  @Post('google-signup')
  async googleSignup(@Body('token') token): Promise<any> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture } = ticket.getPayload();
    return await this.authService.googleSignup({ email, name, image: picture });
  }

  @Post('google-login')
  async googleLogin(@Body('token') token): Promise<any> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email } = ticket.getPayload();
    return await this.authService.googleLogin({ email });
  }

  @Post('send-forgot-email')
  async sendEmail(
    @Body() emailDto: EmailDto,
  ): Promise<{ success: boolean; message: string }> {
    return await this.authService.sendResetEmail(emailDto);
  }

  @Get()
  @Roles(UserType.Standard, UserType.Premium)
  async viewProfile(@Req() req) {
    return await this.authService.findById(req.user.id);
  }

  @Patch('change-password')
  @Roles(UserType.Standard, UserType.Premium)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ): Promise<User> {
    return await this.authService.changePassword(
      req.user.id,
      changePasswordDto,
    );
  }

  @Patch('reset-password')
  async resetPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ user: User | null; success: boolean; message: string }> {
    return await this.authService.resetPassword(forgotPasswordDto);
  }

  @Patch('update-username')
  @Roles(UserType.Standard, UserType.Premium)
  async updateUsername(
    @Body() updateUsernameDto: UpdateUsernameDto,
    @Req() req,
  ): Promise<User> {
    return await this.authService.updateUsername(
      req.user.id,
      updateUsernameDto,
    );
  }

  @Delete('delete')
  @Roles(UserType.Standard, UserType.Premium)
  async delete(@Req() req) {
    await this.authService.deleteById(req.user);
    return { message: 'Account deleted successfully' };
  }

  @Patch('add-card')
  @Roles(UserType.Standard, UserType.Premium)
  async addCard(@Req() req, @Body() addCardDto: AddCardDto) {
    return await this.authService.addCard(req.user.id, addCardDto);
  }

  @Patch('delete-card')
  @Roles(UserType.Standard, UserType.Premium)
  async deleteCard(@Req() req, @Body() deleteCardDto: DeleteCardDto) {
    return await this.authService.deleteCard(req.user.id, deleteCardDto);
  }

  @Patch('set-default-card')
  @Roles(UserType.Standard, UserType.Premium)
  async setDefaultCard(@Req() req, @Body() updateCardDto: UpdateCardDto) {
    return this.authService.setDefaultCard(req.user.id, updateCardDto);
  }

  @Get('cards')
  @Roles(UserType.Standard, UserType.Premium)
  async fetchCards(@Req() req) {
    return await this.authService.viewCards(req.user.id);
  }

  @Patch('subscribe')
  @Roles(UserType.Standard, UserType.Premium)
  async subscribe(@Req() req) {
    return await this.authService.subscribe(
      req.user.id,
      req.user.stripe_customer_id,
    );
  }

  @Get('payments')
  @Roles(UserType.Standard, UserType.Premium)
  async getPayments(@Req() req) {
    return this.authService.getPayments(req.user.id);
  }

  @Patch('unsubscribe')
  @Roles(UserType.Standard, UserType.Premium)
  async cancelSubscription(@Req() req) {
    return await this.authService.cancelSubscription(req.user.id);
  }

  // @Get('twitter/callback')
  // twitterLoginCallback(
  //     @Req() req,
  //     @Res() res
  // ) {
  //     console.log("Trying to fetch request token")
  //     console.log("Query:",req.query)
  //     // res.redirect('http://localhost:4000/auth/twitter/callback');
  // }
}
