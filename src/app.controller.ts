import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from './database/prisma.service';

@ApiTags('Health')
@Controller('api')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('status')
  @ApiOperation({ 
    summary: 'API status',
    description: 'Check if API is online'
  })
  @ApiResponse({
    status: 200,
    description: 'API is online',
    schema: {
      example: { ok: true, status: 'online' }
    }
  })
  getStatus() {
    return { ok: true, status: 'online' };
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Check API and database health status'
  })
  @ApiResponse({
    status: 200,
    description: 'System is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-02-03T10:00:00.000Z',
        services: {
          database: 'healthy',
          api: 'healthy'
        }
      }
    }
  })
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
