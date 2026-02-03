import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FirebaseAuthGuard } from './auth.guard';
import { UserService } from '../user/user.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @Post('sync')
  @ApiOperation({ 
    summary: 'Sync user from Firebase',
    description: 'Synchronizes user data from Firebase authentication to the local database. Creates user if not exists.'
  })
  @ApiResponse({
    status: 201,
    description: 'User synced successfully',
    schema: {
      example: {
        id: 1,
        firebaseUid: 'firebase_abc123',
        email: 'juan.delacruz@example.com',
        name: 'Juan Dela Cruz',
        avatarUrl: null,
        role: 'user',
        createdAt: '2024-02-03T10:00:00.000Z',
        hireDate: '2024-02-03T10:00:00.000Z',
        baseSalary: 0,
        yearlyBonus: 0,
        clientCount: 1,
        clientBonus: 0,
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing Firebase token',
  })
  async syncUser(@Req() req) {
    const { uid, email, name } = req.user;
    return this.userService.createIfNotExists(uid, email, name);
  }
}
