import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createIfNotExists', () => {
    it('should return existing user if found', async () => {
      const firebaseUid = 'firebase123';
      const existingUser = {
        id: 1,
        firebaseUid,
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
        role: 'user',
        createdAt: new Date(),
        hireDate: new Date(),
        baseSalary: 0,
        yearlyBonus: 0,
        clientCount: 1,
        clientBonus: 0,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      const result = await service.createIfNotExists(firebaseUid, 'test@example.com', 'Test User');

      expect(result).toEqual(existingUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid },
      });
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should create new user if not found', async () => {
      const firebaseUid = 'firebase456';
      const email = 'newuser@example.com';
      const name = 'New User';
      const newUser = {
        id: 2,
        firebaseUid,
        email,
        name,
        avatarUrl: null,
        role: 'user',
        createdAt: new Date(),
        hireDate: new Date(),
        baseSalary: 0,
        yearlyBonus: 0,
        clientCount: 1,
        clientBonus: 0,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(newUser);

      const result = await service.createIfNotExists(firebaseUid, email, name);

      expect(result).toEqual(newUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { firebaseUid, email, name },
      });
    });

    it('should create user with minimal data (no email, no name)', async () => {
      const firebaseUid = 'firebase789';
      const newUser = {
        id: 3,
        firebaseUid,
        email: null,
        name: null,
        avatarUrl: null,
        role: 'user',
        createdAt: new Date(),
        hireDate: new Date(),
        baseSalary: 0,
        yearlyBonus: 0,
        clientCount: 1,
        clientBonus: 0,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(newUser);

      const result = await service.createIfNotExists(firebaseUid);

      expect(result).toEqual(newUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { firebaseUid, email: undefined, name: undefined },
      });
    });
  });

  describe('getUserByFirebaseUid', () => {
    it('should return user when found', async () => {
      const firebaseUid = 'firebase123';
      const user = {
        id: 1,
        firebaseUid,
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
        role: 'user',
        createdAt: new Date(),
        hireDate: new Date(),
        baseSalary: 0,
        yearlyBonus: 0,
        clientCount: 1,
        clientBonus: 0,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserByFirebaseUid(firebaseUid);

      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid },
      });
    });

    it('should return null when user not found', async () => {
      const firebaseUid = 'nonexistent';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserByFirebaseUid(firebaseUid);

      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid },
      });
    });
  });

  describe('list', () => {
    it('should return all users', async () => {
      const users = [
        {
          id: 1,
          firebaseUid: 'firebase1',
          email: 'user1@example.com',
          name: 'User 1',
          avatarUrl: null,
          role: 'user',
          createdAt: new Date(),
          hireDate: new Date(),
          baseSalary: 0,
          yearlyBonus: 0,
          clientCount: 1,
          clientBonus: 0,
        },
        {
          id: 2,
          firebaseUid: 'firebase2',
          email: 'user2@example.com',
          name: 'User 2',
          avatarUrl: null,
          role: 'admin',
          createdAt: new Date(),
          hireDate: new Date(),
          baseSalary: 0,
          yearlyBonus: 0,
          clientCount: 1,
          clientBonus: 0,
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.list();

      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.list();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });
  });
});
