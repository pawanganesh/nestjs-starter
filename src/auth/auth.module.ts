import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from 'src/user/repositories/user.repository';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [],
  providers: [AuthService, UserRepository],
  controllers: [AuthController],
})
export class AuthModule {}
