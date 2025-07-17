import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Vocal } from '../database/entities/vocal.entity';
import { User } from '../database/entities/user.entity';
import { CreateVocalDto, UpdateVocalDto, VocalSearchFilters, PaginatedResponse, UserRole } from '@musga/shared';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

@Injectable()
export class VocalsService {
  constructor(
    @InjectRepository(Vocal)
    private vocalRepository: Repository<Vocal>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createVocalDto: CreateVocalDto, file: Express.Multer.File, userId: string): Promise<Vocal> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.SINGER) {
      throw new ForbiddenException('Only singers can upload vocals');
    }

    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    // Get audio duration using FFmpeg
    const duration = await this.getAudioDuration(file.path);
    
    // Generate preview (first 30 seconds)
    const previewPath = await this.generatePreview(file.path, file.filename);

    const vocal = this.vocalRepository.create({
      ...createVocalDto,
      singerId: userId,
      filePath: file.path,
      previewPath,
      fileSize: file.size,
      duration,
    });

    return await this.vocalRepository.save(vocal);
  }

  async findAll(filters: VocalSearchFilters, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Vocal>> {
    const query = this.vocalRepository.createQueryBuilder('vocal')
      .leftJoinAndSelect('vocal.singer', 'singer')
      .where('vocal.isActive = :isActive', { isActive: true })
      .andWhere('vocal.isSold = :isSold', { isSold: false });

    // Apply filters
    if (filters.genre) {
      query.andWhere('vocal.genre = :genre', { genre: filters.genre });
    }

    if (filters.minPrice !== undefined) {
      query.andWhere('vocal.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice !== undefined) {
      query.andWhere('vocal.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.minBpm !== undefined) {
      query.andWhere('vocal.bpm >= :minBpm', { minBpm: filters.minBpm });
    }

    if (filters.maxBpm !== undefined) {
      query.andWhere('vocal.bpm <= :maxBpm', { maxBpm: filters.maxBpm });
    }

    if (filters.key) {
      query.andWhere('vocal.key = :key', { key: filters.key });
    }

    if (filters.licensingType) {
      query.andWhere('vocal.licensingType = :licensingType', { licensingType: filters.licensingType });
    }

    if (filters.search) {
      query.andWhere(
        '(vocal.title ILIKE :search OR vocal.description ILIKE :search OR singer.firstName ILIKE :search OR singer.lastName ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Pagination
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    // Order by creation date (newest first)
    query.orderBy('vocal.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Vocal> {
    const vocal = await this.vocalRepository.findOne({
      where: { id, isActive: true },
      relations: ['singer'],
    });

    if (!vocal) {
      throw new NotFoundException('Vocal not found');
    }

    // Increment view count
    await this.vocalRepository.update(id, { viewCount: vocal.viewCount + 1 });

    return vocal;
  }

  async findBySinger(singerId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Vocal>> {
    const offset = (page - 1) * limit;
    
    const [data, total] = await this.vocalRepository.findAndCount({
      where: { singerId, isActive: true },
      relations: ['singer'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updateVocalDto: UpdateVocalDto, userId: string): Promise<Vocal> {
    const vocal = await this.vocalRepository.findOne({ where: { id } });

    if (!vocal) {
      throw new NotFoundException('Vocal not found');
    }

    if (vocal.singerId !== userId) {
      throw new ForbiddenException('You can only update your own vocals');
    }

    if (vocal.isSold) {
      throw new BadRequestException('Cannot update sold vocals');
    }

    await this.vocalRepository.update(id, updateVocalDto);
    return await this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const vocal = await this.vocalRepository.findOne({ where: { id } });

    if (!vocal) {
      throw new NotFoundException('Vocal not found');
    }

    if (vocal.singerId !== userId) {
      throw new ForbiddenException('You can only delete your own vocals');
    }

    if (vocal.isSold) {
      throw new BadRequestException('Cannot delete sold vocals');
    }

    // Soft delete by setting isActive to false
    await this.vocalRepository.update(id, { isActive: false });

    // Optionally delete files
    try {
      if (fs.existsSync(vocal.filePath)) {
        fs.unlinkSync(vocal.filePath);
      }
      if (fs.existsSync(vocal.previewPath)) {
        fs.unlinkSync(vocal.previewPath);
      }
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  }

  private async getAudioDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'csv=p=0',
        filePath
      ]);

      let duration = '';
      ffprobe.stdout.on('data', (data) => {
        duration += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          resolve(Math.round(parseFloat(duration.trim())));
        } else {
          reject(new Error('Failed to get audio duration'));
        }
      });

      ffprobe.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async generatePreview(filePath: string, originalFilename: string): Promise<string> {
    const previewDir = path.join(path.dirname(filePath), 'previews');
    
    // Create previews directory if it doesn't exist
    if (!fs.existsSync(previewDir)) {
      fs.mkdirSync(previewDir, { recursive: true });
    }

    const previewFilename = `preview-${originalFilename}`;
    const previewPath = path.join(previewDir, previewFilename);

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', filePath,
        '-t', '30', // 30 seconds
        '-acodec', 'mp3',
        '-ab', '128k',
        '-ar', '44100',
        '-y', // overwrite output file
        previewPath
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(previewPath);
        } else {
          reject(new Error('Failed to generate preview'));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }
}