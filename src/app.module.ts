import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './orm-config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: () => TypeOrmConfig }),
    UserModule,
    AuthModule,
    OtpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
