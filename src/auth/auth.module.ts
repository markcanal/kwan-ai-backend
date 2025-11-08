import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './auth.guard';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';

@Module({
  providers: [FirebaseService, AuthService, FirebaseAuthGuard, UserService],
  exports: [AuthService, FirebaseService, FirebaseAuthGuard],
  controllers: [AuthController],

})
export class AuthModule {}
