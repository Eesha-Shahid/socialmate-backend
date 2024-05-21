import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from '../schemas/payment.schema';
import { SavePaymentDto } from '../dto/save-payment.dto';
import { SubscriptionStatus } from 'src/common/enums/subscription.enum';
import * as mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<Payment>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  // Creating customer
  async createCustomer(name: string, email: string) {
    return this.stripe.customers.create({
      name,
      email,
    });
  }

  async createPaymentIntent(cusomterID: string) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: 250,
      currency: 'usd',
      customer: cusomterID,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      payment_method: 'pm_card_visa',
    });
    return paymentIntent.id;
  }

  async confirmCardPayment(clientSecret: string) {
    const paymentIntent = await this.stripe.paymentIntents.confirm(
      clientSecret,
      {
        payment_method: 'pm_card_visa',
      },
    );
    return paymentIntent;
  }

  async savePayment(savePaymentDto: SavePaymentDto): Promise<Payment | null> {
    return await this.paymentModel.create(savePaymentDto);
  }

  async findActiveSubscription(userId: string): Promise<Payment | null> {
    try {
      const activeSubscription = await this.paymentModel.findOne({
        user_id: new ObjectId(userId),
        status: SubscriptionStatus.Active,
      });
      return activeSubscription;
    } catch (error) {
      return null;
    }
  }

  async inactivateSubscription(
    activeSubscription: Payment,
  ): Promise<Payment | null> {
    try {
      const subscription = await this.paymentModel.findById(
        activeSubscription._id,
      );
      subscription.status = SubscriptionStatus.Inactive;
      await subscription.save();
      return subscription;
    } catch (error) {
      console.error('INACTIVATE_SUBSCRIPTION.ERROR', error);
      return null;
    }
  }
}
