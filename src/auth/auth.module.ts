import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserSchema } from './schemas/user.schema';

// User Defined Controllers
import { PhotoController } from './controllers/photo.controller';

// User Defined Modules
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { StripeModule } from '../payments/stripe.module';
import { JwtStrategy } from './jwt.strategy';

//Other Modules
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { NestjsFormDataModule } from 'nestjs-form-data';

// User Defined
import { RedditController } from './controllers/reddit.controller';
import { RedditService } from './services/reddit.service';
import { MailModule } from 'src/mail/mail.module';
// import { CardModule } from 'src/card/card.module';
import { SchedulerModule } from 'src/scheduler/scheduler.module';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { HttpModule } from '@nestjs/axios';
import { ScheduledPostModule } from 'src/scheduledPost/scheduled-post.module';
import { InfluencerModule } from 'src/influencer/influencer.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES,
        },
      }),
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    forwardRef(() => StripeModule),
    CloudinaryModule,
    NestjsFormDataModule,
    MailModule,
    // CardModule,
    HttpModule,
    forwardRef(() => SchedulerModule),
    ScheduledPostModule,
    InfluencerModule,
  ],
  controllers: [
    AuthController,
    UserController,
    RedditController,
    PhotoController,
  ],
  providers: [AuthService, UserService, RedditService, JwtStrategy],
  exports: [AuthService, JwtStrategy, RedditService, PassportModule],
})
export class AuthModule {}
