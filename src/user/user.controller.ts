import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Create a user profile if it doesn't exist
  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create user profile',
    description: 'Creates a user profile linked to Firebase UID. If user already exists, returns existing profile.'
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User information (optional fields will use Firebase token data)',
  })
  @ApiResponse({
    status: 201,
    description: 'User profile created or retrieved successfully',
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
  async create(
    @Req() req: Request & { user: { uid: string; email?: string; name?: string } },
    @Body() body: CreateUserDto
  ) {
    const uid = req.user.uid;
    const name = body.name || req.user.name;
    const email = body.email || req.user.email;

    return this.userService.createIfNotExists(uid, email, name);
  }

  // List all users
  @Get()
  @ApiOperation({ 
    summary: 'List all users',
    description: 'Retrieves a list of all registered users'
  })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: {
      example: [
        {
          id: 1,
          firebaseUid: 'firebase_abc123',
          email: 'juan.delacruz@example.com',
          name: 'Juan Dela Cruz',
          avatarUrl: null,
          role: 'user',
          createdAt: '2024-02-03T10:00:00.000Z',
          hireDate: '2024-02-03T10:00:00.000Z',
          baseSalary: 30000,
          yearlyBonus: 12000,
          clientCount: 1,
          clientBonus: 0,
        }
      ]
    }
  })
  async list() {
    return this.userService.list();
  }
}
