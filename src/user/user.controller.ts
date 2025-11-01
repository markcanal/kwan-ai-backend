import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // frontend signs in with Firebase and sends ID token to backend to create profile
  @Post()
  @UseGuards(FirebaseAuthGuard)
  async create(@Req() req, @Body() body: { name?: string }) {
    const uid = req.user.uid;
    return this.userService.createIfNotExists(uid, req.user.email, body.name || req.user.name);
  }

  @Get()
  async list() {
    return this.userService.list();
  }
}
