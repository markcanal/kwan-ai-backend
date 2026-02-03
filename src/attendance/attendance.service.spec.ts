import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../database/prisma.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    attendance: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('timeIn', () => {
    it('should successfully clock in when no previous clock-in exists', async () => {
      const userId = 1;
      const note = 'Starting work';
      const mockAttendance = { id: 1, userId, type: 'in', note, timestamp: new Date() };

      mockPrismaService.attendance.findFirst.mockResolvedValue(null);
      mockPrismaService.attendance.create.mockResolvedValue(mockAttendance);

      const result = await service.timeIn(userId, note);

      expect(result).toEqual(mockAttendance);
      expect(mockPrismaService.attendance.findFirst).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });
      expect(mockPrismaService.attendance.create).toHaveBeenCalledWith({
        data: { userId, type: 'in', note },
      });
    });

    it('should successfully clock in when last record was clock-out', async () => {
      const userId = 1;
      const mockLastRecord = { id: 1, userId, type: 'out', timestamp: new Date() };
      const mockNewAttendance = { id: 2, userId, type: 'in', timestamp: new Date() };

      mockPrismaService.attendance.findFirst.mockResolvedValue(mockLastRecord);
      mockPrismaService.attendance.create.mockResolvedValue(mockNewAttendance);

      const result = await service.timeIn(userId);

      expect(result).toEqual(mockNewAttendance);
      expect(mockPrismaService.attendance.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when user is already clocked in', async () => {
      const userId = 1;
      const mockLastRecord = { id: 1, userId, type: 'in', timestamp: new Date() };

      mockPrismaService.attendance.findFirst.mockResolvedValue(mockLastRecord);

      await expect(service.timeIn(userId)).rejects.toThrow(BadRequestException);
      await expect(service.timeIn(userId)).rejects.toThrow(
        'User already clocked in. Please clock out first.'
      );
      expect(mockPrismaService.attendance.create).not.toHaveBeenCalled();
    });
  });

  describe('timeOut', () => {
    it('should successfully clock out when user is clocked in', async () => {
      const userId = 1;
      const note = 'Ending work';
      const mockLastRecord = { id: 1, userId, type: 'in', timestamp: new Date() };
      const mockAttendance = { id: 2, userId, type: 'out', note, timestamp: new Date() };

      mockPrismaService.attendance.findFirst.mockResolvedValue(mockLastRecord);
      mockPrismaService.attendance.create.mockResolvedValue(mockAttendance);

      const result = await service.timeOut(userId, note);

      expect(result).toEqual(mockAttendance);
      expect(mockPrismaService.attendance.findFirst).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });
      expect(mockPrismaService.attendance.create).toHaveBeenCalledWith({
        data: { userId, type: 'out', note },
      });
    });

    it('should throw BadRequestException when no clock-in record exists', async () => {
      const userId = 1;

      mockPrismaService.attendance.findFirst.mockResolvedValue(null);

      await expect(service.timeOut(userId)).rejects.toThrow(BadRequestException);
      await expect(service.timeOut(userId)).rejects.toThrow(
        'Cannot clock out without clocking in first.'
      );
      expect(mockPrismaService.attendance.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when last record is clock-out', async () => {
      const userId = 1;
      const mockLastRecord = { id: 1, userId, type: 'out', timestamp: new Date() };

      mockPrismaService.attendance.findFirst.mockResolvedValue(mockLastRecord);

      await expect(service.timeOut(userId)).rejects.toThrow(BadRequestException);
      await expect(service.timeOut(userId)).rejects.toThrow(
        'Cannot clock out without clocking in first.'
      );
      expect(mockPrismaService.attendance.create).not.toHaveBeenCalled();
    });
  });

  describe('computeHoursForDay', () => {
    it('should calculate hours correctly with paired in/out records', async () => {
      const userId = 1;
      const date = new Date('2024-02-03');
      
      // Mock attendance records: 8 hours (9 AM to 5 PM)
      const inTime = new Date('2024-02-03T09:00:00');
      const outTime = new Date('2024-02-03T17:00:00');
      
      const mockRecords = [
        { id: 1, userId, type: 'in', timestamp: inTime },
        { id: 2, userId, type: 'out', timestamp: outTime },
      ];

      mockPrismaService.attendance.findMany.mockResolvedValue(mockRecords);

      const result = await service.computeHoursForDay(userId, date);

      expect(result.hours).toBe(8);
      expect(mockPrismaService.attendance.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
            lt: expect.any(Date),
          }),
        },
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should return zero hours when no records exist', async () => {
      const userId = 1;
      const date = new Date('2024-02-03');

      mockPrismaService.attendance.findMany.mockResolvedValue([]);

      const result = await service.computeHoursForDay(userId, date);

      expect(result.hours).toBe(0);
    });

    it('should handle multiple in/out pairs correctly', async () => {
      const userId = 1;
      const date = new Date('2024-02-03');
      
      // Two sessions: 4 hours + 3 hours = 7 hours
      const mockRecords = [
        { id: 1, userId, type: 'in', timestamp: new Date('2024-02-03T09:00:00') },
        { id: 2, userId, type: 'out', timestamp: new Date('2024-02-03T13:00:00') },
        { id: 3, userId, type: 'in', timestamp: new Date('2024-02-03T14:00:00') },
        { id: 4, userId, type: 'out', timestamp: new Date('2024-02-03T17:00:00') },
      ];

      mockPrismaService.attendance.findMany.mockResolvedValue(mockRecords);

      const result = await service.computeHoursForDay(userId, date);

      expect(result.hours).toBe(7);
    });

    it('should handle odd number of records gracefully', async () => {
      const userId = 1;
      const date = new Date('2024-02-03');
      
      // Only clock-in, no clock-out
      const mockRecords = [
        { id: 1, userId, type: 'in', timestamp: new Date('2024-02-03T09:00:00') },
      ];

      mockPrismaService.attendance.findMany.mockResolvedValue(mockRecords);

      const result = await service.computeHoursForDay(userId, date);

      expect(result.hours).toBe(0);
    });
  });
});
