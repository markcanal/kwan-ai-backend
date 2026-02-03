import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let authService: AuthService;

  const mockAuthService = {
    verifyIdToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
    authService = module.get<AuthService>(AuthService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  const createMockExecutionContext = (authorizationHeader?: string): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authorizationHeader,
      },
    };
    
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should return true for valid token', async () => {
      const token = 'valid-token';
      const decodedToken = {
        uid: 'user123',
        email: 'test@example.com',
      };

      mockAuthService.verifyIdToken.mockResolvedValue(decodedToken);

      const context = createMockExecutionContext(`Bearer ${token}`);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockAuthService.verifyIdToken).toHaveBeenCalledWith(token);
      
      const request = context.switchToHttp().getRequest();
      expect(request['user']).toEqual(decodedToken);
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Missing authorization token');
      expect(mockAuthService.verifyIdToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is missing', async () => {
      const context = createMockExecutionContext('Bearer ');

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Missing authorization token');
      expect(mockAuthService.verifyIdToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization type is not Bearer', async () => {
      const context = createMockExecutionContext('Basic token123');

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Missing authorization token');
      expect(mockAuthService.verifyIdToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      const token = 'expired-token';
      const error = new Error('Token expired');
      (error as any).code = 'auth/id-token-expired';

      mockAuthService.verifyIdToken.mockRejectedValue(error);

      const context = createMockExecutionContext(`Bearer ${token}`);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Token expired');
      expect(mockAuthService.verifyIdToken).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException for invalid token format (argument error)', async () => {
      const token = 'invalid-format-token';
      const error = new Error('Invalid argument');
      (error as any).code = 'auth/argument-error';

      mockAuthService.verifyIdToken.mockRejectedValue(error);

      const context = createMockExecutionContext(`Bearer ${token}`);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token format');
      expect(mockAuthService.verifyIdToken).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException for generic token errors', async () => {
      const token = 'invalid-token';
      const error = new Error('Some other error');

      mockAuthService.verifyIdToken.mockRejectedValue(error);

      const context = createMockExecutionContext(`Bearer ${token}`);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');
      expect(mockAuthService.verifyIdToken).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException when decoded token has no uid', async () => {
      const token = 'token-without-uid';
      const decodedToken = {
        email: 'test@example.com',
        // uid is missing
      };

      mockAuthService.verifyIdToken.mockResolvedValue(decodedToken);

      const context = createMockExecutionContext(`Bearer ${token}`);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token format');
      expect(mockAuthService.verifyIdToken).toHaveBeenCalledWith(token);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', async () => {
      const token = 'valid-token-123';
      const decodedToken = { uid: 'user123' };

      mockAuthService.verifyIdToken.mockResolvedValue(decodedToken);

      const context = createMockExecutionContext(`Bearer ${token}`);
      await guard.canActivate(context);

      expect(mockAuthService.verifyIdToken).toHaveBeenCalledWith(token);
    });

    it('should return undefined for malformed header', async () => {
      const context = createMockExecutionContext('MalformedHeader');

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.verifyIdToken).not.toHaveBeenCalled();
    });
  });
});
