import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  RefreshAccessTokenDto,
  RequestVerificationDto,
  TraditionalUserLoginDto,
  TraditionalUserRegisterDto,
  VerificationDto,
} from './dto/auth.dto';
import { UserRepository } from '../user/repositories/user.repository';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from 'src/constant';
import { IJWTPayload, TokenType } from './interfaces/auth.interface';
import { DataSource } from 'typeorm';
import { OTP } from '../otp/entities/otp.entity';
import { generateOTP } from '../helpers/otp-generator';
import { OTPType } from '../otp/enums/otp.enum';
import { sendMail } from '../helpers/mail';
import { OtpService } from 'src/otp/otp.service';
import { Printer } from 'src/helpers/printer';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly otpService: OtpService,
  ) {}

  async #generateTokens(user_id: string): Promise<{ access_token: string; refresh_token: string }> {
    const access_token_payload: IJWTPayload = { sub: user_id, type: TokenType.ACCESS_TOKEN };
    const refresh_token_payload: IJWTPayload = { sub: user_id, type: TokenType.REFRESH_TOKEN };

    const access_token = this.jwtService.sign(access_token_payload, { expiresIn: '15m', secret: JWT_ACCESS_SECRET });
    const refresh_token = this.jwtService.sign(refresh_token_payload, { expiresIn: '7d', secret: JWT_REFRESH_SECRET });

    return { access_token, refresh_token };
  }

  async #generateAccessTokenFromRefreshToken(
    refresh_token: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    let result: IJWTPayload;
    try {
      result = this.jwtService.verify(refresh_token, { secret: JWT_REFRESH_SECRET });
    } catch (error) {
      throw new UnauthorizedException();
    }

    if (result.type !== TokenType.REFRESH_TOKEN) throw new UnauthorizedException();

    const user_row = await this.userRepository.findOne({ where: { id: result.sub } });
    if (!user_row) throw new UnauthorizedException();

    const access_token_payload: IJWTPayload = { sub: user_row.id, type: TokenType.ACCESS_TOKEN };
    const access_token = this.jwtService.sign(access_token_payload, { expiresIn: '15m', secret: JWT_ACCESS_SECRET });

    return { access_token, refresh_token };
  }

  async createUser(payload: TraditionalUserRegisterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user_row = await queryRunner.manager
        .getRepository(User)
        .findOne({ where: { email: payload.email.toLowerCase() } });
      if (user_row) throw new BadRequestException({ success: false, message: 'Email already exists.' });

      const user = new User();
      user.full_name = payload.full_name;
      user.email = payload.email.toLowerCase();
      user.password = payload.password;

      await queryRunner.manager.getRepository(User).save(user);

      const code = generateOTP(6);
      await queryRunner.manager
        .getRepository(OTP)
        .save({ code, user_id: user.id, otp_type: OTPType.EMAIL_VERIFICATION });

      const text = `
      Hello ${user.full_name},

      Please verify your email by entering the following code:
      ${code}

      Note: This code will expire in 15 minutes.

      Thank you,
      The NestJS Starter Team
      `;

      sendMail({ to: user.email, subject: 'Email Verification', text });

      await queryRunner.commitTransaction();

      return { success: true, message: 'User created.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException({ success: false, message: error.message });
    } finally {
      await queryRunner.release();
    }
  }

  async loginUser(payload: TraditionalUserLoginDto) {
    const user_row = await this.userRepository.findOne({
      where: { email: payload.email.toLowerCase() },
      select: { id: true, password: true, verified: true },
    });

    if (!user_row) throw new BadRequestException({ success: false, verified: null, message: 'Invalid credentials.' });

    const isPasswordValid: boolean = await user_row.comparePassword(payload.password);

    if (!isPasswordValid)
      throw new BadRequestException({ success: false, verified: null, message: 'Invalid credentials.' });

    if (!user_row.verified)
      throw new BadRequestException({ success: false, verified: false, message: 'User not verified.' });

    const { access_token, refresh_token } = await this.#generateTokens(user_row.id);

    return { success: true, verified: true, message: 'Login success.', access_token, refresh_token };
  }

  async refreshAccessToken(payload: RefreshAccessTokenDto) {
    const { access_token, refresh_token } = await this.#generateAccessTokenFromRefreshToken(payload.refresh_token);
    return { success: true, access_token, refresh_token };
  }

  async verification(payload: VerificationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user_row = await queryRunner.manager
        .getRepository(User)
        .findOne({ where: { email: payload.email.toLowerCase() } });

      if (!user_row) throw new BadRequestException({ success: false, message: 'User not found.' });

      if (user_row.verified) throw new BadRequestException({ success: false, message: 'User already verified.' });

      const isOTPValid = await this.otpService.validateOTP(user_row.id, payload.code, OTPType.EMAIL_VERIFICATION);

      if (!isOTPValid) throw new BadRequestException({ success: false, message: 'Invalid OTP.' });

      await queryRunner.manager.getRepository(User).update({ id: user_row.id }, { verified: true });
      await queryRunner.manager
        .getRepository(OTP)
        .delete({ user_id: user_row.id, otp_type: OTPType.EMAIL_VERIFICATION });

      await queryRunner.commitTransaction();
      return { success: true, message: 'User verified.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async requestVerification(payload: RequestVerificationDto) {
    const user_row = await this.userRepository.findOne({ where: { email: payload.email.toLowerCase() } });
    if (!user_row) throw new BadRequestException({ success: false, message: 'User not found.' });
    if (user_row.verified) throw new BadRequestException({ success: false, message: 'User already verified.' });

    const previous_otp_row = await this.otpService.findLastOTP(user_row.id, OTPType.EMAIL_VERIFICATION);
    if (previous_otp_row) {
      const waitTime = 1000 * 60 * 1; // 1 minute
      const completedWaitTime = previous_otp_row.created_at.getTime() + waitTime < Date.now();

      if (!completedWaitTime) {
        const remainingTime = Math.ceil((previous_otp_row.created_at.getTime() + waitTime - Date.now()) / 1000);
        throw new BadRequestException({
          success: false,
          message: `Please wait ${remainingTime} seconds before requesting another OTP.`,
        });
      }

      const otp_row = await this.otpService.createOTP(user_row.id, OTPType.EMAIL_VERIFICATION);
      const text = `
      Hello ${user_row.full_name},

      Please verify your email by entering the following code:
      ${otp_row.code}

      Note: This code will expire in 15 minutes.

      Thank you,
      The NestJS Starter Team
      `;

      sendMail({ to: user_row.email, subject: 'Email Verification', text });

      return { success: true, message: 'OTP sent.' };
    }
  }

  async logoutUser(payload: RefreshAccessTokenDto) {}
}
