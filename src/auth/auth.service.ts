import { BadRequestException, Injectable } from '@nestjs/common';
import { TraditionalUserLoginDto, TraditionalUserRegisterDto } from './dto/auth.dto';
import { UserRepository } from '../user/repositories/user.repository';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private userRepository: UserRepository) {}

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
      select: { id: true },
    });

    if (!user) throw new BadRequestException({ success: false, message: 'Invalid credentials.' });

    const isPasswordValid: boolean = await user.comparePassword(payload.password);

    if (!isPasswordValid) throw new BadRequestException({ success: false, message: 'Invalid credentials.' });
  }
}
