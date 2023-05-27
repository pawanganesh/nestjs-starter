import { BadRequestException, Injectable } from '@nestjs/common';
import { TraditionalUserLoginDto, TraditionalUserRegisterDto } from './dto/auth.dto';
import { UserRepository } from '../user/repositories/user.repository';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from 'src/constant';
import { IJWTPayload, TokenType } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository, private readonly jwtService: JwtService) {}

  async #generateTokens(user_id: string): Promise<{ access_token: string; refresh_token: string }> {
    const access_token_payload: IJWTPayload = { sub: user_id, type: TokenType.ACCESS_TOKEN };
    const refresh_token_payload: IJWTPayload = { sub: user_id, type: TokenType.REFRESH_TOKEN };

    const access_token = this.jwtService.sign(access_token_payload, { expiresIn: '15m', secret: JWT_ACCESS_SECRET });
    const refresh_token = this.jwtService.sign(refresh_token_payload, { expiresIn: '7d', secret: JWT_REFRESH_SECRET });

    return { access_token, refresh_token };
  }

  async createUser(payload: TraditionalUserRegisterDto) {
    const user_row = await this.userRepository.findOne({ where: { email: payload.email.toLowerCase() } });
    if (user_row) throw new BadRequestException({ success: false, message: 'Email already exists.' });

    const user = new User();
    user.full_name = payload.full_name;
    user.email = payload.email.toLowerCase();
    user.password = payload.password;

    await this.userRepository.save(user);

    return { success: true, message: 'User created.' };
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
