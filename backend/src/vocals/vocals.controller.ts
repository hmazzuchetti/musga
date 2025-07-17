import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { VocalsService } from './vocals.service';
import { CreateVocalDto, UpdateVocalDto, VocalSearchFilters, PaginatedResponse, Vocal } from '@musga/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '@musga/shared';
import { User } from '../database/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import * as fs from 'fs';
import * as path from 'path';

@Controller('vocals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VocalsController {
  constructor(private readonly vocalsService: VocalsService) {}

  @Post('upload')
  @Roles(UserRole.SINGER)
  @UseInterceptors(FileInterceptor('audio'))
  async upload(
    @Body() createVocalDto: CreateVocalDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<Vocal> {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    return await this.vocalsService.create(createVocalDto, file, user.id);
  }

  @Get()
  @Public()
  async findAll(
    @Query() filters: VocalSearchFilters,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<PaginatedResponse<Vocal>> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      throw new BadRequestException('Invalid page number');
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Invalid limit (1-100)');
    }

    return await this.vocalsService.findAll(filters, pageNum, limitNum);
  }

  @Get('my-vocals')
  @Roles(UserRole.SINGER)
  async getMyVocals(
    @CurrentUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<PaginatedResponse<Vocal>> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      throw new BadRequestException('Invalid page number');
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Invalid limit (1-100)');
    }

    return await this.vocalsService.findBySinger(user.id, pageNum, limitNum);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<Vocal> {
    return await this.vocalsService.findOne(id);
  }

  @Get(':id/preview')
  @Public()
  async getPreview(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const vocal = await this.vocalsService.findOne(id);
    
    if (!fs.existsSync(vocal.previewPath)) {
      throw new BadRequestException('Preview not found');
    }

    const stat = fs.statSync(vocal.previewPath);
    const fileSize = stat.size;
    const range = res.req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(vocal.previewPath, { start, end });

      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg',
      });

      file.pipe(res);
    } else {
      res.set({
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });

      fs.createReadStream(vocal.previewPath).pipe(res);
    }
  }

  @Patch(':id')
  @Roles(UserRole.SINGER)
  async update(
    @Param('id') id: string,
    @Body() updateVocalDto: UpdateVocalDto,
    @CurrentUser() user: User,
  ): Promise<Vocal> {
    return await this.vocalsService.update(id, updateVocalDto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SINGER)
  async remove(@Param('id') id: string, @CurrentUser() user: User): Promise<{ message: string }> {
    await this.vocalsService.remove(id, user.id);
    return { message: 'Vocal deleted successfully' };
  }
}