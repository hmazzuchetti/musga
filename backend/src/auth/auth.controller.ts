import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, AuthResponse } from '@musga/shared';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../database/entities/user.entity';

export type UserResponse = Omit<
  User,
  'password' | 'hashPassword' | 'validatePassword'
>;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
    return this.authService.register(createUserDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User): Promise<UserResponse> {
    // Remove password and methods from response
    const { password, hashPassword, validatePassword, ...userWithoutPassword } =
      user;
    return userWithoutPassword as UserResponse;
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyToken(
    @CurrentUser() user: User,
  ): Promise<{ valid: boolean; user: UserResponse }> {
    const { password, hashPassword, validatePassword, ...userWithoutPassword } =
      user;
    return {
      valid: true,
      user: userWithoutPassword as UserResponse,
    };
  }
}
