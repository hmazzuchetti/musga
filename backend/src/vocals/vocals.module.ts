import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { VocalsController } from './vocals.controller';
import { VocalsService } from './vocals.service';
import { Vocal } from '../database/entities/vocal.entity';
import { User } from '../database/entities/user.entity';
import { multerConfig } from './config/multer.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocal, User]),
    MulterModule.register(multerConfig),
  ],
  controllers: [VocalsController],
  providers: [VocalsService],
  exports: [VocalsService],
})
export class VocalsModule {}