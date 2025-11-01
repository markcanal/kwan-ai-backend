import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class AuthService {
  constructor(private firebase: FirebaseService) {}

  async verifyIdToken(token: string) {
    try {
      const decoded = await this.firebase.auth.verifyIdToken(token);
      return decoded;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
