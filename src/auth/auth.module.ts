import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';

@Module({
  providers: [FirebaseService, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
