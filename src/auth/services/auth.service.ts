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
import { StripeService } from '../../payments/services/stripe.service';
import { MailService } from 'src/mail/services/mail.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { EmailDto } from '../dto/email.dto';
import { DeleteCardDto } from 'src/card/dto/delete-card.dto';
import { Card } from 'src/card/schemas/card.schema';
import { SavePaymentDto } from 'src/payments/dto/save-payment.dto';
import { UpdateCardDto } from 'src/card/dto/update-card.dto';
import { UserType } from 'src/common/enums/users.enum';
import { Payment } from 'src/payments/schemas/payment.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,

    private mailService: MailService,

    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // Signup
  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
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
    return { token };
  }

  // Login
  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('LOGIN.INVALID_EMAIL_OR_PASSWORD');
    }

    const token = this.jwtService.sign({ id: user._id });
    return { user, token };
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

  async sendResetEmail(emailDto: EmailDto) {
    const { email } = emailDto;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      console.error('RESET_EMAIL.INVALID_EMAIL');
    } else {
      const resetLink = `http://localhost:3000/reset?email=${encodeURIComponent(
        user.email,
      )}`;
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
      return await this.mailService.sendEmail(mailOptions);
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

  async changeForgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<User | null> {
    const { email, newPassword } = forgotPasswordDto;
    const user = await this.userModel.findOne({ email: email });
    user.password = await bcrypt.hash(newPassword, 10);
    return await user.save();
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

  async addCard(userId: string, addCardDto): Promise<User | null> {
    try {
      // const iv = randomBytes(16);
      // const password = 'socialmate14';
      // const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
      // const cipher = createCipheriv('aes-256-ctr', key, iv);
      // const encryptedCardNumber = Buffer.concat([
      //   cipher.update(addCardDto.cardNumber),
      //   cipher.final(),
      // ]);

      const user = await this.userModel.findById(userId);
      const isDefault = user.cards.length === 0;

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          $push: {
            cards: {
              ...addCardDto,
              cardNumber: addCardDto.cardNumber,
              default: isDefault,
            },
          },
        },
        { new: true },
      );
      return updatedUser;
    } catch (error) {
      console.error('ADD_CARD.', error);
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

  async setDefaultCard(
    userId: string,
    updateCardDto: UpdateCardDto,
  ): Promise<User | null> {
    try {
      const { cardId } = updateCardDto;

      await this.userModel.updateOne(
        { _id: userId },
        { $set: { 'cards.$[].default': false } },
      );

      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: userId, 'cards._id': cardId },
        { $set: { 'cards.$.default': true } },
        { new: true },
      );

      return updatedUser;
    } catch (error) {
      console.error('SET_DEFAULT_CARD.', error);
      return null;
    }
  }

  async getDefaultCardId(userId: string): Promise<Card> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        console.error('GET_DEFAULT_CARD_ID.USER_NOT_FOUND');
        return null;
      }

      const defaultCard = user.cards.find((card) => card.default);
      if (!defaultCard) {
        console.error('GET_DEFAULT_CARD_ID.DEFAULT_CARD_NOT_FOUND');
        return null;
      }

      return defaultCard;
    } catch (error) {
      console.error('GET_DEFAULT_CARD_ID.', error);
      return null;
    }
  }

  async subscribe(userId: string, customerId: string) {
    const user = await this.userModel.findById(userId);
    if (user.user_type === UserType.Premium) {
      console.error('SUBSCRIBE.ALREADY_PREMIUM_USER');
      return null;
    }

    const defaultCard = await this.getDefaultCardId(userId);

    if (!defaultCard) {
      console.error('SUBSCRIBE.DEFAULT_CARD_NOT_FOUND');
      return null;
    }

    const clientSecret =
      await this.stripeService.createPaymentIntent(customerId);
    const paymentIntent =
      await this.stripeService.confirmCardPayment(clientSecret);
    const savePaymentDto = new SavePaymentDto();
    savePaymentDto.card = defaultCard.cardNumber;
    savePaymentDto.amount = paymentIntent.amount;
    savePaymentDto.currency = paymentIntent.currency;
    savePaymentDto.payment_method = 'Card';

    try {
      const user = await this.userModel.findOne({
        stripe_customer_id: customerId,
      });
      const updatedUser = await this.userModel.findByIdAndUpdate(
        user.id,
        {
          $push: { payments: { ...savePaymentDto } },
          $set: { user_type: UserType.Premium }, // Set user type to premium
        },
        { new: true },
      );
      return updatedUser;
    } catch (error) {
      console.error('SUBSCRIBE.', error);
      return null;
    }
  }

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

  async getInstagramAnalyticsSummary(userId: string): Promise<any> {
    const { ObjectId } = mongoose.Types;
    const data = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'instagram_user',
          localField: '_id',
          foreignField: 'user_id',
          as: 'user_details',
        },
      },
      {
        $unwind: '$user_details',
      },
      {
        $replaceRoot: {
          newRoot: '$user_details',
        },
      },
      {
        $project: {
          reach: {
            $let: {
              vars: {
                data: '$reach.data.total_value.value',
              },
              in: {
                value: { $arrayElemAt: ['$$data', 0] },
                last_value: { $arrayElemAt: ['$$data', -1] },
              },
            },
          },
          likes: {
            $let: {
              vars: {
                data: '$likes.data.total_value.value',
              },
              in: {
                value: { $arrayElemAt: ['$$data', 0] },
                last_value: { $arrayElemAt: ['$$data', -1] },
              },
            },
          },
          comments: {
            $let: {
              vars: {
                data: '$comments.data.total_value.value',
              },
              in: {
                value: { $arrayElemAt: ['$$data', 0] },
                last_value: { $arrayElemAt: ['$$data', -1] },
              },
            },
          },
          follows_and_unfollows: {
            $let: {
              vars: {
                data: '$follows_and_unfollows.data.total_value.value',
              },
              in: {
                value: { $arrayElemAt: ['$$data', 0] },
                last_value: { $arrayElemAt: ['$$data', -1] },
              },
            },
          },
        },
      },
    ]);
    return data[0];
  }
}
