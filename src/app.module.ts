import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// User-defined Modules
import { StripeModule } from './payments/stripe.module';
import { AuthModule } from './auth/auth.module';

// Other Modules
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { MailModule } from './mail/mail.module';
import { CardModule } from './card/card.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    MongooseModule.forRoot(process.env.MONGO_URI, { dbName: 'sm_db',}),
    AuthModule, 
    StripeModule,
    NestjsFormDataModule,
    MailModule,
    CardModule,
    ScheduleModule.forRoot(),
    SchedulerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
