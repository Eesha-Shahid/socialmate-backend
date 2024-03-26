import { Module } from '@nestjs/common';
import { StripeService } from './services/stripe.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSchema } from './schemas/payment.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[
    AuthModule,
    MongooseModule.forFeature([{ name: 'Payment', schema: PaymentSchema }])
  ],
  providers: [StripeService],
  exports: [StripeService]
})
export class StripeModule {}
