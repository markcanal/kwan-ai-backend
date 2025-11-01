import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createIfNotExists(firebaseUid: string, email?: string, name?: string) {
    const found = await this.prisma.user.findUnique({ where: { firebaseUid } });
    if (found) return found;
    return this.prisma.user.create({
      data: { firebaseUid, email, name },
    });
  }

  async list() {
    return this.prisma.user.findMany();
  }
}
