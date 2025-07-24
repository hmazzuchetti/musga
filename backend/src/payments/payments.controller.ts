import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body('vocalId') vocalId: string,
    @CurrentUser() user: User,
  ): Promise<{ clientSecret: string; amount: number }> {
    if (!vocalId) {
      throw new BadRequestException('Vocal ID is required');
    }

    return await this.paymentsService.createPaymentIntent(vocalId, user.id);
  }

  @Post('confirm-payment/:paymentIntentId')
  async confirmPayment(
    @Param('paymentIntentId') paymentIntentId: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; transaction?: any }> {
    try {
      const transaction = await this.paymentsService.confirmPayment(paymentIntentId);
      return { success: true, transaction };
    } catch (error) {
      return { success: false };
    }
  }

  @Get('purchases')
  async getUserPurchases(
    @CurrentUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<{ data: any[]; total: number; page: number; totalPages: number }> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      throw new BadRequestException('Invalid page number');
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Invalid limit (1-100)');
    }

    const result = await this.paymentsService.getUserPurchases(user.id, pageNum, limitNum);
    
    return {
      data: result.data,
      total: result.total,
      page: pageNum,
      totalPages: Math.ceil(result.total / limitNum),
    };
  }

  @Get('sales')
  async getUserSales(
    @CurrentUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('vocalId') vocalId?: string,
  ): Promise<{ data: any[]; total: number; page: number; totalPages: number }> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      throw new BadRequestException('Invalid page number');
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Invalid limit (1-100)');
    }

    const result = await this.paymentsService.getUserSales(user.id, pageNum, limitNum, vocalId);
    
    return {
      data: result.data,
      total: result.total,
      page: pageNum,
      totalPages: Math.ceil(result.total / limitNum),
    };
  }

  @Get('earnings')
  async getUserEarnings(
    @CurrentUser() user: User,
  ): Promise<{ totalEarnings: number; totalSales: number }> {
    return await this.paymentsService.getUserEarnings(user.id);
  }

  @Get('download/:vocalId')
  async downloadVocal(
    @Param('vocalId') vocalId: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const filePath = await this.paymentsService.getVocalFile(vocalId, user.id);
    
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    const fileName = path.basename(filePath);
    const stat = fs.statSync(filePath);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    fs.createReadStream(filePath).pipe(res);
  }
}