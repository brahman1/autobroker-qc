import { Controller, Get, Post, Headers, Req, BadRequestException, RawBodyRequest, Param, Request as NestRequest, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('config')
  getPublicConfig() {
    return this.paymentsService.getPublicConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Get('history/my')
  history(@NestRequest() req) { return this.paymentsService.paymentHistory(req.user.id); }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    if (!request.rawBody) {
      throw new BadRequestException('Missing raw webhook body');
    }
    return this.paymentsService.handleWebhook(signature, request.rawBody);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/intent')
  createOrderIntent(@NestRequest() req, @Param('id') id: string) { return this.paymentsService.createOrderPaymentIntent(req.user.id, id); }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/confirm')
  confirmOrder(@NestRequest() req, @Param('id') id: string) { return this.paymentsService.confirmOrderPayment(req.user.id, id); }
}
