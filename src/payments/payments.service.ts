import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { PaymenSessionDto, PaymentSessiontItemDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret);    
    private readonly logger = new Logger('PaymentsService');

    constructor(
        @Inject(NATS_SERVICE) private readonly natsClient : ClientProxy
    ){}

    async createPaymentSession(paymenSessionDto : PaymenSessionDto){

        const {currency, items, orderId} = paymenSessionDto;

        const lineItems = items.map((item : PaymentSessiontItemDto) => {
            return {
                price_data: {
                    currency,
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            }
        })

        const session = await this.stripe.checkout.sessions.create({
            // Colocar aqui el ID de mi orden
            payment_intent_data: {
                metadata: {
                    orderId
                },
            },

            line_items : lineItems,

            mode: 'payment',
            success_url: envs.successsUrl,
            cancel_url: envs.cancelUrl,
     
        });

        // return this.stripe.paymentIntents.create({
        //     amount: 1000,
        //     currency: 'usd',
        //     payment_method_types: ['card'],
        // });

        return {
            cancelUrl : session.cancel_url,
            successUrl : session.success_url,
            sessionId : session.id,
            url : session.url
        }
    }   


    async stripeWebhook(req : Request, res : Response){
        const sig = req.headers['stripe-signature'];

        let event : Stripe.Event;
        // testing
        // const endpointSecret = 'whsec_695bb5d61e67aae15c39e243a3708a6ceb2177e93cd2aa919a9e0f78738656dd'

        // real world 
        const endpointSecret = envs.stripeEndpointSecret

        try {
            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig!, endpointSecret);
          }
          catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
          }

        // console.log({evento : event!})

        switch(event!.type!){
            case 'charge.succeeded':
                const chargeSucceded = event!.data.object as Stripe.Charge;
                const payload = {
                    stripePaymentId : chargeSucceded.id,
                    orderId : chargeSucceded.metadata.orderId,
                    receiptUrl : chargeSucceded.receipt_url
                }

                this.natsClient.emit('payment.succeeded', payload)
                
            break;

            default : 
                console.log(`Event Type: ${event!.type} no handled`)
        }  
            

        return res.status(200).json({sig})
    }


}
