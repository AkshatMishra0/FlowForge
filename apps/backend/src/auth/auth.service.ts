import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RateLimiterService } from './rate-limiter.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto, SignInDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private rateLimiter: RateLimiterService
  ) {}

  async signUp(dto: SignUpDto) {
    this.logger.log(`Attempting user registration for email: ${dto.email}`);
    
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: User already exists with email ${dto.email}`);
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = this.generateToken(user.id, user.email);

    this.logger.log(`User registered successfully: ${user.email}`);

    return {
      user,
      token,
    };
  }

  async signIn(dto: SignInDto) {
    this.logger.log(`Sign-in attempt for email: ${dto.email}`);
    
    // Check if account is blocked due to too many failed attempts
    const isBlocked = await this.rateLimiter.isBlocked(dto.email);
    if (isBlocked) {
      const timeRemaining = await this.rateLimiter.getBlockTimeRemaining(dto.email);
      this.logger.warn(`Sign-in blocked for ${dto.email}. Time remaining: ${timeRemaining}s`);
      throw new UnauthorizedException(
        `Too many failed login attempts. Please try again in ${Math.ceil(timeRemaining / 60)} minutes.`
      );
    }
    
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      this.logger.warn(`Sign-in failed: Invalid credentials for ${dto.email}`);
      await this.rateLimiter.recordFailedAttempt(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Sign-in failed: Invalid password for ${dto.email}`);
      await this.rateLimiter.recordFailedAttempt(dto.email);
      
      const remaining = await this.rateLimiter.getRemainingAttempts(dto.email);
      const message = remaining > 0 
        ? `Invalid credentials. ${remaining} attempts remaining.`
        : 'Account temporarily locked due to too many failed attempts.';
      
      throw new UnauthorizedException(message);
    }

    // Clear failed attempts on successful login
    await this.rateLimiter.clearAttempts(dto.email);

    // Generate token
    const token = this.generateToken(user.id, user.email);

    this.logger.log(`User signed in successfully: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async googleAuth(profile: any) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: profile.email },
          { providerId: profile.id, provider: 'google' },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.displayName,
          image: profile.picture,
          provider: 'google',
          providerId: profile.id,
          emailVerified: new Date(),
        },
      });
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        businesses: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async getUserBusinesses(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        businesses: {
          select: {
            id: true,
            name: true,
            plan: true,
            createdAt: true,
            _count: {
              select: { leads: true, invoices: true, bookings: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.logger.log(`Fetched businesses for user ${userId}: ${user.businesses.length} found`);
    return user.businesses;
  }
}
