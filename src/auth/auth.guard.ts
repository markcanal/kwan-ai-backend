import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const decoded = await this.auth.verifyIdToken(token);
      if (!decoded.uid) {
        throw new UnauthorizedException('Invalid token format');
      }
      request['user'] = decoded;
      return true;
    } catch (err) {
      if (err.code === 'auth/id-token-expired') {
        throw new UnauthorizedException('Token expired');
      }
      if (err.code === 'auth/argument-error') {
        throw new UnauthorizedException('Invalid token format');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
