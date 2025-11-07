import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Create a user profile if it doesn't exist
  @Post()
  @UseGuards(FirebaseAuthGuard)
  async create(
    @Req() req: Request & { user: { uid: string; email?: string; name?: string } },
    @Body() body: { name?: string }
  ) {
    const uid = req.user.uid;
    const name = body.name || req.user.name;
    const email = req.user.email;

    return this.userService.createIfNotExists(uid, email, name);
  }

  // List all users
  @Get()
  async list() {
    return this.userService.list();
  }
}
