import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Controller('api')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('status')
  getStatus() {
    return { ok: true, status: 'online' };
  }

  @Get('health')
  async getHealth() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: 'healthy',
          api: 'healthy'
        }
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: {
          database: 'unhealthy',
          api: 'healthy'
        },
        error: error.message
      };
    }
  }
}
