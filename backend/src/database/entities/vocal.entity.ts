import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Genre, LicensingType } from '@musga/shared';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { Comment } from './comment.entity';

@Entity('vocals')
export class Vocal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: Genre,
  })
  @Index()
  genre: Genre;

  @Column({ type: 'integer' })
  @Index()
  bpm: number;

  @Column()
  key: string;

  @Column()
  tone: string;

  @Column({ type: 'integer' })
  duration: number; // in seconds

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Index()
  price: number;

  @Column({
    type: 'enum',
    enum: LicensingType,
  })
  @Index()
  licensingType: LicensingType;

  @Column()
  filePath: string;

  @Column()
  previewPath: string;

  @Column({ type: 'integer', default: 0 })
  fileSize: number; // in bytes

  @Column()
  @Index()
  singerId: string;

  @Column({ default: false })
  @Index()
  isExclusive: boolean;

  @Column({ default: false })
  @Index()
  isSold: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @Column({ type: 'integer', default: 0 })
  downloadCount: number;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.vocals)
  @JoinColumn({ name: 'singerId' })
  singer: User;

  @OneToMany(() => Transaction, (transaction) => transaction.vocal)
  transactions: Transaction[];

  @OneToMany(() => Comment, (comment) => comment.vocal)
  comments: Comment[];
}