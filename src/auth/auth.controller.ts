import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RefreshAccessTokenDto,
  RequestVerificationDto,
  TraditionalUserLoginDto,
  TraditionalUserRegisterDto,
  VerificationDto,
} from './dto/auth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/@guards/jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() payload: TraditionalUserRegisterDto) {
    return this.authService.createUser(payload);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  loginUser(@Body() payload: TraditionalUserLoginDto) {
    return this.authService.loginUser(payload);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshAccessToken(@Body() payload: RefreshAccessTokenDto) {
    return this.authService.refreshAccessToken(payload);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logoutUser(@Body() payload: RefreshAccessTokenDto) {
    return this.authService.logoutUser(payload);
  }

  @Post('verification')
  @HttpCode(HttpStatus.OK)
  verification(@Body() payload: VerificationDto) {
    return this.authService.verification(payload);
  }

  @Post('request-verification')
  @HttpCode(HttpStatus.OK)
  requestVerification(@Body() payload: RequestVerificationDto) {
    return this.authService.requestVerification(payload);
  }
}
