import { Injectable } from '@nestjs/common';
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
    return this.prisma.business.update({
      where: { id },
      data: dto,
    });
  }

  async getBusinessById(id: string) {
    return this.prisma.business.findUnique({
      where: { id },
    });
  }

  async getUserBusinesses(userId: string) {
    return this.prisma.business.findMany({
      where: { ownerId: userId },
    });
  }
}
