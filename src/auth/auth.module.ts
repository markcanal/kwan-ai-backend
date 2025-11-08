import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './auth.guard';
import { AuthController } from './auth.controller';

@Module({
  providers: [FirebaseService, AuthService, FirebaseAuthGuard],
  exports: [AuthService, FirebaseService, FirebaseAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
