import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';

@Module({
  providers: [OtpService]
})
export class OtpModule {}
