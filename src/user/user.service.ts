import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createIfNotExists(
    firebaseUid: string,
    email?: string,
    name?: string
  ): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (existingUser) return existingUser;

    return this.prisma.user.create({
      data: { firebaseUid, email, name },
    });
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  async list(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
