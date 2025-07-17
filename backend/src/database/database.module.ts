import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Vocal } from './entities/vocal.entity';
import { Transaction } from './entities/transaction.entity';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'musga'),
        password: configService.get('DB_PASSWORD', 'musga123'),
        database: configService.get('DB_NAME', 'musga'),
        entities: [User, Vocal, Transaction, Comment],
        synchronize: configService.get('NODE_ENV') !== 'production', // Only for development
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}