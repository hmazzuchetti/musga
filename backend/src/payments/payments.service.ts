import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Transaction } from '../database/entities/transaction.entity';
import { Vocal } from '../database/entities/vocal.entity';
import { User } from '../database/entities/user.entity';
import { LicensingType } from '@musga/shared';

// Mock Stripe implementation for prototype
interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  client_secret: string;
}

@Injectable()
export class PaymentsService {
  private readonly platformFeeRate = 0.10; // 10% platform fee

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Vocal)
    private vocalRepository: Repository<Vocal>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async createPaymentIntent(vocalId: string, buyerId: string): Promise<{ clientSecret: string; amount: number }> {
    const vocal = await this.vocalRepository.findOne({
      where: { id: vocalId, isActive: true },
      relations: ['singer'],
    });

    if (!vocal) {
      throw new NotFoundException('Vocal not found');
    }

    if (vocal.isSold && vocal.licensingType === LicensingType.EXCLUSIVE) {
      throw new ConflictException('This vocal has already been sold exclusively');
    }

    const buyer = await this.userRepository.findOne({ where: { id: buyerId } });
    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    if (vocal.singerId === buyerId) {
      throw new BadRequestException('You cannot purchase your own vocal');
    }

    const amount = vocal.price;
    const platformFee = amount * this.platformFeeRate;
    const sellerAmount = amount - platformFee;

    // Mock Stripe payment intent creation
    const paymentIntent = await this.createMockStripePaymentIntent(amount);

    // Create pending transaction
    const transaction = this.transactionRepository.create({
      vocalId,
      buyerId,
      sellerId: vocal.singerId,
      amount,
      platformFee,
      sellerAmount,
      stripePaymentId: paymentIntent.id,
      licensingType: vocal.licensingType,
      status: 'pending',
    });

    await this.transactionRepository.save(transaction);

    return {
      clientSecret: paymentIntent.client_secret,
      amount: amount,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { stripePaymentId: paymentIntentId },
      relations: ['vocal', 'buyer', 'seller'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== 'pending') {
      throw new BadRequestException('Transaction is not pending');
    }

    // Mock Stripe payment confirmation
    const paymentStatus = await this.getMockStripePaymentStatus(paymentIntentId);

    if (paymentStatus === 'succeeded') {
      transaction.status = 'completed';
      
      // Update vocal if exclusive
      if (transaction.licensingType === LicensingType.EXCLUSIVE) {
        await this.vocalRepository.update(transaction.vocalId, { 
          isSold: true,
          isActive: false 
        });
      }

      // Increment download count
      await this.vocalRepository.increment(
        { id: transaction.vocalId },
        'downloadCount',
        1
      );

      await this.transactionRepository.save(transaction);
    } else {
      transaction.status = 'failed';
      transaction.failureReason = 'Payment failed';
      await this.transactionRepository.save(transaction);
    }

    return transaction;
  }

  async getUserPurchases(userId: string, page: number = 1, limit: number = 20): Promise<{ data: Transaction[]; total: number }> {
    const [data, total] = await this.transactionRepository.findAndCount({
      where: { buyerId: userId, status: 'completed' },
      relations: ['vocal', 'seller'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async getUserSales(userId: string, page: number = 1, limit: number = 20): Promise<{ data: Transaction[]; total: number }> {
    const [data, total] = await this.transactionRepository.findAndCount({
      where: { sellerId: userId, status: 'completed' },
      relations: ['vocal', 'buyer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async getUserEarnings(userId: string): Promise<{ totalEarnings: number; totalSales: number }> {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.sellerAmount)', 'totalEarnings')
      .addSelect('COUNT(transaction.id)', 'totalSales')
      .where('transaction.sellerId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: 'completed' })
      .getRawOne();

    return {
      totalEarnings: parseFloat(result.totalEarnings) || 0,
      totalSales: parseInt(result.totalSales) || 0,
    };
  }

  async getVocalFile(vocalId: string, userId: string): Promise<string> {
    const transaction = await this.transactionRepository.findOne({
      where: { 
        vocalId, 
        buyerId: userId, 
        status: 'completed' 
      },
      relations: ['vocal'],
    });

    if (!transaction) {
      throw new NotFoundException('Purchase not found or not completed');
    }

    return transaction.vocal.filePath;
  }

  // Mock Stripe methods for prototype
  private async createMockStripePaymentIntent(amount: number): Promise<StripePaymentIntent> {
    // In a real implementation, this would use the Stripe SDK
    const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    return {
      id: paymentIntentId,
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: 'usd',
      status: 'pending',
      client_secret: `${paymentIntentId}_secret_mock`,
    };
  }

  private async getMockStripePaymentStatus(paymentIntentId: string): Promise<'succeeded' | 'pending' | 'failed'> {
    // In a real implementation, this would query Stripe
    // For the prototype, we'll simulate success most of the time
    return Math.random() > 0.1 ? 'succeeded' : 'failed';
  }
}