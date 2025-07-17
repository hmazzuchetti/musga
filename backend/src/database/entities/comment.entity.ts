import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Vocal } from './vocal.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  @Index()
  vocalId: string;

  @Column()
  @Index()
  userId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  likeCount: number;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Vocal, (vocal) => vocal.comments)
  @JoinColumn({ name: 'vocalId' })
  vocal: Vocal;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'userId' })
  user: User;
}