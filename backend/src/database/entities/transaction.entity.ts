import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, JoinColumn } from 'typeorm';
import { LicensingType } from '@musga/shared';
import { User } from './user.entity';
import { Vocal } from './vocal.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  vocalId: string;

  @Column()
  @Index()
  buyerId: string;

  @Column()
  @Index()
  sellerId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sellerAmount: number;

  @Column()
  @Index()
  stripePaymentId: string;

  @Column({
    type: 'enum',
    enum: LicensingType,
  })
  licensingType: LicensingType;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' })
  @Index()
  status: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  refundId: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Vocal, (vocal) => vocal.transactions)
  @JoinColumn({ name: 'vocalId' })
  vocal: Vocal;

  @ManyToOne(() => User, (user) => user.purchases)
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @ManyToOne(() => User, (user) => user.sales)
  @JoinColumn({ name: 'sellerId' })
  seller: User;
}