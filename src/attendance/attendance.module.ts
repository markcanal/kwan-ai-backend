import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [AttendanceService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
