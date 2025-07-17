import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Vocal } from '../entities/vocal.entity';
import { UserRole, Genre, LicensingType } from '@musga/shared';

export async function seedInitialData(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const vocalRepository = dataSource.getRepository(Vocal);

  // Create sample users
  const singer1 = userRepository.create({
    email: 'singer1@musga.com',
    username: 'vocalist_pro',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: UserRole.SINGER,
    bio: 'Professional vocalist with 5+ years experience in electronic music',
    isVerified: true,
  });

  const singer2 = userRepository.create({
    email: 'singer2@musga.com',
    username: 'melody_master',
    password: 'password123',
    firstName: 'Alex',
    lastName: 'Thompson',
    role: UserRole.SINGER,
    bio: 'Emerging artist passionate about house and techno vocals',
    isVerified: true,
  });

  const dj1 = userRepository.create({
    email: 'dj1@musga.com',
    username: 'beat_producer',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Davis',
    role: UserRole.DJ,
    bio: 'Electronic music producer specializing in deep house and techno',
    isVerified: true,
  });

  const dj2 = userRepository.create({
    email: 'dj2@musga.com',
    username: 'sound_architect',
    password: 'password123',
    firstName: 'Emma',
    lastName: 'Wilson',
    role: UserRole.DJ,
    bio: 'EDM producer and DJ with releases on major labels',
    isVerified: true,
  });

  await userRepository.save([singer1, singer2, dj1, dj2]);

  // Create sample vocal tracks
  const vocal1 = vocalRepository.create({
    title: 'Deep House Vibes',
    description: 'Smooth and soulful vocals perfect for deep house tracks',
    genre: Genre.DEEP_HOUSE,
    bpm: 120,
    key: 'Am',
    tone: 'Smooth',
    duration: 180,
    price: 15.99,
    licensingType: LicensingType.NON_EXCLUSIVE,
    filePath: '/samples/deep-house-vibes.mp3',
    previewPath: '/samples/deep-house-vibes-preview.mp3',
    fileSize: 5242880,
    singerId: singer1.id,
    isActive: true,
  });

  const vocal2 = vocalRepository.create({
    title: 'Techno Energy',
    description: 'High-energy vocals for peak-time techno tracks',
    genre: Genre.TECHNO,
    bpm: 128,
    key: 'Em',
    tone: 'Energetic',
    duration: 240,
    price: 18.99,
    licensingType: LicensingType.EXCLUSIVE,
    filePath: '/samples/techno-energy.mp3',
    previewPath: '/samples/techno-energy-preview.mp3',
    fileSize: 6291456,
    singerId: singer1.id,
    isActive: true,
  });

  const vocal3 = vocalRepository.create({
    title: 'Trance Euphoria',
    description: 'Uplifting vocals that create euphoric moments',
    genre: Genre.TRANCE,
    bpm: 132,
    key: 'C',
    tone: 'Uplifting',
    duration: 300,
    price: 22.99,
    licensingType: LicensingType.NON_EXCLUSIVE,
    filePath: '/samples/trance-euphoria.mp3',
    previewPath: '/samples/trance-euphoria-preview.mp3',
    fileSize: 7340032,
    singerId: singer2.id,
    isActive: true,
  });

  await vocalRepository.save([vocal1, vocal2, vocal3]);

  console.log('Initial data seeded successfully!');
}