import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './orm-config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRootAsync({ useFactory: () => TypeOrmConfig }), UserModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
