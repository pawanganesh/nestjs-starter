import { BadRequestException, Injectable } from '@nestjs/common';
import { TraditionalUserLoginDto, TraditionalUserRegisterDto } from './dto/auth.dto';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async #generateTokens(user_id: string): Promise<{ access_token: string; refresh_token: string }> {
    const access_token_payload: IJWTPayload = { sub: user_id, type: TokenType.ACCESS_TOKEN };
    const refresh_token_payload: IJWTPayload = { sub: user_id, type: TokenType.REFRESH_TOKEN };

    const access_token = this.jwtService.sign(access_token_payload, { expiresIn: '15m', secret: JWT_ACCESS_SECRET });
    const refresh_token = this.jwtService.sign(refresh_token_payload, { expiresIn: '7d', secret: JWT_REFRESH_SECRET });

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
      throw new BadRequestException({ success: false, message: 'Failed to create user.' });
    } finally {
      await queryRunner.release();
    }
  }

  async loginUser(payload: TraditionalUserLoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: payload.email.toLowerCase() },
      select: { id: true, password: true },
    });

    if (!user) throw new BadRequestException({ success: false, message: 'Invalid credentials.' });

    const isPasswordValid: boolean = await user.comparePassword(payload.password);

    if (!isPasswordValid) throw new BadRequestException({ success: false, message: 'Invalid credentials.' });

    const { access_token, refresh_token } = await this.#generateTokens(user.id);

    return { success: true, message: 'Login success.', access_token, refresh_token };
  }
}
