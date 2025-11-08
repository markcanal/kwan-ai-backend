import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from './auth.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('sync')
  async syncUser(@Req() req) {
    const { uid, email, name } = req.user;
    return this.userService.createIfNotExists(uid, email, name);
  }
}
