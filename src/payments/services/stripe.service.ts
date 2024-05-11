import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from '../schemas/payment.schema';
import { SavePaymentDto } from '../dto/save-payment.dto';

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

  // Used for adding a card
  // async createToken(credentials: CredentialsDto) {
  //   return await this.stripe.tokens.create({
  //     // @ts-ignore
  //     card: {
  //       number: credentials.number,
  //       exp_month: credentials.exp_month,
  //       exp_year: credentials.exp_year,
  //     },
  //   });
  // }

  // async createPaymentMethod(tokenId: string) {
  //   return await this.stripe.paymentMethods.create({
  //     type: 'card',
  //     card: {
  //       token: tokenId,
  //     },
  //   });
  // }

  // async attachPaymentMethod(methodId: string, customerId: string) {
  //   return await this.stripe.paymentMethods.attach(methodId, {
  //     customer: customerId,
  //   });
  // }

  // // Used for deleting card
  // async detachPaymentMethod(methodId: string) {
  //   return await this.stripe.paymentMethods.detach(methodId);
  // }

  // async create(
  //   createPaymentDto: CreatePaymentDto,
  //   user: User,
  // ): Promise<Payment> {
  //   const data = Object.assign(createPaymentDto, { user: user._id });
  //   const res = await this.paymentModel.create(data);

  //   return res;
  // }

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
}
