import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  TraditionalUserLoginDto,
  TraditionalUserRegisterDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() payload: TraditionalUserRegisterDto) {
    return this.authService.createUser(payload);
  }

  @Post('login')
  loginUser(@Body() payload: TraditionalUserLoginDto) {
    return this.authService.loginUser(payload);
  }
}
