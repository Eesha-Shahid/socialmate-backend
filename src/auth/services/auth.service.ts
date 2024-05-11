import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { SignUpDto } from '../dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateUsernameDto } from '../dto/update-username.dto';
import { MailService } from 'src/mail/services/mail.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { EmailDto } from '../dto/email.dto';
import { DeleteCardDto } from 'src/card/dto/delete-card.dto';
import { Card } from 'src/card/schemas/card.schema';
import { UserType } from '../../common/enums/index';
import { Payment } from 'src/payments/schemas/payment.schema';
import { randomBytes } from 'crypto';
import { StripeService } from 'src/payments/services/stripe.service';
@Injectable()
export class AuthService {
  constructor(
    private mailService: MailService,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,

    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
  ) {}

  // Signup
  async signUp(
    signUpDto: SignUpDto,
  ): Promise<{ token: string; message: string }> {
    const salt = 10;
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);
    const stripeCustomer = await this.stripeService.createCustomer(
      signUpDto.username,
      signUpDto.email,
    );
    const createdUser = await this.userModel.create({
      ...signUpDto,
      stripe_customer_id: stripeCustomer.id,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({ id: createdUser._id });
    return { token, message: 'Sign Up Successful' };
  }

  // Login
  async login(
    loginDto: LoginDto,
  ): Promise<{ user: User; token: string; message: string }> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('LOGIN.INVALID_EMAIL_OR_PASSWORD');
    }

    const token = this.jwtService.sign({ id: user._id });
    return { user, token, message: 'Login Successful' };
  }

  async googleSignup({
    email,
    name,
    image,
  }: {
    email: string;
    name: string;
    image: string;
  }): Promise<any> {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      const newUser = new this.userModel({
        username: name,
        email,
        googleAuth: true,
      });
      await newUser.save();
      const updatedUser = await this.updateUserProfilePic(newUser.id, image);
      const token = this.jwtService.sign({ id: newUser.id });
      return { updatedUser, token };
    } else {
      console.error('GOOGLE_LOGIN.USER_ALREADY_EXISTS');
    }
  }

  async googleLogin({ email }: { email: string }): Promise<any> {
    const user = await this.userModel.findOne({ email: email });
    if (user) {
      const token = this.jwtService.sign({ id: user.id });
      return { user, token };
    } else {
      console.error('GOOGLE_LOGIN.USER_DOES_NOT_EXIST');
    }
  }

  async findById(userId: string): Promise<User | null> {
    return await this.userModel.findById(userId);
  }

  async sendResetEmail(
    emailDto: EmailDto,
  ): Promise<{ success: boolean; message: string }> {
    const { email } = emailDto;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      return { success: false, message: 'Invalid Email' };
    } else {
      const resetToken = randomBytes(20).toString('hex');
      await this.userModel.findByIdAndUpdate(
        { _id: user._id },
        {
          $set: {
            resetToken: resetToken,
            resetTokenExpiry: Date.now() + 3600000,
          },
        },
        { new: true },
      );
      const resetLink = `http://localhost:3000/reset-password?resetToken=${resetToken}`;
      const mailOptions = {
        transporterName: 'gmail',
        to: user.email,
        subject: 'SocialMate | Email Verification',
        template: './reset',
        context: {
          name: user.username,
          url: resetLink,
        },
      };
      await this.mailService.setTransport();
      try {
        await this.mailService.sendEmail(mailOptions);
        return { success: true, message: 'Reset email sent' };
      } catch (err) {
        return { success: false, message: 'An error occured' };
      }
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User | null> {
    const { currentPassword, newPassword } = changePasswordDto;
    const user = await this.userModel.findById(userId);
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      console.error('CHANGE_PASSWORD.INCORRECT_CURRENT_PASSWORD');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    return await user.save();
  }

  async resetPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ user: User | null; success: boolean; message: string }> {
    const { password, resetToken } = forgotPasswordDto;
    const user = await this.userModel.findOne({
      resetToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return {
        user: null,
        success: false,
        message: 'Invalid or expired reset token',
      };
    }

    user.password = await bcrypt.hash(password, 10);
    const newUser = await user.save();
    return {
      user: newUser,
      success: true,
      message: 'Password Updated',
    };
  }

  async updateUsername(
    userId: string,
    updateUsernameDto: UpdateUsernameDto,
  ): Promise<User | null> {
    const { newUsername } = updateUsernameDto;
    return this.userModel.findByIdAndUpdate(
      userId,
      { username: newUsername },
      { new: true },
    );
  }

  async updateUserProfilePic(
    userId: string,
    profilePicUrl: string,
  ): Promise<void> {
    return await this.userModel.findByIdAndUpdate(
      userId,
      { profilePic: profilePicUrl },
      { new: true },
    );
  }

  async removeUserProfilePic(userId: string): Promise<void> {
    return await this.userModel.findByIdAndUpdate(
      userId,
      { profilePic: null },
      { new: true },
    );
  }
  // Delete User
  async deleteById(user: User) {
    //Deleting user
    await this.userModel.findByIdAndDelete({ _id: user._id });
  }

  async viewCards(userId: string): Promise<Card[] | null> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        console.error('VIEW_CARDS.USER_NOT_FOUND');
        return null;
      }
      const cards = user.cards;
      return cards;
    } catch (error) {
      console.error('VIEW_CARDS.', error);
      return null;
    }
  }

  async deleteCard(
    userId: string,
    deleteCardDto: DeleteCardDto,
  ): Promise<User | null> {
    try {
      const { cardId } = deleteCardDto;
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { cards: { _id: cardId } } },
        { new: true },
      );

      return updatedUser;
    } catch (error) {
      console.error('DELETE_CARD.', error);
      return null;
    }
  }

  // async setDefaultCard(
  //   userId: string,
  //   updateCardDto: UpdateCardDto,
  // ): Promise<User | null> {
  //   try {
  //     const { cardId } = updateCardDto;

  //     await this.userModel.updateOne(
  //       { _id: userId },
  //       { $set: { 'cards.$[].default': false } },
  //     );

  //     const updatedUser = await this.userModel.findOneAndUpdate(
  //       { _id: userId, 'cards._id': cardId },
  //       { $set: { 'cards.$.default': true } },
  //       { new: true },
  //     );

  //     return updatedUser;
  //   } catch (error) {
  //     console.error('SET_DEFAULT_CARD.', error);
  //     return null;
  //   }
  // }

  async getPayments(userId: string): Promise<Payment[] | null> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        console.error('GET_PAYMENTS.USER_NOT_FOUND');
        return null;
      }

      return user.payments;
    } catch (error) {
      console.error('GET_PAYMENTS.', error);
      return null;
    }
  }

  async cancelSubscription(userId: string): Promise<User | null> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        console.error('CANCEL_SUBSCRIPTION.USER_NOT_FOUND');
        return null;
      }

      if (user.user_type !== UserType.Premium) {
        console.error('CANCEL_SUBSCRIPTION.NOT_PREMIUM_USER');
        return null;
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: { user_type: UserType.Standard },
        },
        { new: true },
      );

      return updatedUser;
    } catch (error) {
      console.error('CANCEL_SUBSCRIPTION.', error);
      return null;
    }
  }
}
