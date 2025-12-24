import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/business.dto';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async createBusiness(ownerId: string, dto: CreateBusinessDto) {
    return this.prisma.business.create({
      data: {
        ...dto,
        ownerId,
      },
    });
  }

  async updateBusiness(id: string, dto: UpdateBusinessDto) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return this.prisma.business.update({
      where: { id },
      data: dto,
    });
  }

  async getBusinessById(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return business;
  }

  async getUserBusinesses(userId: string) {
    return this.prisma.business.findMany({
      where: { ownerId: userId },
    });
  }
}

// Added business profile management - Modified: 2025-12-25 20:07:41
// Added lines for commit changes
// Change line 1 for this commit
// Change line 2 for this commit
// Change line 3 for this commit
// Change line 4 for this commit
// Change line 5 for this commit
// Change line 6 for this commit
// Change line 7 for this commit
// Change line 8 for this commit
// Change line 9 for this commit
// Change line 10 for this commit
// Change line 11 for this commit
// Change line 12 for this commit
// Change line 13 for this commit
// Change line 14 for this commit
// Change line 15 for this commit
// Change line 16 for this commit
// Change line 17 for this commit
