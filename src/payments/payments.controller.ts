import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymenSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() paymentSesssionDto : PaymenSessionDto){
    // return {paymentSesssionDto}
    return this.paymentsService.createPaymentSession(paymentSesssionDto);
  }

  @Get('success')
  success(){
    return {
      ok : true,
      message : 'Payment Successful'
    }
  }

  @Get('cancel')
  cancel(){
    return {
      ok : true,
      message : 'Payment Cancelled'
    }
  }

  @Post('webhook')
  async stripeWebhook(@Req() req : Request, @Res() res : Response){
    return  this.paymentsService.stripeWebhook(req, res);


    // console.log('Webhook llamado')
    // return {
    //   ok : true,
    //   message : 'Webhook Received'
    // }
  }

}
