import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './auth.guard';

@Module({
  providers: [FirebaseService, AuthService, FirebaseAuthGuard],
  exports: [AuthService, FirebaseService, FirebaseAuthGuard],
})
export class AuthModule {}
